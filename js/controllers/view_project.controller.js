appControllers

    .controller('viewProjectCtrl', ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', 'ChildService', 'ParentService', 'ProjectService', '$ionicScrollDelegate',
    function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, ChildService, ParentService, ProjectService, $ionicScrollDelegate) {
        if ($rootScope.isParent()){
            $scope.uid = $localStorage['uid'];
        }else{
            $scope.uid = $localStorage['child']['member-id'];
            ChildService.getProfileFromFB($localStorage['child']['member-id']).then(
                function(profile){
                    $scope.profile = profile;

                    ChildService.getProjectApplications($localStorage['child']['member-id']).then(
                        function(applications){
                            $scope.applications = applications;
                        });
                });
        }
        //$rootScope.projectViewId
        console.log($rootScope.projectViewId);
        ProjectService.getChoreById($rootScope.projectViewId).then(
            function(choreObject){
                $scope.project = choreObject;
                var address = JSON.parse($scope.project.address);
                address = address.address + ' ' + address.address_2 + ' ' + address.city + ', ' + address.state + ' ' + address.zip;
                address = encodeURIComponent(address);
                $scope.mapview = 'https://maps.googleapis.com/maps/api/staticmap?center='+address+'&zoom=16&scale=2&size=400x400&maptype=roadmap&key=AIzaSyBhxSeZh75dG3_3fuIdXzivdbU_ue2NC9g&format=png&visual_refresh=true&markers=size:small|color:0x3A0554|label:|'+address;
                console.log(choreObject);
            }
        );

        $scope.hasApplied = function(project_id){
            for (var i = 0; i < $scope.applications.length; i++) {
                if ($scope.applications[i].project_id == project_id){
                    return true;
                }
            }

            return false;
        };

        $scope.manageProject = function(projectId){
            if (window.isBrowserMode || !window.cordova){
                //manage action sheet
            }else{
                var options = {
                  androidTheme : window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT, // material
                  title: 'What do you want to do with this chore?',
                  buttonLabels: ['Edit Project'],
                  addCancelButtonWithLabel: 'Cancel',
                  androidEnableCancelButton : true,
                  winphoneEnableCancelButton : true,
                  addDestructiveButtonWithLabel : 'Cancel Chore',
                  destructiveButtonLast: true // you can choose where the destructive button is shown
                };
                window.plugins.actionsheet.show(options, function(buttonIndex){
                    if (buttonIndex-1 == 0){
                        //edit
                        $rootScope.showEditProjectModal(projectId);
                    }else if (buttonIndex-1 == 1){
                        //delete
                        var confirmPopup = $ionicPopup.confirm({
                             title: 'Cancel Chore?',
                             template: 'Are you sure you want to cancel this chore? This can not be undone.'
                           });

                           confirmPopup.then(function(res) {
                             if(res) {
                               $rootScope.showLoader();
                               //delete project
                               ProjectService.deleteProject(projectId).then(
                                function(){
                                    $ionicLoading.hide();
                                    $rootScope.showPopup('Chore deleted', 'This chore has been deleted.');
                                },
                                function(){
                                    $ionicLoading.hide();
                                    $rootScope.showPopup('Unable to delete chore', 'We were unable to delete this chore. This could be related to a system error, please try again later.', 'error');
                                });
                             }
                           });
                    }else{
                        //unknown action assume cancel
                    }
                    //}else if (buttonIndex == 1){
                        //duplicate
                    //}else if (buttonIndex == 2){
                        //delete
                    //}else{
                        //unknown action assume cancel
                    //}
                });
            }
        };

        $scope.reportChore = function(chore_id) {
            $rootScope.showPopup('Reported', 'This chore has been flagged and is awaiting review by an Administrator.', 'error');
        };

        $scope.apply = function(chore_id) {
            $scope.showLoader();
            $scope.applying = true;
            ChildService.applyForChore(chore_id).then(
                function(success) {

                    //console.log(success);
                    // for (var i = 0; i < $scope.chores.length; i++) {
                    //     if ($scope.chores[i].project.id == chore_id) {
                    //         $scope.chores[i].project.applied = true;
                    //     }
                    // }
                    $ionicLoading.hide();
                    $scope.applying = false;
                    $scope.showPopup('Awaiting Approval', 'We have sent your request to the poster. We will notify you when they respond. ').then(function(){
                        $rootScope.projectViewModal.hide();
                    });
                    //$state.go('app.child-dashboard');
                },
                function(error) {
                    $ionicLoading.hide();
                    console.log(error);
                    $scope.applying = false;
                    $rootScope.showPopup('Unable to apply', 'This could be related to a system error, please try again later.', 'error');
                }
            );
        };

        $scope.projectStage = function(projectStage, stageNumber) {
            if (projectStage == 'posted'){
                projectStage = 1;
            }

            if (projectStage == 'accepted'){
                projectStage = 2;
            }

            if (projectStage == 'started'){
                projectStage = 3;
            }

            if (projectStage == 'reviewed'){
                projectStage = 4;
            }

            if (projectStage == 'completed'){
                projectStage = 5;
            }

            if (projectStage >= stageNumber) {
                return 'assertive';
            } else {
                return 'light';
            }
        };

        $scope.navigateToLocation = function(){
            var address = JSON.parse($scope.project.address);
            address = address.address + ' ' + address.address_2 + ' ' + address.city + ', ' + address.state + ' ' + address.zip;
                
            launchnavigator.navigate(address);
        };  
    }
]);