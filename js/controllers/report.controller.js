appControllers

    .controller('reportCtrl',
        ['$scope', '$rootScope', '$state', 'ChildService', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService',
            function($scope, $rootScope, $state, ChildService, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService) {
                $scope.params = $rootScope.help;

                $scope.sendReport = function(){
                    $rootScope.showPopup('Report Filed', 'We have filed your report and will be in contact shortly.').then(function(){
                        $rootScope.modal.hide();
                    });
                };
            }
        ]
    );