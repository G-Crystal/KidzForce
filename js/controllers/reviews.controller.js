appControllers

    .controller('reviewsCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', '$firebaseAuth', '$cordovaOauth', 'ChildService', '$sce', '$compile', 'ChildrenService', 'ProjectService',
        function($scope, $rootScope, $state, $stateParams, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, $firebaseAuth, $cordovaOauth, ChildService, $sce, $compile, ChildrenService, ProjectService) {
            $scope.reviews = [];
            $scope.projects = {};
            $rootScope.showLoader();
            ChildService.getReviews($rootScope.childId).then(
              function(reviews){
                console.log(reviews);
                $scope.reviews = reviews;
                $ionicLoading.hide();
                
                for (var i = 0; i < $scope.reviews.length; i++) {
                  var reviewObject = $scope.reviews[i];
                
                  ProjectService.getChoreById(reviewObject.project).then(
                    function(projectObject){
                      $scope.projects[reviewObject.project] = (projectObject);
                    });
                }
              },
              function(error){
                console.error(error);
              }
            );

            $scope._calculateAge = function(birthday) { // birthday is a date
                var ageDifMs = Date.now() - birthday.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            ChildService.getProfileFromFB($rootScope.childId).then(
              function(profile){
                $scope.profile = profile;
                $scope.profile.age = $scope._calculateAge(new Date($scope.profile.dob));
                // console.log($scope.profile);
                ChildrenService.getChildBalanceForParent($rootScope.childId).then(function(balanceObject){
                  $scope.balance = balanceObject;
                });
              });
        }
    ]);
