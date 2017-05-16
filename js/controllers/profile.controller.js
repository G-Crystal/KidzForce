appControllers

    .controller('profileCtrl',
        ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'ChildService', '$http', 'NotificationService', 'ParentService',
            function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, ChildService, $http, NotificationService, ParentService) {

              if ($rootScope.isParent()){
                $scope.profile = $localStorage['parent'];
                $scope.identity = {};

                ParentService.getIdentity($localStorage['uid']).then(
                  function(identityObject){
                    $scope.identity = identityObject;
                  });

              }else{
                $scope.profile = $localStorage['child'];
                $scope.memberId = $scope.profile['member-id'];
              }

              console.log($scope.profile);


              $scope.getQRImageLink = function(){
                if (typeof($scope.memberId) != 'undefined'){
                  var qr = new QRious({
                    value: $scope.memberId
                  });
                  var qrImageLink = qr.toDataURL();
                  return qrImageLink;
                }
              };

              $scope.updateResume = function(){
                  $scope.showLoader();
                  ChildService.updateResume($scope.profile['member-id'], $scope.profile.resume).then(
                      function(success){
                          $ionicLoading.hide();
                          $scope.showSuccessPopup('Hooray!', 'Success message goes here');
                      },
                      function(error){
                          $ionicLoading.hide();
                          $scope.showErrorPopup('Oops!', 'Error message goes here');
                      }
                  );
              };

              $scope.newauth = {
                  password: '',
                  confirm: ''
              };

              $scope.isCompletedPassword = function(){
                if ($scope.newauth.password == '' || $scope.newauth.confirm == ''){
                  return false;
                }else{
                  return true;
                }
              };

              $scope.updatePassword = function(){
                  $scope.showLoader();

                  if ($scope.newauth.password != $scope.newauth.confirm){
                    $ionicLoading.hide();
                    $rootScope.showPopup('Password mismatch', 'The password you entered does not match the confirm password.');
                    return;
                  }

                  console.log($scope.profile);
                  if ($rootScope.isParent()){
                    firebase.auth().currentUser.updatePassword($scope.newauth.password).then(
                      function(success){
                        $ionicLoading.hide();
                        $rootScope.showPopup('Password updated', 'Your password has been updated.');
                      },
                      function(error){
                        $ionicLoading.hide();
                        $rootScope.showPopup('Problem updating', error.message);
                      }
                    );
                  }else{
                    ChildService.updatePassword($scope.profile['member-id'], $scope.newauth.password, $scope.newauth.confirm).then(
                        function(success){
                            $ionicLoading.hide();
                            $scope.showPopup('Password updated', 'Your password has been updated.');
                        },
                        function(error){
                            $ionicLoading.hide();
                            $rootScope.showPopup('Unable to update password', 'This could be related to a system error, please try again later.', 'error');
                        }
                    );
                  }
              };

              $scope.printCards  = function(){
                if (!window.isBrowserMode){
                  if (window.cordova){
                    console.log('http://api.kidzforce.com/business_cards/print.php?design=1&name='+encodeURIComponent($scope.profile.name)+'&member_id='+$scope.memberId+'&rank='+$scope.profile.rank+'&qr_code=' + encodeURIComponent($scope.getQRImageLink()));
                    cordova.plugins.printer.print('http://api.kidzforce.com/business_cards/print.php?design=1&name='+encodeURIComponent($scope.profile.name)+'&member_id='+$scope.memberId+'&rank='+$scope.profile.rank+'&qr_code=' + encodeURIComponent($scope.getQRImageLink()));
                  }

                  //$rootScope.showPopup('Printed', 'Your business cards have been sent to the printer.');
                }
              };

              $scope.purchasePremium = function(){
                  $rootScope.showLoader();
                  ProductsService.purchaseProduct('com.riveloper.KIDZ-BIZ-101.promo_pack').then(
                      function(success){
                          $ionicLoading.hide();
                          console.log(success);
                      },
                      function(error){
                          $ionicLoading.hide();
                          console.error(error);
                      }
                  );
              };

              $scope.updateAccount = function(){
                $rootScope.verifyIdentityToAddProject = false;
                $rootScope.showVerifyIdentityModal();
              };

              $scope.countryCode = 'US';

              $scope.onAddressSelection = function (location) {
                  $scope.profile.home_address = location.formatted_address;
              };
            }
        ]
    );


