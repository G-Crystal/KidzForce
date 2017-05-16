appControllers

    .controller('helpMeCtrl',
        ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', 'ChildService', 'ParentService', '$ionicScrollDelegate', '$cordovaContacts',
            function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, ChildService, ParentService, $ionicScrollDelegate, $cordovaContacts) {
              $scope.first_contact = null;
              $scope.second_contact = null;
              $scope.getContactList = function(place) {
                navigator.contacts.pickContact(function(contact){
                    console.log('The following contact has been selected:' + JSON.stringify(contact));
                    $scope.$apply(function(){
                      if (place == 1){
                        $scope.first_contact = contact;
                      }else{
                        $scope.second_contact = contact;
                      }
                      ChildService.storeContacts($localStorage['child']['member-id'], contact).then(
                        function(response){
                          console.log(response);
                        });
                    });
                },function(err){
                    console.error('Error: ' + err);
                });
              };

              ChildService.getEmergencyContacts($localStorage['child']['member-id']).then(
                function(contacts){
                  $scope.contacts = contacts;
                  for (var i = 0; i < $scope.contacts.length; i++) {
                    if ($scope.first_contact == null){
                      $scope.first_contact = $scope.contacts[i];
                    }else{
                      $scope.second_contact = $scope.contacts[i];
                    }
                  }
                }
              );

              $scope.sendEmergency = function(){
                // var options = {
                //     replaceLineBreaks: false, // true to replace \n by a new line, false by default
                //     android: {
                //         intent: 'INTENT'  // send SMS with the native android SMS messaging
                //         //intent: '' // send SMS without open any other app
                //     }
                // };

                // var success = function () {  };
                // var error = function (e) {  };
                // navigator.geolocation.getCurrentPosition(function(pos) {
                //     //sms.send($scope.first_contact.phoneNumbers[0].value, 'I am sending an alert with my location through KidzForce. comgooglemaps://?center=' + pos.coords.latitude + ',' + pos.coords.longitude + '&zoom=14&views=traffic', options, success, error);
                //     //sms.send($scope.second_contact.phoneNumbers[0].value, 'I am sending an alert with my location through KidzForce. comgooglemaps://?center=' + pos.coords.latitude + ',' + pos.coords.longitude + '&zoom=14&views=traffic', options, success, error);
                //     $rootScope.showPopup('Contacts Notified', 'We have notifed your emergency contacts.');
                // });

                ChildService.requestHelp($scope.first_contact.phoneNumbers[0].value, $scope.second_contact.phoneNumbers[0].value).then(function(){
                  console.log('sent alert');
                  $rootScope.showPopup('Contacts Notified', 'We have notifed your emergency contacts.')
                });
                
              };
            }
        ]
    );
