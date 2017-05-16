angular.module('kb')

.factory('ProjectService', ['$http', '$q', '$localStorage', 'ENDPOINT_LIST', '$firebaseArray', '$firebaseObject',
    function($http, $q, $localStorage, ENDPOINT_LIST, $firebaseArray, $firebaseObject) {

        var service = {};

        service.popularItems = function(){
          var defer = $q.defer();

          var config = {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          }

          $http.get(ENDPOINT_LIST.DOMAIN + 'projects/popularItems?api_token='+encodeURIComponent($localStorage['uid']), config)
            .success(function(response){
              if (response['success']){
                defer.resolve(response['chores']);
              }else{
                defer.reject(response);
              }
            })
            .error(function(error){
              defer.reject(error);
            });

          return defer.promise;
        };

        service.relatedItems = function(title){
          var defer = $q.defer();

          var config = {
            headers: {
              "Ocp-Apim-Subscription-Key": "bf46b7d464d648418fa78fd118466d2b"
            }
          };

          $http.get('https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + title + '&count=6&offset=0&mkt=en-us&safeSearch=Strict', config)
            .success(function(response){
              defer.resolve(response.value);
            })
            .error(function(error){
              defer.reject(error);
            });

          return defer.promise;
        };

        service.createProject = function(projectParams, paymentMethod){
          var defer = $q.defer();

          var config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            }
          };

          var params = 'projectId='+encodeURIComponent(projectParams.id)+'&title='+encodeURIComponent(projectParams.title)+'&date='+encodeURIComponent(projectParams.date)+'&projectType='+encodeURIComponent(projectParams.type)+'&price='+encodeURIComponent(projectParams.price)+'&description='+encodeURIComponent(projectParams.description)+'&member-id='+encodeURIComponent(projectParams.member_id)+'&photos_base64='+encodeURIComponent(projectParams.photos)+'&timezone_offset='+encodeURIComponent(projectParams.timezone_offset)+'&minimum_age='+encodeURIComponent(projectParams.age_range)+'&api_token=' +encodeURIComponent($localStorage['uid']);

          params += '&address=' + encodeURIComponent(projectParams.addressObject.address) + '&address_2=' + encodeURIComponent(projectParams.addressObject.address_2) + '&city=' + encodeURIComponent(projectParams.addressObject.city) + '&state=' + encodeURIComponent(projectParams.addressObject.state) + '&zip=' + encodeURIComponent(projectParams.addressObject.zip);
          params += '&card=' + encodeURIComponent(paymentMethod.card) + '&ccv=' + encodeURIComponent(paymentMethod.ccv) + '&card_name=' + encodeURIComponent(paymentMethod.name);
 
          $http.post(ENDPOINT_LIST.DOMAIN + 'projects/add', params, config)
            .success(function(response){
              console.log(response);
              if (response['success']){

                service.cycleUserChores($localStorage['uid']).then(function(){
                  console.log('Cycled projects');
                });

                defer.resolve(response);
              }else{
                defer.reject(response);
              }
            })
            .error(function(error){
              defer.reject(response);
            });

          return defer.promise;
        };

        service.deleteProject = function(projectId){
          var defer = $q.defer();

          var config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            }
          };

          var params = 'projectId='+encodeURIComponent(projectId)+'&api_token=' +encodeURIComponent($localStorage['uid']);

          $http.post(ENDPOINT_LIST.DOMAIN + 'projects/delete', params, config)
            .success(function(response){
              if (response['success']){

                service.cycleUserChores($localStorage['uid']).then(function(){
                  console.log('Cycled projects');
                });

                defer.resolve(response);
              }else{
                defer.reject(response);
              }
            })
            .error(function(error){
              defer.reject(response);
            });

          return defer.promise;
        };

        service.cycleUserChores = function(uid){
          var defer = $q.defer();

          service.getUserChores(uid).then(
            function(chores){
              for (var i = 0; i < chores.length; i++) {
                var chore = chores[i];
                var locationRef = firebase.database().ref().child('chore-locations');
                var geoFire = new GeoFire(locationRef);
                geoFire.set(chore.id.toString(), [chore.lat, chore.lng]).then(function() {
                  console.log("Provided key has been added to GeoFire");
                }, function(error) {
                  console.log("Error: " + error);
                });
              }
              defer.resolve('Cycled');
            }
          );

          return defer.promise;
        };

        service.getChoreById = function(id){
          var defer = $q.defer();

          var ref = firebase.database().ref().child('chores').child(id);
          var obj = $firebaseObject(ref);

          obj.$loaded().then(function(){
            defer.resolve(obj);
          });

          return defer.promise;
        };

        service.getUserChores = function(uid){
          var defer = $q.defer();

          var firebaseRef = firebase.database().ref().child('user_chores').child(uid);
          var obj = $firebaseArray(firebaseRef);

          obj.$loaded().then(function(){
            defer.resolve(obj);
          });

          return defer.promise;
        };
        

        return service;
    } // end of factory function
]);
