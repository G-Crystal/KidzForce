appControllers

    .controller('menuPlusCtrl', ['$scope', '$rootScope',
        function($scope, $rootScope){
            $scope.multiActionActive = false;
            $scope.activateMultiAction = function(){
              $scope.multiActionActive = !$scope.multiActionActive;
            };
            $scope.multiActionActiveCheck = function(){
              if ($scope.multiActionActive){
                return 'active';
              }else{
                return 'inactive';
              }
            };
        }
    ])

    .controller('webCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', '$firebaseAuth', '$cordovaOauth', 'ParentService', '$sce', '$compile', 'ProjectService',
        function($scope, $rootScope, $state, $stateParams, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, $firebaseAuth, $cordovaOauth, ParentService, $sce, $compile, ProjectService) {
            $rootScope.content = '';
            $rootScope.showHomeSection = true;

            if (firebase.auth().currentUser != null){
                if (!$localStorage['checked']){
                    $rootScope.showLoader();
                    AuthService.checkIfEmailExists(firebase.auth().currentUser.email).then(
                        function(response){
                            //doesnt exist
                            // console.log(response);
                            $ionicLoading.hide();

                            $localStorage['checked'] = false;
                            AuthService.reset();
                        },
                        function(response){
                            //does exist
                            // console.log(response);
                            $ionicLoading.hide();
                            $localStorage['checked'] = true;
                        });
                }
            }

            $scope.loadInit = function() {

                $rootScope.showLoader();
                $http.get(location.origin + '/app/api/parent/dashboard?api_token='+encodeURIComponent($localStorage['uid']), {})
                    .then(function(response) {
                        $ionicLoading.hide();
                        $rootScope.content = $sce.trustAsHtml(response.data);
                        $rootScope.showHomeSection = false;

                        setTimeout(function() {
                            var $div = $('ion-tabs');
                            angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                $compile($div)(scope);
                                scope.$digest();
                            });
                        }, 200);

                        setTimeout(function() {
                            var $div = $('[ng-controller="notificationCtrl"]');
                            angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                $compile($div)(scope);
                                scope.$digest();
                            });

                            setTimeout(function() {
                                var $div = $('[ng-controller="choresCtrl"]');
                                angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                    var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                    $compile($div)(scope);
                                    scope.$digest();
                                });
                            }, 200);

                            setTimeout(function() {
                                var $div = $('[ng-controller="childrenCtrl"]');
                                angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                    var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                    $compile($div)(scope);
                                    scope.$digest();
                                });
                            }, 200);

                            setTimeout(function() {
                                var $div = $('[ng-init="initMap(\'googlemaps2\')"]');
                                angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                    var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                    $compile($div)(scope);
                                    scope.$digest();
                                });
                            }, 200);
                        }, 200);
                    });
            };


            $scope.initMap = function(identifer) {
                if ($rootScope.isParent()) {
                    if (typeof($localStorage['parent']['home']) == 'undefined' || $localStorage['parent']['home'] == null){
                        $scope.home = [0,0];
                    }else{
                        $scope.home = [$localStorage['parent']['home']['lat'], $localStorage['parent']['home']['lng']];
                    }
                } else {
                    $scope.home = [$localStorage['child']['home']['lat'], $localStorage['child']['home']['lng']];
                }
                $scope.home = [34.093762, -83.723869];
                var defaultPos = new google.maps.LatLng($scope.home[0], $scope.home[1]);

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

                setTimeout(function() {
                    var map = new google.maps.Map(document.getElementById(identifer), mapOptions);

                    var homeMarker = new google.maps.Marker({
                        position: defaultPos,
                        map: map,
                        icon: 'app/int-test/img/icons/home-marker.png',
                        animation: google.maps.Animation.DROP
                    });

                    $scope.map = map;
                    // navigator.geolocation.getCurrentPosition(function(pos) {
                    //     $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                    //     var GeoMarker = new GeolocationMarker($scope.map);
                    // });

                    var firebaseRef = firebase.database().ref().child('chore-locations');

                    // Create a GeoFire index
                    var geoFire = new GeoFire(firebaseRef);

                    geoQuery = geoFire.query({
                        center: [$scope.home[0], $scope.home[1]],
                        radius: 322
                    });

                    // geoQuery.updateCriteria({
                    //     center: [34.093762, -83.7238687],
                    //     radius: 322
                    // });

                    // window.g = geoQuery;

                    // geoQuery.on("ready", function() { });

                    // geoQuery.on("key_entered", function(key, location, distance) {
                    //     console.log('Key entered for chore');
                    //     ProjectService.getChoreById(key.replace('chore-', '')).then(
                    //         function(choreObject) {
                    //             if (choreObject.status != 'completed' && (choreObject.child_uid == 0 || choreObject.child_uid == $scope.uid) && choreObject.status != 'inactive'){
                    //                 if (
                    //                     location[0] != parseFloat($scope.home[0]) &&
                    //                     location[1] != parseFloat($scope.home[1]) &&
                    //                     (!$rootScope.isParent() || window.isBrowserMode)
                    //                 ) {
                    //                     var jobMarker = new google.maps.Marker({
                    //                         position: new google.maps.LatLng(location[0], location[1]),
                    //                         map: $scope.map,
                    //                         icon: 'img/icons/marker.png',
                    //                         animation: google.maps.Animation.DROP
                    //                     });
                    //                     $scope.markers[key] = jobMarker;
                    //                 }
                    //             }
                    //         });

                    // });

                    // geoQuery.on("key_exited", function(key, location, distance) {
                        
                    // });
            

                    // $scope.centerChanged = function() {
                    //     var center = $scope.map.getCenter().toJSON();

                    //     $scope.currentLocation.lat = center.lat;
                    //     $scope.currentLocation.lng = center.lng;

                    //     geoQuery.updateCriteria({
                    //         center: [$scope.currentLocation.lat, $scope.currentLocation.lng],
                    //         radius: $scope.currentLocation.radius
                    //     });
                    // };

                    // setTimeout(function(){
                    //     $scope.map.setCenter(new google.maps.LatLng(34.093762, -83.7238687));
                    // }, 200);

                }, 200);
            };

            $scope.multiActionActive = false;
            $scope.activateMultiAction = function(){
              $scope.multiActionActive = !$scope.multiActionActive;
            };
            $scope.multiActionActiveCheck = function(){
              if ($scope.multiActionActive){
                return 'active';
              }else{
                return 'inactive';
              }
            };

            
        }
    ]);
