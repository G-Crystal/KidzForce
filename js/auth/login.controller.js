appControllers

    .controller('loginCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', '$firebaseAuth', '$cordovaOauth', 'ParentService',
    function($scope, $rootScope, $state, $stateParams, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, $firebaseAuth, $cordovaOauth, ParentService) {
      setTimeout(function(){
        if (window.cordova){
            cordova.plugins.instabug.activate(
                {
                    android: '015fdf7e4ddec6ced811fb55513b1f80',
                    ios: 'f2b8b9c8e44042d6fd170772291a7e7a'
                },
                'shake',
                {
                    commentRequired: true,
                    colorTheme: 'dark',
                    shakingThresholdAndroid: '0.1',
                    shakingThresholdIPhone: '1.5',
                    shakingThresholdIPad: '0.6',
                    enableIntroDialog: false
                },
                function () {
                    console.log('Instabug initialized.');
                },
                function (error) {
                    console.log('Instabug could not be initialized - ' + error);
                }
            );
        }
      }, 500);

      $localStorage['first_run'] = false;
        $scope.login = {
            username: '',
            password: ''
        };
        $scope.isAnimated = $stateParams.isAnimated;
        $scope.data = {}
        $scope.data.isMale = true;

        //AuthService.reset();

        $scope.num_of_failures = 0;

        $scope.validateEmail = function(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        $scope.attemptLogin = function(authorizationForm) {
          if(authorizationForm.$valid) {
            if (window.cordova){
              cordova.plugins.Keyboard.close();
            }
            $scope.showLoader();
            AuthService.login($scope.login.username, $scope.login.password).then(
                function(response) {
                    if (response == 'child') {
                        $ionicLoading.hide();
                        $state.go('app.child-dashboard');
                    } else {
                        ParentService.getProfile().then(
                            function(profile){
                                $localStorage['parent'] = profile.data;
                                $ionicLoading.hide();
                                // if (window.isBrowserMode){
                                //   $rootScope.loggedIn = true;
                                //   location.href = 'http://kidzforce.com/dashboard/';
                                // }else{
                                  $state.go('app.parent-dashboard');
                                // }
                            },
                            function(error){
                                console.error(error);
                                $ionicLoading.hide();
                                $scope.num_of_failures += 1;
                                if ($scope.num_of_failures == 3 && $scope.validateEmail($scope.login.username)){
                                  $scope.showForgotPassword();
                                }else{
                                  $scope.showPopup('Invalid login', "Your login was not valid. Please check your login information and try again.", 'error');
                                }
                            });
                        //$state.go('app.parent-dashboard');
                    }
                },
                function(error) {
                    $ionicLoading.hide();
                    console.error(error);
                    if (error.code == "auth/user-not-found"){
                      $rootScope.showSignupModal($scope.login.username, $scope.login.password);
                      return;
                    }
                    $scope.num_of_failures += 1;
                    if ($scope.num_of_failures == 3 && $scope.validateEmail($scope.login.username)){
                      $scope.showForgotPassword();
                    }else{
                      $scope.showPopup('Invalid login', "Your login was not valid. Please check your login information and try again.", 'error');
                    }
                    //Attempt firebase login now for parent since authing as a child did not work.
                }
            );
          }
        };

        $scope.authObj = $firebaseAuth();

        $scope.attemptFacebookLogin = function(){
          $scope.login = {
              username: '',
              password: ''
          };
            $scope.showLoader();
            AuthService.loginWithFacebook().then(
                function(response){
                    $ionicLoading.hide();

                    ParentService.getProfile().then(
                        function(profile){
                            $localStorage['parent'] = profile.data;
                            // if (window.isBrowserMode){
                            //   $rootScope.loggedIn = true;
                            //   location.href = 'http://kidzforce.com/dashboard/';
                            // }else{
                              $state.go('app.parent-dashboard');
                            // }
                        },
                        function(error){
                            console.error(error);
                            $ionicLoading.hide();
                            $scope.showPopup('Invalid login', "Your login was not valid. Please check your login information and try again.", 'error');
                        });
                },
                function(error){
                    $ionicLoading.hide();
                    if (error == 'The sign in flow was canceled' || error == 'The user canceled the sign-in flow.'){ return; }
                    if (error.code == 'auth/account-exists-with-different-credential'){
                      $scope.showPopup('Account already exists', error.message, 'error');
                    }else{
                      $scope.showPopup('Invalid login', "Your login was not valid. Please check your login information and try again.", 'error');
                    }
                    
                    //Attempt firebase login now for parent since authing as a child did not work.
                }
            );
        };

        $scope.attemptGoogleLogin = function(){
          $scope.login = {
              username: '',
              password: ''
          };
            $scope.showLoader();
            AuthService.loginWithGoogle().then(
                function(response){
                    $ionicLoading.hide();

                    ParentService.getProfile().then(
                        function(profile){
                            $localStorage['parent'] = profile.data;
                            // if (window.isBrowserMode){
                            //   $rootScope.loggedIn = true;
                            //   location.href = 'http://kidzforce.com/dashboard/';
                            // }else{
                              $state.go('app.parent-dashboard');
                            // }
                        },
                        function(error){
                            AuthService.reset();
                            $ionicLoading.hide();
                            if (error['success'] == false){
                              $rootScope.showSignupModal($scope.login.username, $scope.login.password);
                            }
                            //$scope.showPopup('Invalid login', "Your login was not valid. Please check your login information and try again.", 'error');
                        });
                },
                function(error){
                    $ionicLoading.hide();
                    console.error(error);
                    if (error == 'The sign in flow was canceled' || error == 'The user canceled the sign-in flow.'){ return; }
                    if (error.code == 'auth/account-exists-with-different-credential'){
                      $scope.showPopup('Account already exists', error.message, 'error');
                    }else{
                      $scope.showPopup('Invalid login', "Your login was not valid. Please check your login information and try again.", 'error');
                    }
                    //Attempt firebase login now for parent since authing as a child did not work.
                }
            );
        };

        $scope.showForgotPassword = function(){
          $scope.num_of_failures = 0;
          if ($scope.login.username == '' && typeof($scope.login.username) == undefined){
            return;
          }
          
          var confirmPopup = $ionicPopup.confirm({
             title: 'Reset password',
             template: 'Do you want to reset your password for "'+$scope.login.username+'"?'
           });

           confirmPopup.then(function(res) {
             if(res) {
               $rootScope.showLoader();
               AuthService.resetPassword($scope.login.username).then(
                 function(success){
                  $ionicLoading.hide();
                  $rootScope.showPopup('Password Reset', 'Check your email for instructions to change your password.');
                  $scope.login.username = '';
                  $scope.login.password = '';
                 },
                 function(error){
                   $ionicLoading.hide();
                   $rootScope.showPopup('Password Reset', 'Check your email for instructions to change your password.');
                 }
               );
             }
           });
        };

        $scope.$on('$ionicParentView.beforeEnter', function(){
          // if (!window.isBrowserMode){
            if (typeof($localStorage['uid']) != 'undefined'){
              if ($localStorage['uid'].indexOf('-') == -1){
                //parent
                $state.go('app.parent-dashboard');
              }else{
                //child
                $state.go('app.child-dashboard');
              }
            }

            if (typeof($localStorage['username']) != 'undefined' && typeof($localStorage['password']) != 'undefined'){
              //child
              $state.go('app.child-dashboard');
            }
          // }
        });
    }
]);
