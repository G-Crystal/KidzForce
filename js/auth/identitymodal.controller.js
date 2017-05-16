appControllers

    .controller('signupIdentityModalCtrl', ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', '$timeout', '$ionicSlideBoxDelegate', 'ParentService', '$ionicModal', 'WizardHandler',
    function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, $ionicSlideBoxDelegate, $timeout, ParentService, $ionicModal, WizardHandler) {
        $scope.currentIndex = 0;

        $scope.params = {
            addressObject: {
              address: '',
              address_2: '',
              city: '',
              state: '',
              zip: ''
            },
            phone: '',
            ssn: '',
            tos: ''
        };

        $scope._calculateAge = function(birthday) { // birthday is a date
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        $scope.firstStepCompleted = function(){
            if ($scope.params.address != '' && $scope.params.phone != ''){
                return false;
            }else{
                return true;
            }
        };

        $scope.secondStepCompleted = function(){
            if ($scope.params.first_name != '' &&
                $scope.params.last_name != '' &&
                $scope.params.email != '' &&
                $scope.params.password != '' &&
                $scope.params.phone != ''){
                return false;
            }else{
                return true;
            }
        }

        $scope.next = function(index){
          if (window.cordova){
            cordova.plugins.Keyboard.close();
          }
            $rootScope.showLoader();
            var params = [];
            $scope.currentIndex = 1;
            $ionicLoading.hide();
        };

        $scope.prev = function(index){
            $scope.currentIndex = index;
        };

        $scope.submit = function(){
          if (window.cordova){
            cordova.plugins.Keyboard.close();
          }
          $rootScope.showLoader();
            ParentService.verifyIdentity($scope.params.addressObject, $scope.params.phone, $scope.params.ssn).then(
              function(success){
                $ionicLoading.hide();
                $rootScope.verifyIdentityModal.hide();
                // $ionicModal.fromTemplateUrl('http://ec2-107-21-160-8.compute-1.amazonaws.com/app/api/projects/add?api_token='+$localStorage['uid']+'&member-id='+$localStorage['uid']+'&Authorized_Member_ID='+$localStorage['uid'], {
                if ($rootScope.verifyIdentityToAddProject){
                  $ionicModal.fromTemplateUrl('templates/addproject.html', {
                      scope: $rootScope,
                      animation: 'slide-in-up'
                  }).then(function(modal) {
                      $rootScope.projectId = 0;
                      $rootScope.modal = modal;
                      $rootScope.modal.show();
                  });
                }
              },
              function(error){
                $ionicLoading.hide();
                $rootScope.showPopup('Unable to verify', 'Your identity could not be verified. Please contact KidzForce if you believe this is an error.');
              }
            );
        };

        $scope.countryCode = 'US';

        $scope.onAddressSelection = function (location) {
          $scope.params.addressObject.address = location.name;
   
          for (var i = 0; i < location.address_components.length; i++) {
            var component = location.address_components[i];

            if (component.types[0] == 'locality'){
              $scope.params.addressObject.city = component.long_name;
            }

            if (component.types[0] == 'administrative_area_level_1'){
              $scope.params.addressObject.state = component.short_name;
            }

            if (component.types[0] == 'postal_code'){
              $scope.params.addressObject.zip = component.short_name;
            }
          }
            // $scope.params.address = location.formatted_address;
        };

        $scope.formValidSubmit = function(form, index){
          if (form.$valid){
            if (index == 1){
              WizardHandler.wizard().goTo('social');
            }else{
              WizardHandler.wizard().finish();
            }
          }
        };
    }
]);
