appControllers

    .controller('signupModalCtrl', ['$scope', '$state', '$stateParams', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', '$timeout', '$ionicSlideBoxDelegate', 'WizardHandler', '$ionicScrollDelegate',
    function($scope, $state, $stateParams, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, $ionicSlideBoxDelegate, $timeout, WizardHandler, $ionicScrollDelegate) {
        $scope.currentIndex = 0;

        console.log($rootScope.params);

        $scope.params = {
            uid: '',
            month: '',
            day: '',
            year: '',
            dob: '',
            gender: 1,
            first_name: '',
            last_name: '',
            email: $rootScope.params.email,
            password: $rootScope.params.password,
            phone: '',
            registerAsChild: false,

            addressObject: {
              address: '',
              address_2: '',
              city: '',
              state: '',
              zip: ''
            },

        };

        $scope.inprogress = false;

        $scope._calculateAge = function(birthday) { // birthday is a date
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            var age = Math.abs(ageDate.getUTCFullYear() - 1970);
            //console.log(age);
            return age;
        }

        $scope.firstStepCompleted = function() {
            if ($scope.params.dob != '') {
                return false;
            } else {
                return true;
            }
        };

        $scope.secondStepCompleted = function() {
            if ($scope.params.first_name != '' &&
                $scope.params.last_name != '' &&
                $scope.params.email != '' &&
                $scope.params.password != '' &&
                $scope.params.phone != '') {
                return false;
            } else {
                return true;
            }
        }

        $scope.formValidSubmit = function(form, index) {
            $rootScope.showLoader();
            $scope.inprogress = true;
            setTimeout(function(){
                if (window.cordova) {
                    cordova.plugins.Keyboard.close();
                }
                ionic.DomUtil.blurAll();
            }, 200);

            if (form.$valid) {
                $scope.next(index);
                return;
            } else {
                $rootScope.showPopup('Validation Error', 'Check the fields above and try again.', 'error');
                return;
            }
        };

        $scope.next = function(index) {
            console.log(index);
            $ionicScrollDelegate.scrollTop();
            if (window.cordova) {
                cordova.plugins.Keyboard.close();
            }
            ionic.DomUtil.blurAll();

            $rootScope.showLoader();
            var params = [];

            if (index == 1){
                // $scope.params.dob = '12/23/1997';
                var d = new Date($scope.params.dob);

                params = params.concat({
                    key: 'dob',
                    value: d
                });
                
                if (!window.isBrowserMode){
                    params = params.concat({
                        key: 'month',
                        value: new Date($scope.params.dob).getMonth()+1
                    });
                    params = params.concat({
                        key: 'day',
                        value: new Date($scope.params.dob).getDate()
                    });
                    params = params.concat({
                        key: 'year',
                        value: new Date($scope.params.dob).getFullYear()
                    });
                    console.log(params);
                }else{
                    params = params.concat({
                        key: 'month',
                        value: $scope.params.month.id
                    });
                    params = params.concat({
                        key: 'day',
                        value: $scope.params.day
                    });
                    params = params.concat({
                        key: 'year',
                        value: $scope.params.year
                    });
                }
                
                params = params.concat({
                    key: 'gender',
                    value: $scope.params.gender
                });

                params = params.concat({
                    key: 'first_name',
                    value: $scope.params.first_name
                });

                params = params.concat({
                    key: 'last_name',
                    value: $scope.params.last_name
                });

                params = params.concat({
                    key: 'email',
                    value: $scope.params.email
                });

                params = params.concat({
                    key: 'password',
                    value: $scope.params.password
                });

                

                if ($scope._calculateAge(d) <= 12) {
                    $ionicLoading.hide();
                    $scope.inprogress = false;
                    $rootScope.showPopup('You are too young', 'You are under 13. Your parent must create an account for you.', 'error');
                    return;
                } else if ($scope._calculateAge(d) >= 13 && $scope._calculateAge(d) <= 17) {
                    //register as child
                    $scope.params.registerAsChild = true;
                    console.log('registering as child');
                } else {
                    //register as parent
                    $scope.params.registerAsChild = false;
                    console.log('not registering as child');
                }

                // $ionicLoading.hide();
            }else if (index == 2 && $scope.params.registerAsChild || index == 3){
                if (!window.isBrowserMode){
                    params = params.concat({
                        key: 'month',
                        value: new Date($scope.params.dob).getMonth()+1
                    });
                    params = params.concat({
                        key: 'day',
                        value: new Date($scope.params.dob).getDate()
                    });
                    params = params.concat({
                        key: 'year',
                        value: new Date($scope.params.dob).getFullYear()
                    });
                    console.log(params);
                }else{
                    params = params.concat({
                        key: 'month',
                        value: $scope.params.month.id
                    });
                    params = params.concat({
                        key: 'day',
                        value: $scope.params.day
                    });
                    params = params.concat({
                        key: 'year',
                        value: $scope.params.year
                    });
                }
                params = params.concat({
                    key: 'dob',
                    value: $scope.params.dob
                });
                params = params.concat({
                    key: 'gender',
                    value: $scope.params.gender
                });
                params = params.concat({
                    key: 'first_name',
                    value: $scope.params.first_name
                });
                params = params.concat({
                    key: 'last_name',
                    value: $scope.params.last_name
                });
                params = params.concat({
                    key: 'email',
                    value: $scope.params.email
                });
                params = params.concat({
                    key: 'password',
                    value: $scope.params.password
                });

                if ($scope.isTeen()){
                    params = params.concat({
                        key: 'address_1',
                        value: $scope.params.addressObject.address
                    });

                    params = params.concat({
                        key: 'address_2',
                        value: $scope.params.addressObject.address_2
                    });

                    params = params.concat({
                        key: 'city',
                        value: $scope.params.addressObject.city
                    });

                    params = params.concat({
                        key: 'state',
                        value: $scope.params.addressObject.state
                    });

                    params = params.concat({
                        key: 'zip',
                        value: $scope.params.addressObject.zip
                    });
                }
            }

            if (index != 3) {
                if (index == 1) {
                    AuthService.checkIfEmailExists($scope.params.email).then(
                        function(success) {
                            //do nothing
                            console.log('response: ' + success);
                            AuthService.existsInFirebase($scope.params.email).then(
                                function(success){
                                    $rootScope.showPopup('Continue registering', 'You did not complete your previous registration please login and try again.', 'error').then(function(){
                                        for (var i = 0; i < success.length; i++) {
                                            var provider = success[i];
                                            if (provider == 'google.com'){
                                                $scope.$apply(function(){
                                                    $scope.attemptGoogleLogin();
                                                });
                                            }else if (provider == 'facebook.com'){
                                                $scope.$apply(function(){
                                                    $scope.attemptFacebookLogin();
                                                });
                                            }
                                        }
                                    });
                                },
                                function(error){
                                    if (error){
                                        $rootScope.showPopup('Email already exists', 'That email is already in use. Reset your password or use a different email address and try again.', 'error');
                                    }
                                });
                        },
                        function(error) {
                            $rootScope.showPopup('Email already exists', 'That email is already in use. Reset your password or use a different email address and try again.', 'error');
                        });

                    
                }

                console.log(params);

                AuthService.validateSignup(index, params).then(
                    function(success) {
                        console.log(success);

                        if (index == 1 && !params.registerAsChild) {
                            //Signup user unless they're already authenticated.
                            console.log('signing up user.');

                            //debug
                            // $ionicLoading.hide();
                            if ($scope.isTeen()) {
                                $ionicLoading.hide();
                                WizardHandler.wizard().goTo('isTeen');
                                $scope.inprogress = false;
                            } else {
                                $scope.registerWithService(params, index);
                            }


                        } else {
                            $ionicLoading.hide();
                            $scope.currentIndex = index;
                            $scope.inprogress = false;
                        }

                    },
                    function(error) {
                        if (typeof(error['success']) != 'undefined') {
                            if (error['success'] == 'undefined') {
                                $rootScope.showPopup('Validation Error', 'You have an error in your fields and try again');
                            }
                            $scope.inprogress = false;
                        } else {
                            if (error.message.email[0] == "The email has already been taken.") {
                                $rootScope.showPopup('Email already exists', 'That email is already in use. Reset your password or use a different email address and try again.', 'error');
                            } else {
                                $rootScope.showPopup('Validation Error', 'You have an error in your fields and try again');
                            }
                        }
                        $ionicLoading.hide();
                        $scope.inprogress = false;
                    }
                );
            }else{
                // if (index == 2 && $scope.params.registerAsChild || index == 3){
                    if (!window.isBrowserMode){
                        params = params.concat({
                            key: 'month',
                            value: new Date($scope.params.dob).getMonth()+1
                        });
                        params = params.concat({
                            key: 'day',
                            value: new Date($scope.params.dob).getDate()
                        });
                        params = params.concat({
                            key: 'year',
                            value: new Date($scope.params.dob).getFullYear()
                        });
                        console.log(params);
                    }else{
                        params = params.concat({
                            key: 'month',
                            value: $scope.params.month.id
                        });
                        params = params.concat({
                            key: 'day',
                            value: $scope.params.day
                        });
                        params = params.concat({
                            key: 'year',
                            value: $scope.params.year
                        });
                    }
                    params = params.concat({
                        key: 'dob',
                        value: $scope.params.dob
                    });
                    params = params.concat({
                        key: 'gender',
                        value: $scope.params.gender
                    });
                    params = params.concat({
                        key: 'first_name',
                        value: $scope.params.first_name
                    });
                    params = params.concat({
                        key: 'last_name',
                        value: $scope.params.last_name
                    });
                    params = params.concat({
                        key: 'email',
                        value: $scope.params.email
                    });
                    params = params.concat({
                        key: 'password',
                        value: $scope.params.password
                    });

                    if ($scope.isTeen()){
                        params = params.concat({
                            key: 'address_1',
                            value: $scope.params.addressObject.address
                        });

                        params = params.concat({
                            key: 'address_2',
                            value: $scope.params.addressObject.address_2
                        });

                        params = params.concat({
                            key: 'city',
                            value: $scope.params.addressObject.city
                        });

                        params = params.concat({
                            key: 'state',
                            value: $scope.params.addressObject.state
                        });

                        params = params.concat({
                            key: 'zip',
                            value: $scope.params.addressObject.zip
                        });
                    }
                // }
                
                if ($scope.isTeen()){
                    // $ionicLoading.hide();
                    $scope.registerWithService(params, index);

                }
            }
        };

        $scope.registerWithService = function(params, index) {
            if ($scope.params.uid == '') {
                AuthService.signupWithEmail($scope.params.email, $scope.params.password).then(
                    function(success) {
                        params = params.concat({
                            key: 'uid',
                            value: firebase.auth().currentUser.uid
                        });

                        firebase.auth().currentUser.getToken(true).then(function(idToken) {
                            AuthService.notifyOfNewAccount(idToken, params).then(
                                function(submitSuccess) {
                                    console.log(submitSuccess);
                                    $ionicLoading.hide();
                                    $scope.currentIndex = index;
                                    WizardHandler.wizard().goTo('finished');

                                    $scope.inprogress = false;
                                },
                                function(submitError) {
                                    $ionicLoading.hide();
                                    console.error(submitError);
                                    $scope.inprogress = false;
                                }
                            );
                        }).catch(function(errorToken) {
                            $ionicLoading.hide();
                            console.error(errorToken);
                            $scope.inprogress = false;
                        });
                    },
                    function(error) {
                        $ionicLoading.hide();
                        console.error(error);
                        $scope.inprogress = false;
                    }
                );
            } else {
                var cred = firebase.auth.EmailAuthProvider.credential($scope.params.email, $scope.params.password);
                firebase.auth().currentUser.link(cred).then(function(success) {
                    firebase.auth().currentUser.getToken(true).then(function(idToken) {
                        AuthService.notifyOfNewAccount(idToken, params).then(
                            function(submitSuccess) {
                                console.log(submitSuccess);
                                $ionicLoading.hide();
                                $scope.currentIndex = index;
                                WizardHandler.wizard().goTo('finished');
                            },
                            function(submitError) {
                                $ionicLoading.hide();
                                console.error(submitError);
                            }
                        );
                    }).catch(function(errorToken) {
                        $ionicLoading.hide();
                        console.error(errorToken)
                    });
                }).catch(function(error) {
                    $ionicLoading.hide();
                    console.error(error);
                });
            }
        };

        $scope.prev = function(index) {
            $scope.currentIndex = index;
        };

        $scope.attemptFacebookLogin = function() {
            $scope.showLoader();
            AuthService.loginWithFacebook().then(
                function(response) {
                    AuthService.checkIfEmailExists(firebase.auth().currentUser.email).then(
                        function() {
                            //doesnt exist
                            // console.log(response);
                            $ionicLoading.hide();

                            $scope.params.uid = $localStorage['uid'];
                            $scope.params.email = firebase.auth().currentUser.email;
                            $scope.params.first_name = firebase.auth().currentUser.displayName.split(' ')[0];
                            $scope.params.last_name = firebase.auth().currentUser.displayName.split(' ')[1];
                            $scope.params.day = "22";
                            $scope.params.month = {
                                id: 1,
                                name: 'January'
                            };
                            $scope.params.year = "1980";
                            $scope.params.dob = new Date('1/1/1980');
                            /*$scope.params.day = 1;
                            $scope.params.month = 1;
                            $scope.params.year = 1980;*/
                            $scope.next(1);
                        },
                        function() {
                            //does exist
                            $ionicLoading.hide();
                            if (window.isBrowserMode) {
                                $rootScope.loggedIn = true;
                                $rootScope.horizontalSections();
                                angular.element($('[ng-controller="webCtrl"]')).scope().loadInit(); //hotfix
                                $rootScope.modal.hide();
                                //BROWSER ONLY WIDTH FIX
                                setTimeout(function() {
                                    $rootScope.horizontalSections();
                                }, 500);

                            } else {
                                console.log('parent');
                                $state.go('app.parent-dashboard');
                            }
                            $rootScope.modal.hide();
                        });
                },
                function(error) {
                    $ionicLoading.hide();
                    console.error(error);
                    $scope.showPopup('Invalid Login', "Your login was not valid. Please check your login information and try again.", 'error');
                    //Attempt firebase login now for parent since authing as a child did not work.
                }
            );
        };

        $scope.attemptGoogleLogin = function() {
            $scope.showLoader();
            AuthService.loginWithGoogle().then(
                function(response) {
                    AuthService.checkIfEmailExists(firebase.auth().currentUser.email).then(
                        function() {
                            //doesnt exist
                            // console.log(response);
                            $ionicLoading.hide();

                            $scope.params.uid = $localStorage['uid'];
                            $scope.params.email = firebase.auth().currentUser.email;
                            $scope.params.first_name = firebase.auth().currentUser.displayName.split(' ')[0];
                            $scope.params.last_name = firebase.auth().currentUser.displayName.split(' ')[1];
                            $scope.params.day = "22";
                            $scope.params.month = {
                                id: 1,
                                name: 'January'
                            };
                            $scope.params.year = "1980";
                            $scope.params.dob = new Date('1/1/1980');
                            /*$scope.params.day = 1;
                            $scope.params.month = 1;
                            $scope.params.year = 1980;*/
                            $scope.next(1);
                        },
                        function() {
                            //does exist
                            $ionicLoading.hide();
                            if (window.isBrowserMode) {
                                $rootScope.loggedIn = true;
                                $rootScope.horizontalSections();
                                angular.element($('[ng-controller="webCtrl"]')).scope().loadInit(); //hotfix
                                $rootScope.modal.hide();
                                //BROWSER ONLY WIDTH FIX
                                setTimeout(function() {
                                    $rootScope.horizontalSections();
                                }, 500);

                            } else {
                                console.log('parent');
                                $state.go('app.parent-dashboard');
                            }
                            $rootScope.modal.hide();
                        });

                },
                function(error) {
                    $ionicLoading.hide();
                    console.error(error);
                    $scope.showPopup('Invalid Login', "Your login was not valid. Please check your login information and try again.", 'error');
                    //Attempt firebase login now for parent since authing as a child did not work.
                }
            );

            cordova.plugins.Keyboard.close();
        };

        $scope.active = 'item1';

        $scope.setActive = function(item) {
            $scope.active = item;
            if (item == 'item1') {
                $scope.params.gender = 1;
            } else {
                $scope.params.gender = 2;
            }
        };

        $scope.isActive = function(item) {
            if (item == $scope.active) {
                return 'button-assertive';
            } else {
                return '';
            }
        };

        $scope.fieldValues = {
            dateOfBirth: ""
        };

        /*Date Of Birth*/

        $scope.days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
        $scope.months = [{
            id: 1,
            name: "January"
        }, {
            id: 2,
            name: "February"
        }, {
            id: 3,
            name: "March"
        }, {
            id: 4,
            name: "April"
        }, {
            id: 5,
            name: "May"
        }, {
            id: 6,
            name: "June"
        }, {
            id: 7,
            name: "July"
        }, {
            id: 8,
            name: "August"
        }, {
            id: 9,
            name: "September"
        }, {
            id: 10,
            name: "October"
        }, {
            id: 11,
            name: "November"
        }, {
            id: 12,
            name: "December"
        }];
        $scope.years = [];
        var d = new Date();
        for (var i = (d.getFullYear()); i > (d.getFullYear() - 100); i--) {
            $scope.years.push(i);
        }


        $scope.updateDate = function(input) {
            console.log(input);
            if (input == "year") {
                $scope.params.month = "";
                $scope.params.day = "";
            } else if (input == "month") {
                $scope.params.day = "";
            }

            console.log($scope.params.year);
            console.log($scope.params.month);
            console.log($scope.params.day);

            if ($scope.params.year && $scope.params.month && $scope.params.day) {
                $scope.params.dob = new Date($scope.params.year, $scope.params.month.id - 1, $scope.params.day);
                console.log($scope.params.dob);
            }
        };

        $scope.isEmpty = function(input) {
            if (input == "year" && $scope.params.year == '') {
                return "Year";
            }

            if (input == "month" && $scope.params.month == '') {
                return "Month";
            }

            if (input == "day" && $scope.params.day == '') {
                return "Day";
            }

            return '';
        };

        $scope.setInput = function(input, value) {
            if (input == "year") {
                $scope.params.year = value;
            }

            // if (input == "year"){
            //     $scope.params.month = "";
            //     $scope.params.day = "";
            // }
            // else if (input == "month"){
            //     $scope.params.day = "";
            // }

            if (input == "month") {
                $scope.params.month = value;
            }

            if (input == "day") {
                $scope.params.day = value;
            }

            if ($scope.params.year && $scope.params.month && $scope.params.day) {
                $scope.params.dob = new Date($scope.params.year, $scope.params.month.id - 1, $scope.params.day);
                console.log($scope.params.dob);
            }
        };

        $scope.isTeen = function() {
            if ($scope.params.registerAsChild) {
                return true;
            } else {
                return false;
            }
        };

        $scope.onAddressSelection = function(location) {
            $scope.params.addressObject.address = location.name;
            for (var i = 0; i < location.address_components.length; i++) {
                var component = location.address_components[i];
                if (component.types[0] == 'locality') {
                    $scope.params.addressObject.city = component.long_name;
                }

                if (component.types[0] == 'administrative_area_level_1') {
                    $scope.params.addressObject.state = component.short_name;
                }

                if (component.types[0] == 'postal_code') {
                    $scope.params.addressObject.zip = component.short_name;
                }
            }
        };

        $scope.teenStepCompleted = function() {
            if ($scope.params.addressObject.address == '' ||
                $scope.params.addressObject.city == '' ||
                $scope.params.addressObject.state == '' ||
                $scope.params.addressObject.zip == ''){
                return true;
            }else{
                return false;
            }
        };
    }
]);