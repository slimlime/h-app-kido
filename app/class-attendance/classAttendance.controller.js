(function () {
    'use strict';

    angular
        .module('app')
        .controller('ClassAttendance.ClassAttendanceController', Controller);

    function Controller($window, $rootScope, $scope, GoogleService, FlashService, UserService) {
        var vm = this;

        vm.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        vm.user = null;
        var daysArray = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        vm.dates = [];
        var firstTrainingColumn = 0;
        var lastTraingingColumn = 0;
        vm.studentsAttendance = [];
        vm.sheetNames = [];
        $scope.tableDataLoaded = false;
        vm.getSheetData = getSheetData;
        var tries = 0;
        vm.isLoading = true;

        //forMobile
        vm.sortByMonth = "";
        vm.sortByDate = "";
        vm.sortedAttendance = [];
        vm.displayByDate = displayByDate;


        initController();

        function initController() {
            if($rootScope.currentUser == null){
                UserService.GetCurrent().then(function (user) {
                    vm.user = user;
                    $rootScope.currentUser = user;
                });
            } else {
                vm.user = $rootScope.currentUser;
            }
        }

        $window.getUserForGoogleAuthentication = function() {
            if($rootScope.currentUser == null){
                UserService.GetCurrent().then(function (user) {
                    vm.user = user;
                    $rootScope.currentUser = user;
                    googleAuthentication()

                });
            } else {
                angular.element(document).ready(function () {
                    googleAuthentication()
                });
            }
        };

        window.getUserForGoogleAuthentication();

        function googleAuthentication(){
            if(vm.user.isAdmin && !$rootScope.googleHasBeenAuthenticated){
                GoogleService.checkAuth().then(function(result){
                    //Check auth passed
                    googleGetSheetNames()
                }, function(error){
                    //if check auth failed check again with immidiate false
                    GoogleService.checkAuthImmidiateFalse().then(function(result) {
                        googleGetSheetNames();
                    }, function(error){
                        FlashService.error("Google Authentication Failed please make sure you press allow on the google pop up");
                    });

                });
            } else if(vm.user.isAdmin && $rootScope.googleHasBeenAuthenticated){
                //if check auth had already passed then continue
                googleGetSheetNames();
            }
        }



        function googleGetSheetNames(){
            if($rootScope.googleHasBeenAuthenticated){
                GoogleService.callScriptFunction("getSheets").then(function(result){
                    vm.sheetNames = result;
                    vm.sortByMonth = vm.sheetNames[0];
                    getSheetData();
                }, function(error){
                    FlashService.Error(error);
                });
            }else if($rootScope.googleHasBeenAuthenticated === false && tries != 1){
                console.log("Attemp Auth 2");
                tries = 1;
                googleAuthentication();
            }

        }

        function getSheetData(){
            vm.isLoading = true;
            vm.buttonsDisabled = true;

            GoogleService.callScriptFunction("getDataByMonth", vm.sortByMonth).then(function(result){
                vm.dates = [];
                vm.studentsAttendance = [];
                firstTrainingColumn = _.findIndex(result[0], findDay);
                lastTraingingColumn = _.findLastIndex(result[0], findDay);
                constructDates(result);
                vm.sortByDate = vm.dates[0];
                populateStudentAttendance(result);
                UserService.GetAll().then(function(users){
                    populateUsersAttendance(users);
                    if(vm.isMobile){
                        displayByDate();
                    }
                    vm.isLoading = false;
                });
            }, function(error){
                FlashService.Error(error);
            });
        }

        function populateUsersAttendance(users){
            _.each(users, function(user){
                var studentAttendance = _.find(vm.studentsAttendance, function(student){
                    if(student.name.trim() == (user.firstName + " " + user.lastName)){
                        return true;
                    }
                });

                if(studentAttendance != null){
                    //user.attendance = [];
                    _.each(studentAttendance.attendance, function(attended){
                        if(attended.didAttend == 1){
                            var attend = _.find(user.attendance, function(userAttened){
                                if(userAttened == attended.date.trim()){
                                    return true;
                                }
                            });
                            if(attend == null){
                                if(user.attendance == undefined){
                                    user.attendance = [];
                                }
                                user.attendance.push(attended.date);
                            }
                        }
                    });

                    UserService.Update(user);
                }
            });

        }

        function populateStudentAttendance(result){
            //vm.studentAttendance
            //student - name - array of attendance

            _.each(result, function(row){
                var student = {};
                student.attendance = [];
                _.each(row, function(column, index){
                    if(index == 1){
                        student.name = column;
                    }

                    if(index >= firstTrainingColumn && index <= lastTraingingColumn){
                        var attended = {};
                        attended.date = vm.dates[index - firstTrainingColumn].date;
                        attended.didAttend = column;
                        student.attendance.push(attended);
                    }

                });

                if(student.name != null && student.name != "" && student.name != "Name"){
                    vm.studentsAttendance.push(student);
                }
            });
        }

        function findDay(day) {
            return _.find(daysArray, function (dayName) {
                if (day == dayName) {
                    return true;
                }
            });
        }

        function constructDates(result){
            _.each(result[0], function(dateName, index){
                var date = {};
                if(index >= firstTrainingColumn && index <= lastTraingingColumn){
                    date.dayName = dateName;
                    vm.dates.push(date);
                }
            });

            //date number
            _.each(result[1], function(dateName, index){
                if(index >= firstTrainingColumn && index <= lastTraingingColumn){
                    vm.dates[index - firstTrainingColumn].dateNumber = dateName;
                }
            });

            _.each(result[2], function(dateName, index){
                if(index >= firstTrainingColumn && index <= lastTraingingColumn){
                    vm.dates[index - firstTrainingColumn].date = dateName;
                }
            });
        }

        function displayByDate(){
            vm.sortedAttendance = [];
            _.each(vm.studentsAttendance, function(student){
               var studentByDate = {};
                studentByDate.name = student.name;
                studentByDate.attended = _.find(student.attendance, function(attendance){
                    if(attendance.date == vm.sortByDate.date){
                        return true;
                    }
                })
                vm.sortedAttendance.push(studentByDate);

            });

        }

    }

})();