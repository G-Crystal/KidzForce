appControllers

    .controller('IntroCtrl',
        ['$scope', '$state', '$ionicSlideBoxDelegate',
            function($scope, $state, $ionicSlideBoxDelegate) {

                $scope.slideIndex = 0;

                // Called each time the slide changes
                $scope.slideChanged = function(index) {
                    console.log('slideChanged: ' + index);

                    $scope.slideIndex = index;
                }

                // Call previous slide
                $scope.previous = function() {
                    $ionicSlideBoxDelegate.previous();
                }

                // Call next slide
                $scope.next = function() {
                    $ionicSlideBoxDelegate.next();
                }

                window.getParameterByName = function(name, url) {
                    if (!url) url = window.location.href;
                    name = name.replace(/[\[\]]/g, "\\$&");
                    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                        results = regex.exec(url);
                    if (!results) return null;
                    if (!results[2]) return '';
                    return decodeURIComponent(results[2].replace(/\+/g, " "));
                }

                window.handleOpenURL = function(url){
                    setTimeout(function(){
                        var code = window.getParameterByName('code', url);
                        var email = window.getParameterByName('email', url);

                        if ((code != "" && code != null) && (email != "" && email != null)){
                          $localStorage['guest_email'] = email;
                          $localStorage['gueest_code'] = code;
                          $state.go('login-invited-guest');
                        }
                    }, 0);
                };

                //

            } // end of controller function
        ]
    );
