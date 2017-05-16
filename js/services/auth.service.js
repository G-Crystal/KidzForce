angular.module('kb')

.factory('AuthService', ['$http', '$q', '$localStorage', 'ENDPOINT_LIST', '$firebaseAuth', '$cordovaOauth',
    function($http, $q, $localStorage, ENDPOINT_LIST, $firebaseAuth, $cordovaOauth) {

        var service = {};

        var auth = $firebaseAuth();

        // Reset storage
        service.reset = function() {
            var defer = $q.defer();
            firebase.auth().signOut().then(function(){
                if (window.cordova){
                    window.plugins.googleplus.logout(
                        function (msg) {
                          //alert(msg); // do something useful instead of alerting
                        }
                    );
                }
                $localStorage.$reset({
                    first_run: false
                });
                console.log('logged out of firebase.');
                defer.resolve('logged out');
            });
            
            return defer.promise;
        };

        service.registerForNotifications = function(){
            var deferred = $q.defer();

            if (window.cordova){
                var push = PushNotification.init({
                    android: {
                        senderID: "12345679"
                    },
                    browser: {
                        pushServiceURL: 'http://push.api.phonegap.com/v1/push'
                    },
                    ios: {
                        alert: "true",
                        badge: "true",
                        sound: "true"
                    },
                    windows: {}
                });

                push.on('registration', function(data) {
                    console.log(data);
                    var deviceToken = data.registrationId;
                    deferred.resolve(deviceToken);
                });

                push.on('notification', function(data) {
                    console.log(data);
                    // data.message,
                    // data.title,
                    // data.count,
                    // data.sound,
                    // data.image,
                    // data.additionalData

                    if (data.additionalData.foreground){
                        console.log('foreground');
                    }else{
                        console.log('background');
                    }
                });

                push.on('error', function(e) {
                    console.error(e.message);
                    deferred.reject(e.message);
                });
            }else{
                deferred.reject('');
            }
            return deferred.promise;
        };

        // Login
        service.login = function(username, password) {
            service.reset();

            var finalDeferred = $q.defer();

            var continueLogin = function(deviceToken){
                var deferred = $q.defer();
                var apiURL = ENDPOINT_LIST.CHILD_CHECK_API;
                var postData = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '&devicetoken=' + encodeURIComponent(deviceToken);

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    }
                }

                $http.post(apiURL, postData, config)
                    .success(function(response) {
                        if (response['success']) {
                          // if (window.isBrowserMode){
                          //   deferred.reject(response); //Browser should not allow auth as child.
                          // }
                            $localStorage['username'] = username;
                            $localStorage['password'] = password;
                            $localStorage['child'] = response['data'];

                            deferred.resolve('child');
                        } else {
                            console.log(username);
                            console.log(password);
                            auth.$signInWithEmailAndPassword(username, password).then(function(firebaseUser) {
                              $localStorage['uid'] = firebaseUser.uid;
                              $localStorage['parent'] = {};

                              deferred.resolve('parent');
                            }).catch(function(error) {
                              deferred.reject(error); //Auth with firebase also failed.
                            });
                        }
                    })
                    .error(function(error) { 
                        console.log(username);
                        console.log(password);
                        auth.$signInWithEmailAndPassword(username, password).then(function(firebaseUser) {
                          $localStorage['uid'] = firebaseUser.uid;
                          $localStorage['parent'] = {};

                          deferred.resolve('parent');
                        }).catch(function(error) {
                            console.log(error);
                          deferred.reject(error); //Auth with firebase also failed.
                        });
                    });

                return deferred.promise;
            };

            this.registerForNotifications().then(
                function(success){
                    //device token
                    continueLogin(success).then(
                        function(success){
                            finalDeferred.resolve(success);
                        },
                        function(error){
                            finalDeferred.reject(error);
                        }
                    ); //devicetoken
                },
                function(error){
                    //error message
                    continueLogin('').then(
                        function(success){
                            finalDeferred.resolve(success);
                        },
                        function(error){
                            finalDeferred.reject(error);
                        }
                    ); //no devicetoken
                }
            );

            return finalDeferred.promise;
        };

        service.checkIfEmailExists = function(email) {
            var finalDeferred = $q.defer();

            var postData = 'email=' + encodeURIComponent(email);

            var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    }
                }

            $http.post(ENDPOINT_LIST.REGISTER_EMAIL_VALIDATION_API, postData, config)
                .success(function(response){
                    // console.log(response);
                    if (response['success'] == false){
                        finalDeferred.resolve('doesnt exist');
                    }else{
                        finalDeferred.reject('exists');
                    }
                })
                .error(function(response){
                    finalDeferred.reject('exists or validation error');
                });

            return finalDeferred.promise;
        };

        service.existsInFirebase = function(email){
            var finalDeferred = $q.defer();

            firebase.auth().fetchProvidersForEmail(email).then(
                function(providers){
                    if (providers.length == 0){
                        finalDeferred.reject(false);
                    }else{
                        for (var i = 0; i < providers.length; i++) {
                            if (providers[i] == 'password'){
                                finalDeferred.reject(true);
                            }
                        }

                        finalDeferred.resolve(providers);
                    }
                }).catch(function(){
                    finalDeferred.reject(false);
                });

            return finalDeferred.promise;
        };

        // Login with Facebook
        service.loginWithFacebook = function() {
            service.reset();

            var finalDeferred = $q.defer();

            var continueLogin = function(deviceToken){
                //Register device

                var deferred = $q.defer();

                if (window.isBrowserMode){
                // if (true){
                    var provider = new firebase.auth.FacebookAuthProvider();
                    provider.addScope('user_birthday');
                    firebase.auth().signInWithPopup(provider).then(function (result) {
                        var user = result.user;
                        var credential = result.credential;

                        service.loginOrRegister(user).then(
                            function(success){
                                $localStorage['uid'] = result.user.uid;
                                $localStorage['parent'] = {};

                                deferred.resolve('parent');
                            },
                            function(error){
                                console.error(error);
                                deferred.reject(error);
                            });
                    }).catch(function (error) {
                        console.log("Error: " + error);
                        deferred.reject(error);
                    });
                }else{
                    $cordovaOauth.facebook(ENDPOINT_LIST.FBAPPID, ["email"]).then(function(result) {
                        console.log('result: ', result);
                        window.f = result;
                        var credential = firebase.auth.FacebookAuthProvider.credential(result.access_token);
                        auth.$signInWithCredential(credential).then(function(authData) {
                            //console.log(JSON.stringify(authData));
                            service.loginOrRegister(authData).then(
                                function(success){
                                    $localStorage['uid'] = authData.uid;
                                    $localStorage['parent'] = {};

                                    deferred.resolve('parent');
                                },
                                function(error){
                                    console.error(error);
                                    deferred.reject(error);
                                });

                            // deferred.resolve('parent');

                            //deferred.resolve('parent');
                        }, function(error) {
                            console.error("ERROR: " + error);
                            deferred.reject(error);
                        });
                    }, function(error) {
                        console.log("ERROR: " + error);
                        deferred.reject(error);
                    });
                }

                return deferred.promise;
            };

            this.registerForNotifications().then(
                function(success){
                    //device token
                    continueLogin(success).then(
                        function(success){
                            finalDeferred.resolve(success);
                        },
                        function(error){
                            finalDeferred.reject(error);
                        }
                    ); //devicetoken
                },
                function(error){
                    //error message
                    continueLogin('').then(
                        function(success){
                            finalDeferred.resolve(success);
                        },
                        function(error){
                            finalDeferred.reject(error);
                        }
                    ); //no devicetoken
                }
            );

            return finalDeferred.promise;
        };

        // Login with Google
        service.loginWithGoogle = function() {
            service.reset();

            var finalDeferred = $q.defer();

            var continueLogin = function(deviceToken){
                //Register device

                var deferred = $q.defer();

                if (window.isBrowserMode){
                // if (true){
                    var provider = new firebase.auth.GoogleAuthProvider();
                    provider.addScope('https://www.googleapis.com/auth/plus.login');
                    provider.addScope('https://www.googleapis.com/auth/plus.me');
                    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
                    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
                    provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
                    firebase.auth().signInWithPopup(provider).then(function (result) {
                        var user = result.user;
                        var credential = result.credential;

                        console.log(result);

                        service.loginOrRegister(user).then(
                            function(success){
                                $localStorage['uid'] = result.user.uid;
                                $localStorage['parent'] = {};

                                deferred.resolve('parent');
                            },
                            function(error){
                                console.error(error);
                                deferred.reject(error);
                            });
                        
                    }).catch(function (error) {
                        console.log("Error: " + error);
                        deferred.reject(error);
                    });
                }else{
                    window.plugins.googleplus.login({
                            'scopes': '',
                            'webClientId': '',
                            'offline': true,
                        },
                        function(obj) {
                            window.g = obj;
                            result = JSON.stringify(obj); // do something useful instead of alerting
                            console.log('result: ', result);
                            var credential = firebase.auth.GoogleAuthProvider.credential(obj.idToken);
                            auth.$signInWithCredential(credential).then(function(authData) {
                                console.log(authData);
                                // $localStorage['uid'] = authData.uid;
                                // $localStorage['parent'] = {};

                                service.loginOrRegister(authData).then(
                                    function(success){
                                        $localStorage['uid'] = authData.uid;
                                        $localStorage['parent'] = {};

                                        deferred.resolve('parent');
                                    },
                                    function(error){
                                        console.error(error);
                                        deferred.reject(error);
                                    });

                                // deferred.resolve('parent');
                            }, function(error) {
                                console.error("ERROR: " + error);
                                deferred.reject(error);
                            });
                        },
                        function(msg) {
                            //alert('error: ' + msg);
                            deferred.reject(msg);
                        }
                    );
                }

                return deferred.promise;
            };

            this.registerForNotifications().then(
                function(success){
                    //device token
                    continueLogin(success).then(
                        function(success){
                            finalDeferred.resolve(success);
                        },
                        function(error){
                            finalDeferred.reject(error);
                        }
                    ); //devicetoken
                },
                function(error){
                    //error message
                    continueLogin('').then(
                        function(success){
                            finalDeferred.resolve(success);
                        },
                        function(error){
                            finalDeferred.reject(error);
                        }
                    ); //no devicetoken
                }
            );

            return finalDeferred.promise;
        };

        service.loginOrRegister = function(user){
            var defer = $q.defer();
            var user = firebase.auth().currentUser;
            service.checkIfEmailExists(user.email).then(
                function(success) {
                    //do nothing
                    firebase.auth().currentUser.getToken(true).then(function(idToken) {
                        var params = [];

                        params = params.concat({
                            key: 'month',
                            value: 1
                        });
                        params = params.concat({
                            key: 'day',
                            value: 1
                        });
                        params = params.concat({
                            key: 'year',
                            value: 1980
                        });
                        params = params.concat({
                            key: 'dob',
                            value: '1/1/1980'
                        });
                        params = params.concat({
                            key: 'gender',
                            value: 1
                        });

                        if (typeof(user.displayName) == 'undefined' || user.displayName == null){
                            params = params.concat({
                                key: 'first_name',
                                value: user.providerData[0].displayName.split(' ')[0]
                            });
                            params = params.concat({
                                key: 'last_name',
                                value: user.providerData[0].displayName.split(' ')[1]
                            });
                        }else{
                            params = params.concat({
                                key: 'first_name',
                                value: user.displayName.split(' ')[0]
                            });
                            params = params.concat({
                                key: 'last_name',
                                value: user.displayName.split(' ')[1]
                            });
                        }

                        params = params.concat({
                            key: 'email',
                            value: user.email
                        });

                        service.notifyOfNewAccount(idToken, params).then(
                            function(submitSuccess) {
                                console.log(submitSuccess);
                                defer.resolve('registered');
                            },
                            function(submitError) {
                                console.error(submitError);
                                defer.reject(submitError);
                            }
                        );
                    }).catch(function(errorToken) {

                        console.error(errorToken);
                        defer.reject(errorToken);
                    });
                },
                function(error) {
                    //$rootScope.showPopup('Email already exists', 'That email is already in use. Reset your password or use a different email address and try again.', 'error');
                    defer.resolve('registered');
                });

            return defer.promise;
        };

        // Forgot password
        service.forgotPassword = function(email) {
            service.reset();
        };

        service.validateSignup = function(index, params){
            //service.reset();

            var deferred = $q.defer();

            var apiURL = ENDPOINT_LIST.SIGNUP_VALIDATION_API;
            var postData = 'step=' + encodeURIComponent(index);

            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                postData += '&' + encodeURIComponent(param['key']) + '=' + encodeURIComponent(param['value']);
            }

            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            }

            $http.post(apiURL, postData, config)
                .success(function(response) {
                    if (response['success']) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject(response);
                    }
                })
                .error(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        };

        service.signupWithEmail = function(email, password){
            service.reset();

            var deferred = $q.defer();

            firebase.auth().createUserWithEmailAndPassword(email, password).then(function(success){
                deferred.resolve(success);
            }).catch(function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        };

        service.notifyOfNewAccount = function(idToken, params){
            var deferred = $q.defer();
            console.log('idtoken: ', idToken);
            console.log('params: ', params);

            var apiURL = ENDPOINT_LIST.REGISTER_SUBMIT_API;
            var postData = 'id_token=' + encodeURIComponent(idToken);

            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                postData += '&' + encodeURIComponent(param['key']) + '=' + encodeURIComponent(param['value']);
            }

            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            }

            $http.post(apiURL, postData, config)
                .success(function(response) {
                    if (response['success']) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject(response);
                    }
                })
                .error(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        };

        service.resetPassword = function(username){
          var defer = $q.defer();

          firebase.auth().sendPasswordResetEmail(username).then(
            function(success){
              defer.resolve(success);
            },
            function(error){
              defer.reject(error);
            }
          );

          return defer.promise;
        };

        // Logout
        service.logout = function() {
            service.reset();
        }

        return service;
    } // end of factory function
]);
