angular.module('kb')

.factory('NotificationService', ['$http', '$q', '$localStorage', 'ENDPOINT_LIST', '$firebaseArray',
    function($http, $q, $localStorage, ENDPOINT_LIST, $firebaseArray) {

        var service = {};

        service.respond = function(notifyId, response) {
            var deferred = $q.defer();
            var apiURL = ENDPOINT_LIST.CHILD_NOTIFICATION_RESPOND_API;
            var postData = 'notifiableid=' + encodeURIComponent(notifyId) + '&answer=' + encodeURIComponent(response);

            postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+$localStorage['password'];

            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Authorized-Member-ID': $localStorage['username'],
                    'Authorized-Member-Pin': $localStorage['password']
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
                    //console.log(error);

                    deferred.reject(error);
                });

            return deferred.promise;
        };

        service.notificationaction = function(notifyId, value, star) {
            var deferred = $q.defer();
            var postData
            var apiURL = ENDPOINT_LIST.CHILD_NOTIFICATION_RESPOND_API;
            if (star != "") {
                postData = 'notifiable_id=' + notifyId + '&response_value=' + value + '&response_additional_data=' + star;
            } else {
                postData = 'notifiable_id=' + notifyId + '&response_value=' + value;
            }

            if (typeof($localStorage['username']) == 'undefined' || $localStorage['username'] == null){
              postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['uid'])+'&api_token='+encodeURIComponent($localStorage['uid']);
            }else{
              postData += '&Authorized_Member_ID='+encodeURIComponent($localStorage['username'])+'&Authorized_Member_Pin='+$localStorage['password'];
            }
            console.log(postData);
            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Authorized-Member-ID': $localStorage['username'],
                    'Authorized-Member-Pin': $localStorage['password']
                }
            }
            //console.log(config);



            $http.post(apiURL, postData, config)
                .success(function(response) {
                    console.log(response);
                    if (response['success']) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject(response);
                    }
                })
                .error(function(error) {
                    //console.log(error);

                    deferred.reject(error);
                });

            return deferred.promise;
        };

        var isParent = function(){
            if (typeof($localStorage['parent']) != 'undefined' && $localStorage['parent'] != null){
                return true;
            }else{
                return false;
            }
        };

        service.reload = function(new_page, childId, isAParent){
            var deferred = $q.defer();
            if (childId == undefined || typeof(childId) == 'undefined'){
              deferred.reject('Please provide a userId');
            }

            if (typeof(childId) != 'undefined'){
              if (isAParent){
                var apiURL = ENDPOINT_LIST.PARENT_RELOAD_NOTIFICATIONS_API + '?Authorized_Member_ID='+childId+'&page=' + new_page;
              }else{
                var apiURL = ENDPOINT_LIST.CHILD_RELOAD_NOTIFICATIONS_API + '?member-id='+childId+'&readnotifications&page=' + new_page;
              }
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    }
                }
            }else{
                var apiURL = ENDPOINT_LIST.PARENT_RELOAD_NOTIFICATIONS_API + '?page=' + new_page + '&Authorized_Member_ID=' + $localStorage['uid'];
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'Authorized_Member_ID': 'M82TBrvdHYSVBH6eDnkUmzkHSGx2'
                    }
                }
            }

            //console.log(config);

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

        service.reloadProfile = function(){
            var deferred = $q.defer();
            var apiURL = ENDPOINT_LIST.CHILD_PROFILE_API;
            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Authorized-Member-ID': $localStorage['username'],
                    'Authorized-Member-Pin': $localStorage['password']
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

        service.getNotificationsFromFB = function(userId){
            var deferred = $q.defer();
            var ref = firebase.database().ref().child('notifications').child(userId);
            var obj = $firebaseArray(ref);
            obj.$loaded().then(function(){
                deferred.resolve(obj);
            });

            return deferred.promise;
        };

        return service;
    } // end of factory function
]);
