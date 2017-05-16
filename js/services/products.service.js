angular.module('kb')

.factory('ProductsService', ['$http', '$q', '$localStorage', 'ENDPOINT_LIST', 'inAppPurchase',
    function($http, $q, $localStorage, ENDPOINT_LIST, inAppPurchase) {

        var service = {};

        service.loadProducts = function(){
            var defer = $q.defer();

            return defer.promise;
        };

        service.purchaseProduct = function(identifier){
            var defer = $q.defer();

            inAppPurchase
              .getProducts([identifier])
              .then(function (products) {
                console.log(products);
                /*
                   [{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
                */
              })
              .catch(function (err) {
                console.log(err);
              });

            return defer.promise;
        };

        return service;
    } // end of factory function
]);