appControllers.controller('paymentMethodsCtrl', ['$scope', '$rootScope', '$ionicPopup', '$ionicLoading', '$timeout', 'ParentService', '$localStorage',
  function($scope, $rootScope, $ionicPopup, $ionicLoading, $timeout, ParentService, $localStorage){

    if ($rootScope.isParent()){
      $scope.uid = $localStorage['uid'];
    }else{
      $scope.uid = $localStorage['child']['member-id'];
    }

    if ($rootScope.isParent()){
      ParentService.getPaymentMethods($scope.uid).then(function(methods){
        // $scope.paymentMethods = methods;
        $scope.paymentMethods = [{
          icon: 'https://sandbox.braintreegateway.com/images/payment_instrument_images/mastercard.png',
          card: '************4444',
          name: 'John Doe'
        }];
      });
    }

    ParentService.getPayoutMethods($scope.uid, $rootScope.isParent()).then(function(methods){
      $scope.payoutMethods = methods;
    });

    // $scope.payoutMethods = [
    //   {
    //     account_number: '12345678',
    //     routing_number: '12345678',
    //     name: 'John Doe'
    //   }
    // ];

    $scope.currentSelectedPaymentMethod = {};
    $scope.newPaymentMethodVars = {
        icon: 'https://sandbox.braintreegateway.com/images/payment_instrument_images/visa.png',
        card: '',
        exp: '',
        cvc: '',
        name: ''
      };

    $scope.newPayoutMethodVars = {
        name: '',
        account_number: '',
        routing_number: ''
      };
    $scope.managePopup = null;

    $scope.managePaymentMethod = function(paymentId, paymentMethod){
      return; //disabled for sandbox
      $scope.currentSelectedPaymentMethod = paymentMethod;
      $scope.currentSelectedPaymentId = paymentId;
      $scope.managePopup = $ionicPopup.show({
        template: '<div class="list">'+
  '<label class="item item-input">'+
    '<span class="input-label">Name</span>'+
    '<input type="text" ng-model="currentSelectedPaymentMethod.name">'+
  '</label>'+
'<label class="item item-input">'+
    '<span class="input-label">Card</span>'+
    '<input type="text" autocapitalize="off" ng-maxlength="16" spellcheck="false" inputmode="numeric" placeholder="{{currentSelectedPaymentMethod.masked}}" ng-model="currentSelectedPaymentMethod.card">'+
  '</label>'+
  

'<label class="item item-input">'+
    '<span class="input-label">Exp</span>'+
    '<input type="text" model-view-value="true" ui-mask="99/9999" autocapitalize="off" ng-maxlength="7" spellcheck="false" inputmode="numeric" ng-model="currentSelectedPaymentMethod.exp">'+
  '</label><label class="item item-input">'+
    '<span class="input-label">CVC</span>'+
    '<input type="text" model-view-value="true" ui-mask="999" autocapitalize="off" ng-maxlength="3" spellcheck="false" inputmode="numeric" ng-model="currentSelectedPaymentMethod.cvc">'+
  '</label>'+
'</div>'+
'<button class="button button-full button-positive" ng-click="savePaymentMethod(currentSelectedPaymentId, currentSelectedPaymentMethod)">Save</button></div>'+
  '<button class="button button-full button-assertive" ng-click="deletePaymentMethod(currentSelectedPaymentId, currentSelectedPaymentMethod)">Delete</button></div>',
        title: 'Manage Visa',
        subTitle: 'You can delete this payment method.',
        scope: $scope,
        buttons: []
      });

      $scope.managePopup.then(function(res){

      });
    };

    $scope.managePayoutMethod = function(payoutId, payoutMethod){
      $scope.currentSelectedPayoutMethod = payoutMethod;
      $scope.currentSelectedPayoutId = payoutId;
      console.log(payoutMethod);
      $scope.managePopup = $ionicPopup.show({
        template: '<div class="list">'+
  '<label class="item item-input">'+
    '<span class="input-label">Name</span>'+
    '<input type="text" ng-model="currentSelectedPayoutMethod.name">'+
  '</label>'+
'<label class="item item-input">'+
    '<span class="input-label">Account #</span>'+
    '<input type="text" model-view-value="true" ui-mask="99999999" placeholder="12345678" ng-maxlength="8" ng-model="currentSelectedPayoutMethod.account_number">'+
  '</label>'+
  '<label class="item item-input">'+
    '<span class="input-label">Routing #</span>'+
    '<input type="text" model-view-value="true" ui-mask="99999999" placeholder="12345678" ng-maxlength="8" ng-model="currentSelectedPayoutMethod.routing_number">'+
  '</label>'+
'</div>'+
'<button class="button button-full button-positive" ng-click="savePayoutMethod(currentSelectedPayoutId, currentSelectedPayoutMethod)">Save</button></div>'+
  '<button class="button button-full button-assertive" ng-click="deletePayoutMethod(currentSelectedPayoutId, currentSelectedPayoutMethod)">Delete</button></div>',
        title: 'Manage Payout Method',
        subTitle: 'You can delete this payout method.',
        scope: $scope,
        buttons: []
      });

      $scope.managePopup.then(function(res){

      });
    };

    $scope.savePaymentMethod = function(paymentId, paymentMethod){
      $ionicLoading.show();
      if (typeof(paymentMethod) == 'undefined'){
        ParentService.savePaymentMethods($scope.uid, $scope.newPaymentMethodVars).then(function(updatedMethods){
          console.log(updatedMethods);
          $ionicLoading.hide();
          $scope.paymentMethods = updatedMethods;
          $scope.managePopup.close();
          $scope.newPaymentMethodVars = {
            icon: 'https://sandbox.braintreegateway.com/images/payment_instrument_images/visa.png',
            card: '',
            exp: '',
            cvc: '',
            name: ''
          };
        });
      }else{
        ParentService.updatePaymentMethod($scope.uid, paymentId, paymentMethod).then(function(updatedMethods){
          console.log(updatedMethods);
          $ionicLoading.hide();
          $scope.paymentMethods = updatedMethods;
          $scope.managePopup.close();
          $scope.newPaymentMethodVars = {
            icon: 'https://sandbox.braintreegateway.com/images/payment_instrument_images/visa.png',
            card: '',
            exp: '',
            cvc: '',
            name: ''
          };
        });
      }
    };

    $scope.deletePaymentMethod = function(paymentId, paymentMethod){
      // console.log(paymentId);
      $ionicLoading.show();
      ParentService.deletePaymentMethod($scope.uid, paymentId).then(function(methods){
        $ionicLoading.hide();
        $scope.managePopup.close();
        $scope.paymentMethods = methods;
      });
    };

    $scope.newPaymentMethod = function(){
      console.log($scope.newPaymentMethodVars);
      $scope.managePopup = $ionicPopup.show({
        template: '<div class="list">'+
  '<label class="item item-input">'+
    '<span class="input-label">Name</span>'+
    '<input type="text" ng-model="newPaymentMethodVars.name">'+
  '</label>'+
'<label class="item item-input">'+
    '<span class="input-label">Card</span>'+
    '<input type="text" ng-model="newPaymentMethodVars.card" ng-maxlength="16" autocapitalize="off" spellcheck="false" inputmode="numeric">'+
  '</label>'+
  

'<label class="item item-input">'+
    '<span class="input-label">Exp</span>'+
    '<input type="text" model-view-value="true" ui-mask="99/9999" ng-model="newPaymentMethodVars.exp" ng-maxlength="7" autocapitalize="off" spellcheck="false" inputmode="numeric">'+
  '</label><label class="item item-input">'+
    '<span class="input-label">CVC</span>'+
    '<input type="text" model-view-value="true" ui-mask="999" ng-model="newPaymentMethodVars.cvc" ng-maxlength="3" autocapitalize="off" spellcheck="false" inputmode="numeric">'+
  '</label>'+
'</div>'+
'<button class="button button-full button-positive" ng-disabled="newPaymentMethodsVars.name==\'\'||newPaymentMethodVars.card==\'\'||newPaymentMethodVars.exp==\'\'||newPaymentMethodVars.cvc==\'\'" ng-click="savePaymentMethod()">Save</button></div>'+
  '</div>',
        title: 'Create Payment Method',
        subTitle: '',
        scope: $scope,
        buttons: []
      });

      $scope.managePopup.then(function(res){

      });
    };

    $scope.savePayoutMethod = function(payoutId, payoutMethod){
      $ionicLoading.show();
      if (typeof(payoutMethod) == 'undefined'){
        ParentService.savePayoutMethods($scope.uid, $scope.newPayoutMethodVars).then(function(updatedMethods){
          console.log(updatedMethods);
          $ionicLoading.hide();
          $scope.payoutMethods = updatedMethods;
          $scope.managePopup.close();
          $scope.newPayoutMethodVars = {
            name: '',
            account_number: '',
            routing_number: ''
          };
        });
      }else{
        ParentService.updatePayoutMethod($scope.uid, payoutId, payoutMethod).then(function(updatedMethods){
          console.log(updatedMethods);
          $ionicLoading.hide();
          $scope.payoutMethods = updatedMethods;
          $scope.managePopup.close();
          $scope.newPayoutMethodVars = {
            name: '',
            account_number: '',
            routing_number: ''
          };
        });
      }
    };

    $scope.deletePayoutMethod = function(payoutId, payoutMethod){
      // console.log(paymentId);
      $ionicLoading.show();
      ParentService.deletePayoutMethod($scope.uid, payoutId).then(function(methods){
        $ionicLoading.hide();
        $scope.managePopup.close();
        $scope.payoutMethods = methods;
      });
    };

    $scope.newPayoutMethod = function(){
      console.log($scope.newPayoutMethodVars);
      $scope.managePopup = $ionicPopup.show({
        template: '<div class="list">'+
  '<label class="item item-input">'+
    '<span class="input-label">Name</span>'+
    '<input type="text" ng-model="newPayoutMethodVars.name">'+
  '</label>'+
'<label class="item item-input">'+
    '<span class="input-label">Account #</span>'+
    '<input type="text" model-view-value="true" ui-mask="99999999" ng-model="newPayoutMethodVars.account_number" ng-maxlength="8" autocapitalize="off" spellcheck="false" inputmode="numeric">'+
  '</label>'+
  '<label class="item item-input">'+
    '<span class="input-label">Routing #</span>'+
    '<input type="text" model-view-value="true" ui-mask="99999999" ng-model="newPayoutMethodVars.routing_number" ng-maxlength="8" autocapitalize="off" spellcheck="false" inputmode="numeric">'+
  '</label>'+
'</div>'+
'<button class="button button-full button-positive" ng-disabled="newPayoutMethodVars.account_number==\'\'||newPayoutMethodVars.routing_number==\'\'" ng-click="savePayoutMethod()">Save</button></div>'+
  '</div>',
        title: 'Create Payout Method',
        subTitle: '',
        scope: $scope,
        buttons: []
      });

      $scope.managePopup.then(function(res){

      });
    };
  }
]);
