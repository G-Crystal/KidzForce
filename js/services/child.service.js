angular.module('kb')

    .factory('ChildService',
        ['$http', '$q', '$localStorage', 'ENDPOINT_LIST', '$firebaseObject', '$firebaseArray',
            function($http, $q, $localStorage, ENDPOINT_LIST, $firebaseObject, $firebaseArray) {

                var service = {};

                service.updateResume = function(memberid, resume){
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.CHILD_RESUME_UPDATE_API;
                    var postData = 'member-id=' + encodeURIComponent(memberid) + '&resume=' + encodeURIComponent(resume);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['username'],
                            'Authorized_Member_Pin': $localStorage['password']
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

                service.updatePassword = function(memberid, newpassword, newpassword_confirm){
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.CHILD_PASSWORD_UPDATE_API;
                    var postData = 'member-id=' + memberid + '&password=' + encodeURIComponent(newpassword) + '&confirm=' + encodeURIComponent(newpassword_confirm);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['username'],
                            'Authorized_Member_Pin': $localStorage['password']
                        }
                    }

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

                service.deleteAccount = function(memberid, password){
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.CHILD_DELETE_API;
                    var postData = 'member-id=' + memberid + '&password=' + encodeURIComponent(password);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['username'],
                            'Authorized_Member_Pin': $localStorage['password']
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
                    if (mile_range == null){
                        mile_range = 50; //50 Miles
                    }

                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.CHILD_LOCAL_RESULTS_API;
                    var postData = 'lat=' + encodeURIComponent(lat) + '&lng=' + encodeURIComponent(lng);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['username'],
                            'Authorized_Member_Pin': $localStorage['password']
                        }
                    };

                    $http.post(apiURL, postData, config)
                        .success(function(response) {
                            deferred.resolve(response);
                        })
                        .error(function(error) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                };

                service.viewChore = function(chore_id){
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.PROJECT_VIEW_API;
                    var postData = 'chore_id=' + encodeURIComponent(chore_id);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['username'],
                            'Authorized_Member_Pin': $localStorage['password']
                        }
                    }

                    $http.post(apiURL, postData, config)
                        .success(function(response) {
                            deferred.resolve(response);
                        })
                        .error(function(error) {
                            //console.log(error);

                            deferred.reject(error);
                        });

                    return deferred.promise;
                };

                service.applyForChore = function(chore_id){
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.PROJECT_APPLY_API;
                    var postData = 'chore_id=' + encodeURIComponent(chore_id);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['username'],
                            'Authorized_Member_Pin': $localStorage['password']
                        }
                    }

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
                            //console.log(error);

                            deferred.reject(error);
                        });

                    return deferred.promise;
                };

            service.checkIn = function(chore_id){
                console.log(chore_id);
                    var deferred = $q.defer();

                    var apiURL = ENDPOINT_LIST.CHILD_PROJECT_CHECKIN_API;
                    var postData = 'chore_id=' + encodeURIComponent(chore_id);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['username'],
                            'Authorized_Member_Pin': $localStorage['password']
                        }
                    }

                    $http.post(apiURL, postData, config)
                        .success(function(response) {
                          console.log(response);
                            // if (response['success']){
                            //     deferred.resolve(response);
                            // }else{
                            //     deferred.reject(response);
                            // }
                        })
                        .error(function(error) {
                            console.log(error);

                            deferred.reject(error);
                        });

                    return deferred.promise;
                };



            service.getRewards = function(){
                var deferred = $q.defer();

                var apiURL = 'rewards.json';

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'Authorized_Member_ID': $localStorage['username'],
                        'Authorized_Member_Pin': $localStorage['password']
                    }
                }

                $http.get(apiURL, config)
                    .success(function(response) {
                        deferred.resolve(response);
                    })
                    .error(function(error) {
                        //console.log(error);

                        deferred.reject(error);
                    });

                return deferred.promise;
            };

            service.requestDeposit = function(){
                var deferred = $q.defer();

                var apiURL = ENDPOINT_LIST.CHILD_REQUEST_DEPOSIT_API;

                apiURL += '?&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);


                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'Authorized_Member_ID': $localStorage['username'],
                        'Authorized_Member_Pin': $localStorage['password']
                    }
                }

                //console.log(apiURL);
                //console.log(config);
                $http.get(apiURL, config)
                    .success(function(response) {
                        //console.log(response);
                        if (response['success']){
                            deferred.resolve(response);
                        }else{
                            deferred.reject(response);
                        }
                    })
                    .error(function(error) {
                        console.error(error);

                        deferred.reject(error);
                    });

                return deferred.promise;
            };

            service.getNotifications = function(childId){
              var deferred = $q.defer();

              var apiURL = ENDPOINT_LIST.DOMAIN + 'children/getnotifications?member-id='+encodeURIComponent(childId)+'&readnotifications';

              var config = {
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Accept': 'application/json'
                  }
              }

              //console.log(apiURL);
              //console.log(config);
              $http.get(apiURL, config)
                  .success(function(response) {
                      //console.log(response);
                      //if (response['success']){
                          deferred.resolve(response);
                      //}else{
                      //    deferred.reject(response);
                      //}
                  })
                  .error(function(error) {
                      console.error(error);

                      deferred.reject(error);
                  });

              return deferred.promise;
            };

            service.createChild = function(childParams){
              var defer = $q.defer();

              var config = {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
                }
              };

              var params = 'gender='+encodeURIComponent(childParams.gender+1)+'&username='+encodeURIComponent(childParams.username)+'&name='+encodeURIComponent(childParams.name)+'&month='+encodeURIComponent(childParams.birthdate.getMonth()+1)+'&day='+encodeURIComponent(childParams.birthdate.getDate())+'&year='+encodeURIComponent(childParams.birthdate.getFullYear())+'&phone='+encodeURIComponent(childParams.phone)+'&pin='+encodeURIComponent(childParams.pin)+'&api_token='+encodeURIComponent($localStorage['uid']);

              $http.post(ENDPOINT_LIST.DOMAIN + 'children/add', params, config)
                .success(function(response){
                  if (response['success']){
                    defer.resolve(response);
                  }else{
                    defer.reject(response);
                  }
                })
                .error(function(error){
                  defer.reject(error);
                });

              return defer.promise;
            };

            service.updateChild = function(childParams){
              var defer = $q.defer();

              var config = {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
                }
              };

              var params = 'id='+encodeURIComponent(childParams.id)+'&gender='+encodeURIComponent(childParams.gender+1)+'&username='+encodeURIComponent(childParams.username)+'&name='+encodeURIComponent(childParams.name)+'&month='+encodeURIComponent(childParams.birthdate.getMonth()+1)+'&day='+encodeURIComponent(childParams.birthdate.getDate())+'&year='+encodeURIComponent(childParams.birthdate.getFullYear())+'&phone='+encodeURIComponent(childParams.phone)+'&pin='+encodeURIComponent(childParams.pin)+'&api_token='+encodeURIComponent($localStorage['uid']);

              console.log(params);

              $http.post(ENDPOINT_LIST.DOMAIN + 'children/update', params, config)
                .success(function(response){
                    console.error(response);
                  if (response['success']){
                    defer.resolve(response);
                  }else{
                    defer.reject(response);
                  }
                })
                .error(function(error){
                  defer.reject(error);
                });

              return defer.promise;
            };

            service.getProfile = function(childId){
              var defer = $q.defer();

              var config = {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
                }
              };

              var params = 'childId='+encodeURIComponent(childId)+'&api_token='+encodeURIComponent($localStorage['uid']);

              $http.post(ENDPOINT_LIST.DOMAIN + 'children/get', params, config)
                .success(function(response){
                  if (response['success']){
                    defer.resolve(response);
                  }else{
                    defer.reject(response);
                  }
                })
                .error(function(error){
                  defer.reject(error);
                });

              return defer.promise;
            };

            service.getProfileFromFB = function(uid){
              var deferred = $q.defer();

              var ref = firebase.database().ref().child('children').child(uid);
              var obj = $firebaseObject(ref);

              obj.$loaded().then(function(){
                deferred.resolve(obj);
              });

              return deferred.promise;
            }; 

            service.getReviews = function(uid){
                var deferred = $q.defer();

                var ref = firebase.database().ref().child('project_reviews').child(uid);
                var obj = $firebaseArray(ref);

                obj.$loaded().then(function(){
                    deferred.resolve(obj);
                });

                return deferred.promise;
            };

            service.storeContacts = function(uid, contact){
                var deferred = $q.defer();

                var ref = firebase.database().ref().child('emergency_contacts').child(uid);
                var obj = $firebaseArray(ref);

                obj.$loaded().then(function(){
                    obj.$add(contact).then(function(){ });
                    obj.$save().then(function(){
                        deferred.resolve(true);
                    });
                });

                return deferred.promise;
            };

            service.getEmergencyContacts = function(uid){
                var deferred = $q.defer();

                var ref = firebase.database().ref().child('emergency_contacts').child(uid);
                var obj = $firebaseArray(ref);

                obj.$loaded().then(function(){
                    deferred.resolve(obj);
                });

                return deferred.promise;
            };

            service.getProjectApplications = function(uid){
                var deferred = $q.defer();

                var ref = firebase.database().ref().child('project_applications').child(uid);
                var obj = $firebaseArray(ref);

                obj.$loaded().then(function(){
                    deferred.resolve(obj);
                });

                return deferred.promise;
            };

            service.getMyProjects = function(uid){
                var deferred = $q.defer();

                var ref = firebase.database().ref().child('chores').orderByChild('child_uid').equalTo(uid);
                var obj = $firebaseArray(ref);

                obj.$loaded().then(function(){
                    deferred.resolve(obj);
                });

                return deferred.promise;
            };

            service.toUTCDate = function(date){
              var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
              return _utc;
            };

            service.dailyRooAvailable = function(uid){
                var deferred = $q.defer();

                var ref = firebase.database().ref().child('daily_drops').child(uid);
                var obj = $firebaseObject(ref);

                obj.$loaded().then(function(){
                    var date = new Date();
                    var utcDate = service.toUTCDate(date);
                    var numOfDays = service.dateDiffInDays(new Date(obj.$value), utcDate);
                    console.log(numOfDays);
                    if (numOfDays >= 1){
                        deferred.resolve('available');
                    }else{
                        deferred.reject('unavailable');
                    }
                });

                return deferred.promise;
            };

            // a and b are javascript Date objects
            service.dateDiffInDays = function(a, b) {
                var _MS_PER_DAY = 1000 * 60 * 60 * 24;
                // Discard the time and time-zone information.
                var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

                return Math.floor((utc2 - utc1) / _MS_PER_DAY);
            }

            service.awardDailyRoo = function(uid, reward, isParent){
                var deferred = $q.defer();

                var ref = firebase.database().ref().child('daily_drops').child(uid);
                var obj = $firebaseObject(ref);

                obj.$loaded().then(function(){
                    var date = new Date();
                    var utcDate = service.toUTCDate(date);
                    var dateTime = utcDate.getTime();
                    obj.$value = dateTime;

                    //send reward to server
                    var apiURL = ENDPOINT_LIST.DAILY_DROP_REWARD_API;
                    var postData = '&uid='+encodeURIComponent(uid)+'&isParent='+encodeURIComponent(isParent)+'&points='+encodeURIComponent(reward);

                    postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'Authorized_Member_ID': $localStorage['username'],
                            'Authorized_Member_Pin': $localStorage['password']
                        }
                    }
                    
                    obj.$save().then(function(){
                        $http.post(apiURL, postData, config)
                            .success(function(response) {
                                if (response['success']){
                                    deferred.resolve('awarded');
                                }else{
                                    deferred.reject('unable to award');
                                }
                            })
                            .error(function(error) {
                                //console.log(error);

                                deferred.reject('unable to award');
                            });
                    });
                });

                return deferred.promise;
            };

            service.requestHelp = function(number1, number2){
                var deferred = $q.defer();

                var apiURL = ENDPOINT_LIST.REQUEST_HELP_API;
                var postData = 'phone_1=' + (number1) + '&phone_2=' + (number2);

                postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+encodeURIComponent($localStorage['password']);

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'Authorized_Member_ID': $localStorage['username'],
                        'Authorized_Member_Pin': $localStorage['password']
                    }
                }

                console.log(postData);

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

            service.requestReward = function(rewardId){
                var deferred = $q.defer();

                var apiURL = ENDPOINT_LIST.REDEEM_POINTS_API;
                var postData = 'reward_id=' + rewardId;

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'Authorized_Member_ID': $localStorage['username'],
                        'Authorized_Member_Pin': $localStorage['password']
                    }
                };

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
                        //console.log(error);

                        deferred.reject(error);
                    });

                return deferred.promise;
            };

            service.sendNotificationPreferenceChange = function(value){
                var deferred = $q.defer();

                var apiURL = ENDPOINT_LIST.PREFERENCE_CHANGE_API;
                var postData = 'preference_value=' + encodeURIComponent(value);

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'Authorized_Member_ID': $localStorage['username'],
                        'Authorized_Member_Pin': $localStorage['password']
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

            service.quitProject = function(choreId){
                var deferred = $q.defer();

                var apiURL = ENDPOINT_LIST.CANCEL_PROJECT_API;
                var postData = 'chore_id=' + encodeURIComponent(choreId);

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'Authorized_Member_ID': $localStorage['username'],
                        'Authorized_Member_Pin': $localStorage['password']
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
