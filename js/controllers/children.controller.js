appControllers

    .controller('childrenCtrl', ['$scope', '$state', '$rootScope', 'ParentService', 'ionicDatePicker', '$ionicLoading', 'ChildrenService', '$localStorage', '$ionicPopup', 'iosActionSheet',
    function($scope, $state, $rootScope, ParentService, ionicDatePicker, $ionicLoading, ChildrenService, $localStorage, $ionicPopup, iosActionSheet) {
        $scope.isEmpty = false;
        $scope.dataLoaded = false;
        $scope.children = [];
        $scope.childrenBalances = {};

        $scope.hasChildren = function() {
            if ($scope.children.length > 0) {
                return true;
            } else {
                return false;
            }
        };

        $scope.init = function(){
          ChildrenService.getChildrenForParent($localStorage['uid']).then(
              function(childrenObjects) {
                  $scope.children = childrenObjects;

                  for (var i = 0; i < childrenObjects.length; i++) {
                    var currentChildId = childrenObjects[i].id;
                    ChildrenService.getChildBalanceForParent(currentChildId).then(function(balanceObject){
                      $scope.childrenBalances[balanceObject.$id] = balanceObject;
                    });
                  }

                  if ($scope.children.length == 0) {
                      $scope.isEmpty = true;
                  }
                  $scope.dataLoaded = true;
              });

          setInterval(function() {
              // console.log('checking');
              // console.log(new_val);
              if ($scope.children.length == 0) {
                  $scope.isEmpty = true;
              } else {
                  $scope.isEmpty = false;
              }
          }, 500);
        };

        $scope.init();

        $scope.manageChild = function(childId) {
            if (window.isBrowserMode || !window.cordova) {
                //manage action sheet
                var options = [];

                options = options.concat({
                  text: 'Edit Child',
                  onClick: function(){
                    $rootScope.showAddChildModal(childId);
                  }
                });

                options = options.concat({
                  text: 'View Childs Resume',
                  onClick: function(){
                    $rootScope.viewChildProfile(childId);
                  }
                });

                options = options.concat({
                  text: 'Delete Child',
                  onClick: function(){
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Delete child?',
                        template: 'Are you sure you want to delete this child? This can not be undone.'
                      });

                      confirmPopup.then(function(res) {
                      if (res) {
                          $rootScope.showLoader();
                          //delete project
                          ParentService.deleteChild(childId).then(
                              function() {
                                  $ionicLoading.hide();
                                  $rootScope.showPopup('Child deleted', 'This child has been deleted.').then(function(){
                                    $scope.init();
                                  });
                              },
                              function() {
                                  $ionicLoading.hide();
                                  $rootScope.showPopup('Unable to delete child', 'We were unable to delete this child. This could be related to a system error, please try again later.', 'error');
                              });
                      }
                      });
                  },
                  color: true
                });

                options = options.concat({
                  text: 'Cancel',
                  bold: true
                });

                iosActionSheet(options).then(function(data){
                    $scope.output = data;
                  }, function(){
                    $scope.output = 'rejected';
                  });
            } else {
                var options = {
                    androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT, // material
                    buttonLabels: ['Edit Child', 'View Childs Resume'],
                    addCancelButtonWithLabel: 'Cancel',
                    androidEnableCancelButton: true,
                    winphoneEnableCancelButton: true,
                    addDestructiveButtonWithLabel: 'Delete Child',
                    destructiveButtonLast: true // you can choose where the destructive button is shown
                };
                window.plugins.actionsheet.show(options, function(buttonIndex) {
                    if (buttonIndex == 1){
                      //edit child
                      $rootScope.showAddChildModal(childId);
                    }else if (buttonIndex == 2){
                      //view child
                      $rootScope.viewChildProfile(childId);
                    }else if (buttonIndex == 3){
                      //delete child
                      var confirmPopup = $ionicPopup.confirm({
                        title: 'Delete child?',
                        template: 'Are you sure you want to delete this child? This can not be undone.'
                      });

                      confirmPopup.then(function(res) {
                      if (res) {
                          $rootScope.showLoader();
                          //delete project
                          ParentService.deleteChild(childId).then(
                              function() {
                                  $ionicLoading.hide();
                                  $rootScope.showPopup('Child deleted', 'This child has been deleted.').then(function(){
                                    $scope.init();
                                  });
                              },
                              function() {
                                  $ionicLoading.hide();
                                  $rootScope.showPopup('Unable to delete child', 'We were unable to delete this child. This could be related to a system error, please try again later.', 'error');
                              });
                      }
                      });
                    }else if (buttonIndex == 4){
                      //cancel action
                      console.log('cancel');
                    }

                    // if (buttonIndex - 1 == 0) {
                    //     //edit
                    //     $rootScope.showEditProjectModal(childId);
                    // } else if (buttonIndex - 1 == 1) {
                    //     //delete
                    //     var confirmPopup = $ionicPopup.confirm({
                    //         title: 'Cancel Chore?',
                    //         template: 'Are you sure you want to cancel this chore? This can not be undone.'
                    //     });

                    //     confirmPopup.then(function(res) {
                    //         if (res) {
                    //             $rootScope.showLoader();
                    //             //delete project
                    //             ProjectService.deleteProject(childId).then(
                    //                 function() {
                    //                     $ionicLoading.hide();
                    //                     $rootScope.showPopup('Chore deleted', 'This chore has been deleted.');
                    //                 },
                    //                 function() {
                    //                     $ionicLoading.hide();
                    //                     $rootScope.showPopup('Unable to delete chore', 'We were unable to delete this chore. This could be related to a system error, please try again later.', 'error');
                    //                 });
                    //         }
                    //     });
                    // } else {
                    //     //unknown action assume cancel
                    // }
                    // //}else if (buttonIndex == 1){
                    // //duplicate
                    // //}else if (buttonIndex == 2){
                    // //delete
                    // //}else{
                    // //unknown action assume cancel
                    // //}
                });
            }
        };
    }
]);