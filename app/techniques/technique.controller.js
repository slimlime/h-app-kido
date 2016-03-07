(function () {
    'use strict';

    angular
        .module('app')
        .controller('Technique.TechniqueController', Controller);

    function Controller($stateParams, UserService, TechniqueService) {
        var vm = this;
        vm.user = {};
        vm.technique = {};


        initController();

        function initController() {
            console.log($stateParams.id);
            UserService.GetCurrent().then(function(user){
                vm.user = user;
            })

            TechniqueService.GetById($stateParams.id).then(function(technique){
                vm.technique = technique;
                console.log(vm.technique);

            })

        }
    }

})();