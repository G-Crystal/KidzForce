appControllers

    .controller('checkInCtrl',
        ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', 'ChildService', '$ionicLoading',
            function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, ChildService, $ionicLoading) {


                $scope.profile = $localStorage['child'];

                $scope.mapMaximized = false;
                $scope.checkingIn = false;

                ChildService.viewChore($rootScope.checkIn.data.project_id).then(
                    function(data){
                        console.log(data);
                        $scope.chore = data;
                        var defaultPos = new google.maps.LatLng(data.home.lat, data.home.lng);

                        var mapOptions = {
                            center: defaultPos,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            zoom: 16,
                            scrollwheel: false,
                            panControl: false,
                            zoomControl: false,
                            scaleControl: false,
                            mapTypeControl: false,
                            streetViewControl: false,
                            styles: $rootScope.mapStyle
                        };

                        setTimeout(function(){
                            var map = new google.maps.Map(document.getElementById("checkInMap"), mapOptions);
                            $scope.map = map;
                        }, 200);
                    },
                    function (error){
                        console.error(error);
                    });

                $scope.checkIn = function(chore_id){
                    $scope.checkingIn = true;
                  $rootScope.showLoader();
                    ChildService.checkIn(chore_id).then(
                        function(success){
                            $ionicLoading.hide();
                            $rootScope.hasCheckIn = false;
                            $rootScope.checkIn = null;
                            
                            $rootScope.showPopup('Project started', 'When finished, press complete on the project card.', '').then(
                                function(){
                                    $rootScope.modal.hide();
                                });
                            
                        },
                        function(error){
                            $ionicLoading.hide();
                            $rootScope.showPopup('Unable to check-in', 'This could be related to a system error, please try again later.', 'error');
                        });
                };
            }
        ]
    );
