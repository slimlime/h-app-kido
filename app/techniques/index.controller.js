﻿(function () {
    'use strict';

    angular
        .module('app')
        .controller('Techniques.IndexController', Controller);

    function Controller($window, $rootScope, $state, TechniqueService, FlashService, GradeService, UserService) {
        var vm = this;
        vm.deleteTechnique = deleteTechnique;
        vm.editTechnique = editTechnique;
        vm.create = create;
        vm.dismiss = dismiss;
        vm.user = {};


        vm.technique = null;

        var isEdit = false;
        var index = -1;


        vm.techniques = [];

        initController();

        function initController() {
            TechniqueService.GetAll().then(function (techniques){
                vm.techniques = techniques;
            })

            UserService.GetCurrent().then(function(user){
                vm.user = user;
            })

        }

        function deleteTechnique(id) {
            TechniqueService.Delete(id)
                .then(function () {
                    refresh();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

        function editTechnique(technique, indexs) {
            vm.technique = technique;
            isEdit = true;
            index = indexs;
        }

        function refresh() {
            TechniqueService.GetAll().then(function (techniques){
                vm.techniques = techniques;
            })
        }

        function dismiss(technique) {
            if(isEdit == true) {
                TechniqueService.GetById(technique._id)
                    .then(function (newTechnique) {
                        vm.techniques[index] = newTechnique;
                    })
            }
            vm.technique = null;

        }

        function create() {
            vm.technique.grade = GradeService.GetCurrent(vm.technique.grade.grade);
            if(isEdit == true){
                TechniqueService.Update(vm.technique)
                    .then(function () {
                        FlashService.Success('Technique updated');
                        isEdit = false;
                        refresh();
                        vm.technique = null;
                    })
                    .catch(function (error) {
                        FlashService.Error(error);
                    });
            } else {
                TechniqueService.Create(vm.technique)
                    .then(function () {
                        FlashService.Success('Technique created');
                        refresh();
                        vm.technique = null;
                    })
                    .catch(function (error) {
                        FlashService.Error(error);
                    });
            }

        }

    }

})();