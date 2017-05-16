// Controller of menu toggle.
// Learn more about Sidenav directive of angular material
// https://material.angularjs.org/latest/#/demo/material.components.sidenav
appControllers.controller('menuCtrl', function ($scope, $rootScope, $timeout, $log, $ionicHistory, $state, $ionicPlatform, $localStorage, AuthService, $ionicSideMenuDelegate, ChildService, ParentService) {

    // navigateTo is for navigate to other page
    // by using targetPage to be the destination state.
    // Parameter :
    // stateNames = target state to go

    $ionicSideMenuDelegate.canDragContent(false);

    $scope.navigateTo = function (stateName) {
        if ($ionicHistory.currentStateName() != stateName) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go(stateName);
            }
    };// End navigateTo.

    $scope.profile = {};

    setTimeout(function(){
        $scope.$apply(function(){
            if ($rootScope.isParent()){
                $scope.profile = $localStorage['parent'];
            }else{
                $scope.profile = $localStorage['child'];
                $scope.memberid = $scope.profile['member-id'];
            }

            $scope.profile.preferences.send_notifications = Boolean($scope.profile.preferences.send_notifications);
            $scope.$watch('profile.preferences.send_notifications', function(newValue, oldValue){
                if ( newValue !== oldValue ) {
                    if (!$rootScope.isParent()){
                        ChildService.sendNotificationPreferenceChange(newValue).then(function(){
                            console.log('updated');
                        });
                    }else{
                        ParentService.sendNotificationPreferenceChange(newValue).then(function(){
                            console.log('updated');
                        });
                    }
                }
            });
        });
    }, 200);



    $scope.$on('$ionicParentView.afterEnter', function(){
        // clearInterval($rootScope.interval);
    });

}); // End of menu toggle controller.
