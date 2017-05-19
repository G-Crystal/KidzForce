appControllers

    .controller('notificationCtrl', ['$scope', '$rootScope', '$sce', '$state', '$ionicPopup', '$ionicHistory', '$ionicGesture', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', '$q', '$interval', '$cordovaBadge', 'ProjectService', 'ChildService', 'ParentService', 'ChildrenService',
    function($scope, $rootScope, $sce, $state, $ionicPopup, $ionicHistory, $ionicGesture, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, $q, $interval, $cordovaBadge, ProjectService, ChildService, ParentService, ChildrenService) {

        if (!$rootScope.isParent()){
            // $rootScope.rooDailyDrops($localStorage['child']['member-id']);
        }else{
            // $rootScope.rooDailyDrops($localStorage['uid']);
        }

        $scope.isEmpty = false;

        $scope.setBadge = function(value) {
          if (!window.isBrowserMode){
            $cordovaBadge.hasPermission().then(function(result) {
                $cordovaBadge.set(value);
            }, function(error) {

            });
          }
        }

        $scope.clearBadge = function(){
          if (!window.isBrowserMode){
            $cordovaBadge.clear().then(function() {
            // You have permission, badge cleared.
            }, function(err) {
            // You do not have permission.
            });
          }
        }

        $scope.notifications = [];

        // // //console.log(JSON.stringify($scope.notifications));
        $scope.respond = function(notifiableId, response) {
            //$scope.showLoader();
            $scope.declineDialog().then(
                function(success) {
                    NotificationService.respond(notifiableId, response).then(
                        function(response) {
                            //console.log(response);
                            $ionicLoading.hide();
                        },
                        function(error) {
                            $ionicLoading.hide();
                        }
                    );
                },
                function(canceled) {
                    //console.log('Canceled request');
                }
            );
        };

        $scope.additionalAction = function(notification){
          if (notification.type == "App\\Notifications\\newNotifications\\Homeowner\\ApplicantOfferNotification"){
            $rootScope.viewChildProfile(notification.data.child_id);
          }
        };

        $scope.onClickNotification = function(key, type, id, star) {

            if (type == 'dismiss'){
                $ionicLoading.show();
                $scope.notifications[key].animate = 'zoomOut';
                NotificationService.notificationaction(id, type, star).then(
                    function(response) {
                        //setTimeout(function(){
                            //$scope.$apply(function(){
                                $ionicLoading.hide();
                                //$scope.reload();
                            //});
                        //}, 500);

                    },
                    function(error) {
                        $ionicLoading.hide();
                    }
                );
            }else{
               //$scope.confirmDialog('Are you sure?', 'You can not undo this action.', 'Confirm').then(
                //    function(success) {
                    
                    if (type == 'check-in'){
                        $rootScope.showCheckInModal($scope.notifications[key]);
                        // setTimeout(function(){
                        //     $scope.notifications.splice(key, 1);
                        // }, 5);
                    }else if (type == 'help'){
                        $rootScope.showReportModal('Project Ref: #' + $scope.notifications[key].data.project_id, 'Need help with this project.');
                        // setTimeout(function(){
                        //     $scope.notifications.splice(key, 1);
                        // }, 5);
                    }else{
                        $scope.notifications[key].animate = 'zoomOut';
                        // setTimeout(function(){
                        //     $scope.notifications.splice(key, 1);
                        // }, 5);
                        // //console.log(id);

                        $ionicLoading.show();
                        NotificationService.notificationaction(id, type, star).then(
                            function(response) {
                                //setTimeout(function(){
                                //    $scope.$apply(function(){
                                        $ionicLoading.hide();
                                        //$scope.reload();
                                //    });
                                //}, 500);

                            },
                            function(error) {
                                $ionicLoading.hide();
                            }
                        );
                    }
                //    },
                //    function(canceled) {
                //        //console.log('Canceled request');
                //    }
                //);
            }



            // response-additional-data.
        }

        $scope.actionOrInfoCard = function(type){
            if (type == 'App\\Notifications\\newNotifications\\Child\\RequestedRatingNotification' ||
                type == 'App\\Notifications\\newNotifications\\Homeowner\\ApplicantOfferNotification' ||
                type == 'App\\Notifications\\newNotifications\\Child\\ReceivedRequestForApplicationNotification' ||
                type == 'App\\Notifications\\newNotifications\\Project\\CheckedInNotification' ||
                type == 'App\\Notifications\\newNotifications\\Child\\CheckInNotification' ||
                type == 'App\\Notifications\\newNotifications\\Parent\\RequestForApplicationNotification'){
                return true;
            }else{
                return false;
            }
        };

        $scope.hasRating = function(type){
            if (type == 'App\\Notifications\\newNotifications\\Child\\RequestedRatingNotification' ||
                type == 'App\\Notifications\\newNotifications\\Child\\ReceivedRatingNotification'){
                return true;
            }else{
                return false;
            }
        };

        $scope.hasMap = function(type){
            /*if (type == 'App\\Notifications\\newNotifications\\Child\\CheckInNotification'){
                return true;
            }else{
                return false;
            }*/
            return false;
        };

        $scope.generateActions = function(type, project){

            var toReturn = [];
            //Action Cards
            switch (type){
                case 'App\\Notifications\\newNotifications\\Child\\RequestedRatingNotification':
                    toReturn = [
                        {
                            'name': 'SUBMIT',
                            'icon': 'ion-checkmark-round',
                            'action': 'submit-review'
                        },
                        {
                            'name': 'HELP',
                            'icon': 'ion-alert-circled',
                            'action': 'help'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Homeowner\\ApplicantOfferNotification':
                    toReturn = [
                        {
                            'name': 'ACCEPT',
                            'icon': 'ion-checkmark-round',
                            'action': 'accept'
                        },
                        {
                            'name': 'DECLINE',
                            'icon': 'ion-minus-circled',
                            'action': 'decline'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Child\\ReceivedRequestForApplicationNotification':
                    toReturn = [
                        {
                            'name': 'ACCEPT',
                            'icon': 'ion-checkmark-round',
                            'action': 'accept-project-offer'
                        },
                        {
                            'name': 'PASS',
                            'icon': 'ion-minus-circled',
                            'action': 'pass'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Project\\CheckedInNotification':
                    $rootScope.hasCheckIn = true;
                    $rootScope.checkIn = project;
                    toReturn = [
                        {
                            'name': 'START PROJECT',
                            'icon': 'ion-checkmark-round',
                            'action': 'check-in'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Child\\CheckInNotification':
                    toReturn = [
                        {
                            'name': 'COMPLETE',
                            'icon': 'ion-checkmark-round',
                            'action': 'complete'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Parent\\RequestForApplicationNotification':
                    toReturn = [
                        {
                            'name': 'ALLOW',
                            'icon': 'ion-checkmark-round',
                            'action': 'allow'
                        },
                        {
                            'name': 'DENY',
                            'icon': 'ion-checkmark-round',
                            'action': 'deny'
                        }
                    ];
                    break;
            }

            //Readonly Cards
            switch (type){
                case 'App\\Notifications\\newNotifications\\Child\\ReceivedRatingNotification':
                    break;

                case 'App\\Notifications\\newNotifications\\Child\\ApplicantAcceptedNotification':
                    break;

                case 'App\\Notifications\\newNotifications\\Homeowner\\ApplicantAcceptedNotification':
                    break;

                case 'App\\Notifications\\newNotifications\\Project\\CheckInNotification':
                    break;

                case 'App\\Notifications\\newNotifications\\Homeowner\\ApplicantDeclinedNotification':
                    break;
            }


            return toReturn;

        };

        // $scope.hasOffset = function(index){
        //     if (index > 0){
        //         return 'col-offset-10';
        //     }
        // };

        $scope.cardRightAction = function(notification){
            //Show Map Thumbnail
            /*if (notification.type == 'App\\Notifications\\newNotifications\\Child\\CheckInNotification'){
                return $sce.trustAsHtml('<img src="'+notification.data.geocoded_image+'" class="mapThumbnailCard" />');
            }*/
        };

        $scope.navigateToProjects = function(){
          return "#/app/parent/chores";
        };

        var uid = '';

        if ($rootScope.isParent()){
            uid = $localStorage['uid'];
        }else{
            uid = $localStorage['child']['member-id'];
        }

        NotificationService.getNotificationsFromFB(uid).then(
            function(notificationsObjects){
                $scope.notifications = notificationsObjects;
                $scope.cycleNotifications();
                $scope.notifications.$watch(function(event){
                    $scope.cycleNotifications();
                });
            });

        $scope.cycleNotifications = function(){
            if ($scope.notifications.length == 0){
                $scope.isEmpty = true;
            }else{
                $scope.isEmpty = false;
            }

            for (var i = 0; i < $scope.notifications.length; i++) {
                if (typeof($scope.notifications[i]['read_at']) != 'undefined'){
                    if ($scope.notifications[i]['read_at'] != ''){
                        $scope.notifications.$remove($scope.notifications[i]);
                        continue;
                    }
                }
                $scope.notifications[i]['animate'] = 'zoomIn';
                $scope.notifications[i]['isActionCard'] = $scope.actionOrInfoCard($scope.notifications[i]['type']);
                if ($scope.notifications[i]['isActionCard']){
                    $scope.notifications[i]['cardclass'] = 'actioncard';
                }else{
                    $scope.notifications[i]['cardclass'] = 'infocard';
                }
                $scope.notifications[i]['actions'] = $scope.generateActions($scope.notifications[i]['type'], $scope.notifications[i]);
                $scope.notifications[i]['cardRightAction'] = $scope.cardRightAction($scope.notifications[i]);
            }
        };

        if ($rootScope.isParent()){
            ParentService.getProfileFromFB($localStorage['uid']).then(
                function(profileObj){
                    console.log(profileObj);
                    $scope.profile = profileObj;
                    
                    // $scope.balance = {
                    //     number_of_total_projects: $scope.profile.num_of_total_projects,
                    //     number_of_completed_projects: $scope.profile.num_of_completed_projects,
                    //     avg_review_score: $scope.profile.avg_review_score,
                    // };

                    // $scope.$watch('profile', function(new_val, old_val){
                    //     if (new_val != old_val){
                    //         $scope.balance = {
                    //             number_of_total_projects: $scope.profile.num_of_total_projects,
                    //             number_of_completed_projects: $scope.profile.num_of_completed_projects,
                    //             avg_review_score: $scope.profile.avg_review_score,
                    //         };
                    //     }
                    // });
                });

            ChildrenService.getChildBalanceForParent($localStorage['uid']).then(
                function(balanceObj){
                    console.log(balanceObj);
                    $scope.balance = balanceObj;
                });
        }else{
            ChildService.getProfileFromFB($localStorage['child']['member-id']).then(
                function(profileObj){
                    $scope.profile = profileObj;
                });

            ChildrenService.getChildBalanceForParent($localStorage['child']['member-id']).then(
                function(balanceObj){
                    $scope.balance = balanceObj;
                });
        }

        $scope.profile = {
            rank: '',
            name: '',
            num_of_total_projects: 0,
            num_of_completed_projects: 0,
            avg_review_score: 0
        };

        // $scope.wordpress_posts = [];
        // $scope.times = 1;
        // WordPress.getPosts($scope.times)
        // .success(function (posts) {
        //     $scope.wordpress_posts = $scope.wordpress_posts.concat(posts.posts);
        //     $scope.$broadcast('scroll.infiniteScrollComplete');
        //     $scope.times = $scope.times + 1;
        //     if(posts.posts.length == 0) {
        //         $scope.postsCompleted = true;
        //     }
        // })
        // .error(function (error) {
        //     $scope.items = [];
        // });


    }
]);
