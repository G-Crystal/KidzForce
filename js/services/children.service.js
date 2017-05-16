angular.module('kb')

    .factory('ChildrenService',
        ['$http', '$q', '$localStorage', 'ENDPOINT_LIST', '$firebaseArray', '$firebaseObject',
            function($http, $q, $localStorage, ENDPOINT_LIST, $firebaseArray, $firebaseObject) {

            var service = {};

            service.getChildrenForParent = function(uid){
            	var defer = $q.defer();

            	var ref = firebase.database().ref('children').child(uid);
            	var obj = $firebaseArray(ref);
            	obj.$loaded().then(function(){
            		defer.resolve(obj);
            	});

            	return defer.promise;
            };

            service.getChildFromParent = function(uid,childId){
                var defer = $q.defer();

                var ref = firebase.database().ref('children').child(uid);
                var obj = $firebaseArray(ref);
                obj.$loaded().then(function(){
                    for (var i = 0; i < obj.length; i++) {
                        if (obj[i].$id == childId){
                            defer.resolve(obj[i]);
                        }
                    }
                });

                return defer.promise;
            };

            service.childExists = function(uid){
                console.log(uid);
                var test = uid.split('');
                var uid = test[0] + test[1] + test[2] + '-' + test[3] + test[4] + test[5] + '-' + test[6] + test[7] + test[8];
                var defer = $q.defer();

                var ref = firebase.database().ref('children').child(uid);
                var obj = $firebaseObject(ref);
                obj.$loaded().then(function(){
                    console.log(obj);
                    if (obj.$value == null && obj.id != uid){
                        defer.reject('doesnt exist');
                    }else{
                        defer.resolve('exists');
                    }
                });

                return defer.promise;
            };

            service.getChildById = function(uid){
                //uid = uid.replace('-','');
                //var test = uid.split('');

                //var uid = test[0] + test[1] + test[2] + '-' + test[3] + test[4] + test[5] + '-' + test[6] + test[7] + test[8];
                var defer = $q.defer();

                var ref = firebase.database().ref('children').child(uid);
                var obj = $firebaseObject(ref);
                obj.$loaded().then(function(){
                    console.log(uid);
                    console.log(obj);
                    if (obj.$value == null && obj.id != uid){
                        defer.reject('doesnt exist');
                    }else{
                        defer.resolve(obj);
                    }
                });

                return defer.promise;
            };

            service.childExistsByName = function(username){
                var defer = $q.defer();

                var ref = firebase.database().ref('children').orderByChild('username').equalTo(username);
                var obj = $firebaseObject(ref);
                obj.$loaded().then(function(){
                    console.log(obj);
                });

                return defer.promise;
            };

            service.getChildBalanceForParent = function(uid){
                var defer = $q.defer();

                var ref = firebase.database().ref('child_balances').child(uid);
                var obj = $firebaseObject(ref);
                obj.$loaded().then(function(){
                    defer.resolve(obj);
                });

                return defer.promise;
            };

            return service;
            } // end of factory function
        ]
    );
