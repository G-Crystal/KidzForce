angular.module('kb')

    .factory('ParentService',
        ['$http', '$q', '$localStorage', 'ENDPOINT_LIST', '$firebaseObject', '$firebaseArray', 'ChildrenService',
            function($http, $q, $localStorage, ENDPOINT_LIST, $firebaseObject, $firebaseArray, ChildrenService) {

                var service = {};

                service.getProfile = function(){
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.PARENT_PROFILE_API;

                    apiURL += '?&api_token='+encodeURIComponent($localStorage['uid']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['uid']
                        }
                    }

                    $http.get(apiURL, config)
                        .success(function(response) {
                          
                            if (response['success']){
                                deferred.resolve(response);
                            }else{
                                deferred.reject(response);
                            }
                        })
                        .error(function(error) {
                            //console.log(error);

                            deferred.reject(error);
                    });

                    return deferred.promise;
                };

                service.getChorePresets = function(){
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.CHORE_PRESET_API;

                    apiURL += '?&Authorized_Member_ID='+encodeURIComponent($localStorage['uid']);


                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json'
                        }
                    }

                    $http.get(apiURL, config)
                        .success(function(response) {

                            if (response['success']){
                                deferred.resolve(response);
                            }else{
                                deferred.reject(response);
                            }
                        })
                        .error(function(error) {
                            //console.log(error);

                            deferred.reject(error);
                    });

                    return deferred.promise;
                };

                service.validateProject = function(index, params){
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.PROJECT_ADD_VALIDATION_API;
                    var postData = 'step=' + encodeURIComponent(index);

                    for (var i = 0; i < params.length; i++) {
                        var param = params[i];
                        postData += '&' + encodeURIComponent(param['key']) + '=' + encodeURIComponent(param['value']);
                    }

                    postData += '&api_token=' + encodeURIComponent($localStorage['uid']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json'
                        }
                    }

                    $http.post(apiURL, postData, config)
                        .success(function(response) {

                            if (response['success']){
                                deferred.resolve(response);
                            }else{
                                deferred.reject(response);
                            }
                        })
                        .error(function(error) {
                            //console.log(error);

                            deferred.reject(error);
                    });


                    return deferred.promise;
                };

                service.retriveLocalResults = function(lat, lng, mile_range){
                    // if (mile_range == null){
                    //     mile_range = 50; //50 Miles
                    // }

                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.PARENT_PROJECTS_API;
                    var postData = '?api_token=' + encodeURIComponent($localStorage['uid']);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['uid']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['uid']
                        }
                    };
                    //console.log('attempting: ' + apiURL+postData);
                    $http.get(apiURL+postData, config)
                        .success(function(response) {
                          //console.log(response);
                            deferred.resolve(response);
                        })
                        .error(function(error) {
                          console.error(error);
                            deferred.reject(error);
                        });

                    return deferred.promise;
                };

                service.getChildren = function(){
                    // if (mile_range == null){
                    //     mile_range = 50; //50 Miles
                    // }

                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.PARENT_CHILDREN_API;
                    var postData = '?api_token=' + encodeURIComponent($localStorage['uid']);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['uid']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['uid']
                        }
                    };

                    //console.log('attempting: ' + apiURL+postData);
                    $http.get(apiURL+postData, config)
                        .success(function(response) {
                          //console.log(response);
                            deferred.resolve(response);
                        })
                        .error(function(error) {
                          console.error(error);
                            deferred.reject(error);
                        });

                    return deferred.promise;
                };

                service.getIdentityStatus = function(){
                    var deferred = $q.defer();

                    // var apiURL = ENDPOINT_LIST.PARENT_IDENTITY_STATUS_API;

                    // apiURL += '?&Authorized_Member_ID='+encodeURIComponent($localStorage['uid']);

                    // var config = {
                    //     headers: {
                    //         'Content-Type': 'application/x-www-form-urlencoded',
                    //         'Accept': 'application/json',
                    //         'Authorized_Member_ID': $localStorage['uid']
                    //     }
                    // }

                    // $http.get(apiURL, config)
                    //     .success(function(response) {

                    //         if (response['success']){
                    //             deferred.resolve(response);
                    //         }else{
                    //             deferred.reject(response);
                    //         }
                    //     })
                    //     .error(function(error) {
                    //         //console.log(error);

                    //         deferred.reject(error);
                    // });

                    var ref = firebase.database().ref().child('identities').child($localStorage['uid']);
                    var obj = $firebaseObject(ref);
                    obj.$loaded().then(function(){
                      if (typeof(obj.status) == 'undefined'){
                        deferred.resolve({
                          passed: 'not checked'
                        });
                      }else{
                        if (obj.status == 'passed'){
                          deferred.resolve({
                            passed: 'passed'
                          });
                        }else if (obj.status == 'failed'){
                          deferred.resolve({
                            passed: 'failed'
                          });
                        }else{
                          deferred.resolve({
                            passed: 'not checked'
                          });
                        }
                      }
                    });


                    return deferred.promise;
                };

                service.verifyIdentity = function(addressObject, phone, ssn){
                  var deferred = $q.defer();

                  var apiURL = ENDPOINT_LIST.PARENT_IDENTITY_VERIFY_API;

                  apiURL += '?&Authorized_Member_ID='+encodeURIComponent($localStorage['uid']);

                  var config = {
                      headers: {
                          'Content-Type': 'application/x-www-form-urlencoded',
                          'Accept': 'application/json',
                          'Authorized_Member_ID': $localStorage['uid']
                      }
                  }

                  var postData = '';

                  for (var i = 0; i < Object.keys(addressObject).length; i++) {
                      var key = Object.keys(addressObject)[i];
                      var key_value = addressObject[key];
                      postData += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(key_value);
                  }

                  postData += '&phone=' + encodeURIComponent(phone) + '&ssn=' + encodeURIComponent(ssn); 

                  console.log(apiURL);
                  console.log(postData);

                  $http.post(apiURL, postData, config)
                      .success(function(response) {
                        console.log(response);
                          if (response['success']){
                              deferred.resolve(response);
                          }else{
                              deferred.reject(response);
                          }
                      })
                      .error(function(error) {
                          console.log(error);

                          deferred.reject(error);
                  });


                  return deferred.promise;
                };

                service.updateAccount = function(profileObject){
                  var deferred = $q.defer();

                  var apiURL = ENDPOINT_LIST.PARENT_PROFILE_UPDATE_API;

                  apiURL += '?&Authorized_Member_ID='+encodeURIComponent($localStorage['uid']);

                  var config = {
                      headers: {
                          'Content-Type': 'application/x-www-form-urlencoded',
                          'Accept': 'application/json',
                          'Authorized_Member_ID': $localStorage['uid']
                      }
                  }

                  var params = 'mobile_phone='+profileObject.mobile_phone+'&address='+profileObject.home_address;

                  $http.post(apiURL, params, config)
                      .success(function(response) {

                          if (response['success']){
                              deferred.resolve(response);
                          }else{
                              deferred.reject(response);
                          }
                      })
                      .error(function(error) {
                          //console.log(error);

                          deferred.reject(error);
                  });

                  return deferred.promise;
                };

                service.getIdentity = function(uid){
                  var deferred = $q.defer();

                  var ref = firebase.database().ref().child('identities').child(uid);
                  var obj = $firebaseObject(ref);

                  obj.$loaded().then(function(){
                    deferred.resolve(obj);
                  });

                  return deferred.promise;
                };

                service.getProfileFromFB = function(uid){
                  var deferred = $q.defer();

                  var ref = firebase.database().ref().child('firebase_users').child(uid);
                  var obj = $firebaseObject(ref);


                  obj.$loaded().then(function(){
                    deferred.resolve(obj);
                  });

                  return deferred.promise;
                };  

                service.deleteChild = function(childId){
                  var deferred = $q.defer();

                  var apiURL = ENDPOINT_LIST.DELETE_PARENT_CHILD_API;

                  apiURL += '?&Authorized_Member_ID='+encodeURIComponent($localStorage['uid']);

                  var config = {
                      headers: {
                          'Content-Type': 'application/x-www-form-urlencoded',
                          'Accept': 'application/json',
                          'Authorized_Member_ID': $localStorage['uid']
                      }
                  }

                  var params = 'id='+encodeURIComponent(childId)+'&api_token='+$localStorage['uid'];

                  $http.post(apiURL, params, config)
                      .success(function(response) {

                          if (response['success']){
                              deferred.resolve(response);
                          }else{
                              deferred.reject(response);
                          }
                      })
                      .error(function(error) {
                          //console.log(error);

                          deferred.reject(error);
                  });

                  return deferred.promise;
                };

                service.getPaymentMethods = function(uid){
                  var deferred = $q.defer();

                  var ref = firebase.database().ref().child('payment_methods').child(uid);
                  var obj = $firebaseObject(ref);


                  obj.$loaded().then(function(){
                    console.log(obj);
                    deferred.resolve(obj);
                  });

                  return deferred.promise;
                };

                service.getPaymentMethodsArray = function(uid){
                  var deferred = $q.defer();

                  var ref = firebase.database().ref().child('payment_methods').child(uid);
                  var obj = $firebaseArray(ref);


                  obj.$loaded().then(function(){
                    console.log(obj);
                    deferred.resolve(obj);
                  });

                  return deferred.promise;
                };

                service.savePaymentMethods = function(uid, paymentMethod){
                  var deferred = $q.defer();
                  service.getPaymentMethodsArray(uid).then(function(methods){
                    // methods = methods.concat(paymentMethod);
                    // methods.$add(paymentMethod).then(function(){
                    //   methods.$save().then(function(){
                    //     deferred.resolve(methods);
                    //   });
                    // });
                    window.m= methods;
                    setTimeout(function(){
                      console.log(paymentMethod);
                      methods.$add(paymentMethod).then(function(){
                        console.log('success');
                        // methods.$save().then(function(){
                          console.log('saved');
                          deferred.resolve(methods);
                        // });
                      },function(){
                        console.error('failed');
                      });
                    },100);
                    // deferred.resolve(methods);
                  });
                  return deferred.promise;
                };

                service.updatePaymentMethod = function(uid, paymentId, paymentMethod){
                  var deferred = $q.defer();
                  service.getPaymentMethods(uid).then(function(methods){
                    methods[paymentId] = paymentMethod;
                    methods.$save().then(function(){
                      deferred.resolve(methods);
                    });
                    // window.mmm = methods;
                  });
                  return deferred.promise;
                };

                service.deletePaymentMethod = function(uid, paymentMethod){
                  var deferred = $q.defer();
                  service.getPaymentMethods(uid).then(function(methods){
                    delete methods[paymentMethod];
                    methods.$save().then(function(){
                      deferred.resolve(methods);
                    });
                    // window.mmm = methods;
                  });
                  return deferred.promise;
                };

                service.getPayoutMethods = function(uid, isParent){
                  var deferred = $q.defer();

                  var ref = firebase.database().ref().child('payout_methods').child(uid);
                  var obj = $firebaseObject(ref);


                  obj.$loaded().then(function(){
                    if (isParent){
                      deferred.resolve(obj);
                    }else{
                      deferred.resolve(obj);
                      return;
                      //TODO: implement payout updating for children;
                      var finalizedObj = {};
                      for (var i = 0; i < Object.keys(obj).length; i++) {
                        if (Object.keys(obj)[i] != '$$conf' && Object.keys(obj)[i] != '$id' && Object.keys(obj)[i] != '$priority' && Object.keys(obj)[i] != '$resolved' && Object.keys(obj)[i] != '$value'){
                          finalizedObj[Object.keys(obj)[i]] = obj[Object.keys(obj)[i]];
                        }
                      }
                      ChildrenService.getChildById(uid).then(function(profile){
                        service.getPayoutMethods(profile.parent_uid, true).then(function(parentPayouts){
                          for (var i = 0; i < Object.keys(parentPayouts).length; i++) {
                            if (Object.keys(parentPayouts)[i] != '$$conf' && Object.keys(parentPayouts)[i] != '$id' && Object.keys(parentPayouts)[i] != '$priority' && Object.keys(parentPayouts)[i] != '$resolved' && Object.keys(parentPayouts)[i] != '$value'){
                              finalizedObj[Object.keys(parentPayouts)[i]] = parentPayouts[Object.keys(parentPayouts)[i]];
                            }
                          }

                          deferred.resolve(finalizedObj);
                        });
                      }, function(error){
                        deferred.resolve(finalizedObj);
                      });
                    }
                  });

                  return deferred.promise;
                };

                service.getPayoutMethodsArray = function(uid){
                  var deferred = $q.defer();

                  var ref = firebase.database().ref().child('payout_methods').child(uid);
                  var obj = $firebaseArray(ref);


                  obj.$loaded().then(function(){
                    console.log(obj);
                    deferred.resolve(obj);
                  });

                  return deferred.promise;
                };

                service.savePayoutMethods = function(uid, payoutMethod){
                  var deferred = $q.defer();
                  service.getPayoutMethodsArray(uid).then(function(methods){
                    methods.$add(payoutMethod);
                    methods.$save();
                    deferred.resolve(methods);
                  });
                  return deferred.promise;
                };

                service.updatePayoutMethod = function(uid, payoutId, payoutMethod){
                  var deferred = $q.defer();
                  service.getPayoutMethods(uid).then(function(methods){
                    methods[payoutId] = payoutMethod;
                    methods.$save().then(function(){
                      deferred.resolve(methods);
                    });
                    // window.mmm = methods;
                  });
                  return deferred.promise;
                };

                service.deletePayoutMethod = function(uid, payoutMethod){
                  var deferred = $q.defer();
                  service.getPayoutMethods(uid).then(function(methods){
                    delete methods[payoutMethod];
                    methods.$save().then(function(){
                      deferred.resolve(methods);
                    });
                    // window.mmm = methods;
                  });
                  return deferred.promise;
                };

                service.sendNotificationPreferenceChange = function(value){
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.PREFERENCE_CHANGE_API;
                    var postData = 'preference_value=' + encodeURIComponent(value);
                    postData += '&api_token='+encodeURIComponent($localStorage['uid'])+'&Authorized_Member_ID='+encodeURIComponent($localStorage['uid']);
                    apiURL += '?&api_token='+encodeURIComponent($localStorage['uid'])+'&Authorized_Member_ID='+encodeURIComponent($localStorage['uid']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['uid'],
                            'Authorized-Member-ID': $localStorage['uid']
                        }
                    };

                    console.log(apiURL);

                    $http.post(apiURL, postData, config)
                        .success(function(response) {
                            console.log(response);
                            if (response['success']){
                                deferred.resolve(response);
                            }else{
                                deferred.reject(response);
                            }
                        })
                        .error(function(error) {
                            //console.log(error);

                            deferred.reject(error);
                        });


                    return deferred.promise;
                };


            return service;
            } // end of factory function
        ]
    );
