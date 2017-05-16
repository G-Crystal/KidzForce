appControllers

    .controller('rewardCtrl',
        ['$scope', '$rootScope', '$state', 'ChildService', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', 'ChildrenService', 'ProjectService', 'ParentService',
            function($scope, $rootScope, $state, ChildService, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, ChildrenService, ProjectService, ParentService) {
                $scope.profile = $localStorage['child'];

                $scope.rewards = [];
                $scope.allRewards = [];
                $scope.itteration = 1;

                $scope.primaryPayoutMethod = '';
                $scope.getPrimaryPayoutMethod = function(uid){
                    ParentService.getPayoutMethods(uid, false).then(function(payoutMethods){
                        if (typeof(payoutMethods.$value) == 'undefined'){
                            $scope.primaryPayoutMethod = payoutMethods[Object.keys(payoutMethods)[0]].account_number;
                        }else{
                            $scope.primaryPayoutMethod = '';
                        }
                    }, function(error){
                        console.log(error);
                    });
                    $scope.primaryPayoutMethod = '';
                };

                $scope.moreDataAvailable = true;
                $scope.reload = function(){
                    if (Object.keys($scope.allRewards).length == 0){
                        ChildService.getRewards().then(
                            function(response){
                                $scope.allRewards = response;
                                $scope.reload();
                            },
                            function(error){
                                
                            });
                    }else{
                        if (Object.keys($scope.allRewards).length != Object.keys($scope.rewards).length){
                            if ($scope.itteration == 0){
                                $scope.start = 0;
                                $scope.end = 5;
                            }else{
                                $scope.start = 5 * ($scope.itteration-1);
                                $scope.end = 5 * $scope.itteration;
                            }

                            var notifications = ($scope.allRewards.slice($scope.start, $scope.end)); //start, end
                            for (var i = 0; i < Object.keys(notifications).length; i++) {
                                $scope.rewards = $scope.rewards.concat(notifications[i]);
                            }
                        }else{
                            $scope.moreDataAvailable = false;
                        }

                        $scope.itteration += 1;
                    }
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                };

                $scope.showLoader();
                $scope.reload();

                $scope.redeemReward = function(rewardId){
                    $rootScope.showLoader();
                    ChildService.requestReward(rewardId).then(
                        function(success){
                            $ionicLoading.hide();
                            $rootScope.showPopup('Reward Redeemed', 'We have sent your reward to your parents email.', '');
                        },
                        function(error){
                            $ionicLoading.hide();
                            $rootScope.showPopup('Unable to reward', 'This could be related to a system error, please try again later.', 'error');
                        }
                    );
                };

                $scope.deposit = function(){
                    ChildService.requestDeposit().then(
                        function(success){
                            $scope.profile.num_of_cash = 0;
                            // $rootScope.showPopup('ON THE WAY', 'Your transaction is completed, funds will be available in 1 - 3 business days.');
                            $rootScope.showPopup('Deposit complete', 'Your transaction is completed, funds will be available in 1 - 3 business days.', '');
                        },
                        function(error){
                            $rootScope.showPopup('Unable to deposit', 'This could be related to a system error, please try again later.', 'error');
                        }
                    );
                    
                };

                if ($rootScope.isParent()){
                    var uid = $localStorage['uid'];
                }else{
                    var uid = $localStorage['child']['member-id'];
                    $scope.getPrimaryPayoutMethod(uid);
                }

                ChildrenService.getChildBalanceForParent(uid).then(
                    function(balanceObj){
                        if (typeof(balanceObj.$value) == 'undefined'){
                            if (balanceObj.rank == 'associate' && $rootScope.isParent()){
                                balanceObj.rank = 'bronze';
                            }
                            $scope.balance = balanceObj;
                        }else{
                            $scope.balance = {
                                points: 0
                            };
                        }
                    });

                $scope.reviews = [];
                $scope.projects = {};
                $rootScope.showLoader();
                ChildService.getReviews(uid).then(
                  function(reviews){
                    $scope.reviews = reviews;
                    $ionicLoading.hide();
                    
                    for (var i = 0; i < $scope.reviews.length; i++) {
                      var reviewObject = $scope.reviews[i];

                      console.log(reviewObject);
                    
                      ProjectService.getChoreById(reviewObject.project).then(
                        function(projectObject){
                            console.log(projectObject);
                          $scope.projects[reviewObject.project] = projectObject;
                        });
                    }
                  },
                  function(error){
                    console.error(error);
                  }
                );


            }
        ]
    );