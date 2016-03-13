(function () {
    'use strict';

    angular
        .module('app')
        .controller('Manual.ManualController', Controller);

    function Controller($rootScope, GradeService, UserService, $scope, DocumentService, $stateParams) {
        var vm = this;

        $scope.pdfUrl = '';

        vm.user = {};

        vm.availableGrades = [];

        initController();

        function initController() {
            UserService.GetCurrent().then(function(user){
                vm.user = user;
                $rootScope.currentUser = user;
            });

            DocumentService.GetById($stateParams.id).then(function(document){
                vm.document = document;
                $scope.pdfUrl =  '/pdf/' + document.filePath + '.pdf';
            })

        }
    }

})();