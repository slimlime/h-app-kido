describe("Personal Information.Controller.Test", function(){
    var $controller;
    var controller;
    var utils;
    var $rootScope;
    var $scope;
    var userService;
    var flashService;

    var user = {
        "_id": {
            "$oid": "56f125b6ddb0d01100f34deb"
        },
        "firstName": "Darryl",
        "lastName": "Cox",
        "username": "dcox",
        "grade": {
            "id": 2,
            "grade": "yellow2",
            "displayName": "Yellow 2"
        },
        "isFirstLogin": false,
        "hash": "$2a$10$YforekNRJvFlVJyLHxOhseiovo20gQ.wt4QhJyP2HfoByCdA/kWgC",
        "isAdmin": null,
        "attendance": [
            "21-Jan-16",
            "28-Jan-16",
            "3-Mar-16",
            "8-Mar-16",
            "10-Mar-16",
            "15-Mar-16",
            "17-Mar-16",
            "22-Mar-16",
            "29-Mar-16",
            "9-Feb-16",
            "11-Feb-16",
            "18-Feb-16",
            "23-Feb-16"
        ],
        "grades": [
            {
                "date": "2016-02-25T00:00:00.000Z",
                "grade": "Yellow 1"
            },
            {
                "date": "2016-03-03T00:00:00.000Z",
                "grade": "Yellow 2"
            }
        ]
    };

    beforeEach(module("testUtils"));
    beforeEach(module("app"));

    beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, UserService, _utils_, $httpBackend, FlashService){
        //$httpBackend = $injector.get('$httpBackend');
        $httpBackend.when('GET', 'home/index.html').respond({ body: '<html><body>Mock homepage</body></html>'});


        $scope = _$rootScope_.$new();;
        $rootScope = _$rootScope_;
        userService = UserService;
        flashService = FlashService;
        utils = _utils_;
        utils.resolvePromise(UserService, 'GetCurrent', user);

        $controller = _$controller_;
        controller = $controller('Account.PersonalInformation', { $scope: $scope, $rootScope: $rootScope, UserService: userService, FlashService: flashService });

        $scope.$apply();

    }));

    it('can get an instance of Classes Controller', function(){
        expect(controller).toBeDefined();
    });

    it('rootScope user should be defined', function(){
        expect($rootScope.currentUser).toBeDefined();
        expect($scope.user).toBeDefined();
        expect($rootScope.currentUser.firstName).toBe("Darryl");
    });

    it('saveUser successful', function(){
        $scope.confirmPassword = "newPassword";
        $scope.user.password = "newPassword";

        utils.resolvePromise(userService, 'Update', user);

        $scope.saveUser();
        $scope.$apply();
        expect($rootScope.flash.message).toBe('User updated');
    });

    it('saveUser successful', function(){
        $scope.confirmPassword = "newPassword";
        $scope.user.password = "something";

        $scope.saveUser();
        expect($rootScope.flash.message).toBe('The new password does not match the confirmation password');
    });

    it('saveUser error on update', function(){
        $scope.confirmPassword = "newPassword";
        $scope.user.password = "newPassword";

        utils.rejectPromise(userService, 'Update', 'error');

        $scope.saveUser();
        $scope.$apply();
        expect($rootScope.flash.message).toBe('error');
    });

    it('saveUser error on password', function(){
        $scope.confirmPassword = undefined;
        $scope.user.password = undefined;

        utils.rejectPromise(userService, 'Update', 'error');

        $scope.saveUser();
        $scope.$apply();
        expect($rootScope.flash.message).toBe('Please enter a password');
    });

});