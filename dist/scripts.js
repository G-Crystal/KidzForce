var config = {
    apiKey: "AIzaSyBhxSeZh75dG3_3fuIdXzivdbU_ue2NC9g",
    authDomain: "kidzbiz101-9e406.firebaseapp.com",
    databaseURL: "https://kidzbiz101-9e406.firebaseio.com",
    storageBucket: "kidzbiz101-9e406.appspot.com",
    messagingSenderId: "339595614369"
};
firebase.initializeApp(config);

angular.module('kb', ['ionic', 'ngIOS9UIWebViewPatch', 'kb.controllers', 'ngMessages', 'ngCordova', 'kb.constant', 'ionic.rating', 'firebase', 'ngCordovaOauth', 'ngStorage', 'mgo-angular-wizard', 'ionic-datepicker', 'ionic-timepicker', 'ngAnimate', 'onezone-datepicker', 'ui.mask', 'uiGmapgoogle-maps'])
    .filter('capitalize', function() {
        return function(input) {
          return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })
    .filter('capitalizeWords', function () {
        return filter;

        function filter(input) {
            input = input.toLowerCase();
            if (input !== null) {
                return input.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }
        }
    })
    .directive('onValidSubmit', ['$parse', '$timeout', function($parse, $timeout) {
    return {
      require: '^form',
      restrict: 'A',
      link: function(scope, element, attrs, form) {
        form.$submitted = false;
        var fn = $parse(attrs.onValidSubmit);
        element.on('submit', function(event) {
          scope.$apply(function() {
            element.addClass('ng-submitted');
            form.$submitted = true;
            if (form.$valid) {
              if (typeof fn === 'function') {
                fn(scope, {$event: event});
              }
            }
          });
        });
      }
    }

  }])
  .directive('validated', ['$parse', function($parse) {
    return {
      restrict: 'AEC',
      require: '^form',
      link: function(scope, element, attrs, form) {
        var inputs = element.find("*");
        for(var i = 0; i < inputs.length; i++) {
          (function(input){
            var attributes = input.attributes;
            if (attributes.getNamedItem('ng-model') != void 0 && attributes.getNamedItem('name') != void 0) {
              var field = form[attributes.name.value];
              if (field != void 0) {
                scope.$watch(function() {
                  return form.$submitted + "_" + field.$valid;
                }, function() {
                  if (form.$submitted != true) return;
                  var inp = angular.element(input);
                  if (inp.hasClass('ng-invalid')) {
                    element.removeClass('has-success');
                    element.addClass('has-error');
                  } else {
                    element.removeClass('has-error').addClass('has-success');
                  }
                });
              }
            }
          })(inputs[i]);
        }
      }
    }
  }])
    .directive('dynamic', function ($compile) {
      return {
        restrict: 'A',
        replace: true,
        link: function (scope, ele, attrs) {
          scope.$watch(attrs.dynamic, function(html) {
            ele.html(html);
            $compile(ele.contents())(scope);
          });
        }
      };
    })
    .directive('onFileChange', function() {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          var onChangeHandler = scope.$eval(attrs.onFileChange);

          element.bind('change', function() {
            scope.$apply(function() {
              var files = element[0].files;
              if (files) {
                onChangeHandler(files);
              }
            });
          });

        }
      };
    })

    .run(function($ionicPlatform, $rootScope, $ionicHistory, $state, $ionicModal, $ionicLoading, $ionicPopup, $localStorage, ParentService, $q, $cordovaContacts, AuthService, $cordovaInAppBrowser, ChildService) {

        var storage = $localStorage.$default({
            first_run: true
        });

        if (!window.isBrowserMode){
            if (storage.first_run) {
                $localStorage['first_run'] = false;
                $state.go('intro');
            }else{
              $state.go('login');
            }
        }

        window.addEventListener('native.keyboardshow', keyboardShowHandler);

        function keyboardShowHandler(e){
            //alert('Keyboard height is: ' + e.keyboardHeight);
            console.log('keyboard showing');
            cordova.plugins.Keyboard.disableScroll(false);
            document.body.classList.add('keyboard-open');
        }

        window.addEventListener('native.keyboardhide', keyboardHideHandler);

        function keyboardHideHandler(e){
            //alert('Goodnight, sweet prince');
            cordova.plugins.Keyboard.disableScroll(true);
            document.body.classList.remove('keyboard-open');
        }

        $rootScope.isBrowserMode = window.isBrowserMode;

        if (!window.isBrowserMode){
            $ionicModal.fromTemplateUrl('templates/no-connection/no-connection.html', {
                scope: $rootScope
            }).then(function(modal) {
                $rootScope.noConnectionModal = modal;
            });

            $rootScope.showNoConnectionDialog = function() {
                $rootScope.noConnectionModal.show();
            }

            $rootScope.hideNoConnectionDialog = function() {
                $rootScope.noConnectionModal.hide();
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Check internet connection status
        //
        // /////////////////////////////////////////////////////////////////////////////////////////////////////////

        // listen for Online event

        if (!window.isBrowserMode){
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
                console.log('cordovaNetwork:online => ' + networkState);

                $rootScope.hideNoConnectionDialog();
            });

            // listen for Offline event
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                console.log('cordovaNetwork:offline => ' + networkState);

                $rootScope.showNoConnectionDialog();
            });
        }

        $rootScope.hasCheckIn = false;
        $rootScope.checkIn = {};

        $rootScope.modal = null;
        $rootScope.verifyIdentityModal = null;

        $rootScope.loggedIn = false;

        // if (typeof($localStorage['uid']) != 'undefined' && $localStorage['uid'] != ''){
        //   $rootScope.loggedIn = true;
        // }

        if (firebase.auth().currentUser != null){
            if (typeof($localStorage['uid']) == 'undefined' && $localStorage['uid'] == ''){
                $localStorage['uid'] = firebase.auth().currentUser.uid;
            }

            $rootScope.loggedIn = true;
        }

        if (window.isBrowserMode){
            if (
                location.pathname.indexOf('dashboard') > -1 ||
                location.pathname.indexOf('chores') > -1 ||
                location.pathname.indexOf('children') > -1
                ){
                
                if (!$rootScope.loggedIn){
                    location.href = 'http://kidzforce.com/manage-account'; return;
                }

            }

            if (location.pathname.indexOf('manage-account') > -1){
                if ($rootScope.loggedIn){
                    location.href = 'http://kidzforce.com/dashboard'; return;
                }
            }
        }

        $rootScope.showTermsOfServiceModal = function() {
            $ionicModal.fromTemplateUrl('templates/misc/html/tos.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.showAboutModal = function() {
            $ionicModal.fromTemplateUrl('templates/misc/html/about.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.showPrivacyPolicyModal = function() {
            $ionicModal.fromTemplateUrl('templates/misc/html/privacypolicy.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.getAgeFromDob = function(birthday) { // birthday is a date
            var ageDifMs = Date.now() - (new Date(birthday)).getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            var age = Math.abs(ageDate.getUTCFullYear() - 1970);
            //console.log(age);
            return age;
        }

        $rootScope.help = {
            title: '',
            message: ''
        }

        $rootScope.showReportModal = function(title, message) {
            $rootScope.help.title = title;
            $rootScope.help.message = message;
            $ionicModal.fromTemplateUrl('templates/misc/html/report.html', {
            // $ionicModal.fromTemplateUrl('templates/not-available.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.showCheckInModal = function(project) {
            $rootScope.checkIn = project;
            //if ($rootScope.hasCheckIn){
                // $ionicModal.fromTemplateUrl('templates/dashboard/checkin.html', {
                $ionicModal.fromTemplateUrl('templates/dashboard/checkin.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $rootScope.modal = modal;
                    $rootScope.modal.show();
                });
            //}
        };

        $rootScope.showHelpMeModal = function(title, message) {
            // $ionicModal.fromTemplateUrl('templates/dashboard/helpme.html', {
            $ionicModal.fromTemplateUrl('templates/dashboard/helpme.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.showProfileModal = function() {
            $ionicModal.fromTemplateUrl('templates/dashboard/profile.html', {
            //$ionicModal.fromTemplateUrl('templates/not-available.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.showLoginModal = function() {
            $ionicModal.fromTemplateUrl('templates/login/html/login-modal.html', {
            //$ionicModal.fromTemplateUrl('templates/not-available.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.params = {
            email: '',
            password: ''
        };

        $rootScope.showSignupModal = function(email, password) {
            $rootScope.params.email = email;
            $rootScope.params.password = password;

            $ionicModal.fromTemplateUrl('templates/signup/html/signup-modal.html', {
            //$ionicModal.fromTemplateUrl('templates/not-available.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.verifyIdentityToAddProject = false;

        $rootScope.showVerifyIdentityModal = function() {
            $ionicModal.fromTemplateUrl('templates/signup/html/signup-identity-modal.html', {
            //$ionicModal.fromTemplateUrl('templates/not-available.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.verifyIdentityModal = modal;
                $rootScope.verifyIdentityModal.show();
            });
        };

        $rootScope.projectViewModal = null;
        $rootScope.projectViewId = 0;
        $rootScope.showProjectViewModal = function(project_id){
            $rootScope.projectViewId = project_id;
            if (window.isBrowserMode){
                $ionicModal.fromTemplateUrl('http://kidzforce.com/api/public/templates/project/view-project-modal.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function(modal){
                    $rootScope.projectViewModal = modal;
                    $rootScope.projectViewModal.show();
                });
            }else{
                $ionicModal.fromTemplateUrl('templates/project/view-project-modal.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function(modal){
                    $rootScope.projectViewModal = modal;
                    $rootScope.projectViewModal.show();
                });
            }
        };

        $rootScope.getDateFromCalendarModal = function(scope, canBePast, currentDate, startDate, endDate, callback) {
            scope.toReturn = function (date) {
                scope.datePickerModal.hide();
                callback(date);
            };

            scope.onezoneDatepicker = {
                date: currentDate,
                mondayFirst: false,
                //months: ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"],
                //daysOfTheWeek: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sa"],
                startDate: startDate,
                endDate: endDate,
                disablePastDays: !canBePast,
                disableSwipe: false,
                disableWeekend: false,
                showTodayButton: true,
                calendarMode: true,
                hideCancelButton: false,
                hideSetButton: false,
                callback: scope.toReturn,
                showDatepicker: true
            };
            var template = '<ion-modal-view>' +
                            '<ion-header-bar>' +
                            '<h1 class="title">Select Date</h1>' +
                            '</ion-header-bar>' +
                            '<ion-content>' +
                            '<onezone-datepicker datepicker-object="onezoneDatepicker"></onezone-datepicker>' +
                            '</ion-content>' +
                            '</ion-modal-view>';
            scope.datePickerModal = $ionicModal.fromTemplate(template, {
                scope: scope,
                animation: 'slide-in-up'
              });
            scope.datePickerModal.show();
        };

        $rootScope.logout = function(){
          AuthService.reset().then(function(){
            if (!window.isBrowserMode){
                setTimeout(function(){
                    $state.go('login');
                }, 200);
            }else{
                firebase.auth().signOut().then(function(){ 
                    firebase.auth().currentUser = null;
                    $rootScope.loggedIn = false;
                });
            }
          });
        };

        $rootScope.showAddProjectModal = function() {
            $rootScope.verifyIdentityToAddProject = true;
            $rootScope.showLoader();
            ParentService.getIdentityStatus().then(
                function(response){
                    if (response.passed == 'not checked'){
                        $rootScope.showVerifyIdentityModal();
                    }

                    if (response.passed == 'failed'){
                        $rootScope.showPopup('Verification failed', 'Please contact KidzForce we were not able to verify your identity.', 'error');
                    }

                    if (response.passed == 'passed'){
                        // $ionicModal.fromTemplateUrl('http://ec2-107-21-160-8.compute-1.amazonaws.com/app/api/projects/add?api_token='+$localStorage['uid']+'&member-id='+$localStorage['uid']+'&Authorized_Member_ID='+$localStorage['uid'], {
                        $ionicModal.fromTemplateUrl('templates/addproject.html', {
                            scope: $rootScope,
                            animation: 'slide-in-up'
                        }).then(function(modal) {
                            $rootScope.projectId = 0;
                            $rootScope.modal = modal;
                            $rootScope.modal.show();
                        });
                    }


                    $ionicLoading.hide();
                },
                function(error){
                    console.error(error);
                });
        };

        $rootScope.showEditProjectModal = function(projectId){
            $rootScope.projectId = projectId;
            $ionicModal.fromTemplateUrl('templates/addproject.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.showAddChildModal = function() {
            $rootScope.showLoader();

            // $ionicModal.fromTemplateUrl('http://ec2-107-21-160-8.compute-1.amazonaws.com/app/api/children/add?api_token='+$localStorage['uid']+'&member-id='+$localStorage['uid']+'&Authorized_Member_ID='+$localStorage['uid'], {
            $ionicModal.fromTemplateUrl('templates/addchild.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
            $ionicLoading.hide();
        };

        $rootScope.childId = 0;
        $rootScope.viewChildProfile = function(childId){
          $rootScope.childId = childId;
          $ionicModal.fromTemplateUrl('http://ec2-107-21-160-8.compute-1.amazonaws.com/app/api/child/get?api_token='+$localStorage['uid']+'&member-id='+childId+'&Authorized_Member_ID='+$localStorage['uid'],{
            scope: $rootScope,
            animation: 'slide-in-up'
          }).then(function(modal){
            $rootScope.modal = modal;
            $rootScope.modal.show();
          });
        };

        $rootScope.showNotAvailable = function() {
            $ionicModal.fromTemplateUrl('templates/not-available.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        };

        $rootScope.$on('modal.removed', function() {
            // Execute action
            // console.log('modal removed');
        });
        $rootScope.$on('modal.hidden', function() {
            // Execute action
            // console.log('modal hidden');
            if (document.getElementById("checkInMap") != null){
                document.getElementById("checkInMap").remove();
            }
            // if (document.getElementById("map") != null){
            //     document.getElementById("map").remove();
            // }
        });
        $rootScope.$on('$destroy', function() {
            // Execute action
            // console.log('modal destory');
        });

        $ionicPlatform.ready(function() {

            if (window.cordova){
                var SPLASH_SCREEN_DELAY = 3000;
                setTimeout(function() {
                    navigator.splashscreen.hide();
                }, SPLASH_SCREEN_DELAY);
            }

            ionic.Platform.isFullScreen = true;
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                // cordova.plugins.Keyboard.disableScroll(true);
                // cordova.plugins.Keyboard.disableScroll(false);
            }
            if(window.cordova && window.cordova.plugins.Keyboard) {
              // window.cordova.plugins.Keyboard.disableScroll(true);
              // window.cordova.plugins.Keyboard.disableScroll(false);
            }
            if (window.StatusBar) {
                StatusBar.styleLightContent();
                StatusBar.overlaysWebView(false);
            }
        });

        $rootScope.showRatingPrompt = function(){
            if (window.cordova){
                AppRate.preferences.storeAppURL = {
                  ios: '<my_app_id>',
                  android: 'market://details?id=<package_name>'
                };

                AppRate.promptForRating();
            }
        }; 

        $rootScope.showPopup = function(title, content, icon) {
            var defer = $q.defer();

            if (icon == 'error'){
                icon = 'caution-roo-icon.svg';
            }else if (icon == 'success'){
                icon = 'caution-roo-icon.svg';
            }else{
                icon = '';
            }

            if (icon != ''){
                var img = '<img class="roocaution" src="img/icons/' + icon + '"/>';
            }else{
                var img = '';
            }

            $rootScope.alertPopup = $ionicPopup.alert({
                template: img +
                    '<h2>' + title + '</h2>' +
                    '<p>' + content + '</p>',

                cssClass: 'customPopup',
                scope: this

            });

            $rootScope.alertPopup.then(function(res) {
                console.log('alertPopup');
                defer.resolve('success');
            });

            $rootScope.popupOK = function() {
                console.log('ok');
                $rootScope.alertPopup.close();
                defer.resolve('success');
            }

            window.popupOK = $rootScope.popupOK;

            return defer.promise;
        }

        $rootScope.showLoader = function() {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,
                hideOnStateChange: true
            });
        };

        $rootScope.isParent = function(){
          if (window.isBrowserMode){
            return true;
          }

          if (typeof($localStorage['username']) != 'undefined'){
            return false;
          }else{
            if ((typeof($localStorage['uid']) != 'undefined')){
                if ($localStorage['uid'].indexOf('-') == -1){
                    return true;
                }else{
                    return true;
                }
            }
          }

          if (firebase.auth().currentUser == null || typeof($localStorage['child']) != 'undefined'){
            return false;
          }else{
            return true;
          }

          //Deployed more reliable method above.
          // if (typeof($localStorage['child']) == 'undefined'){
          //   return true;
          // }else{
          //   return false;
          // }
        };

        var toUTCDate = function(date){
          var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
          return _utc;
        };

        var millisToUTCDate = function(millis){
          return toUTCDate(new Date(millis));
        };

        var showLocalizedDate = function(millis, timezone){
            // if (millis == null || typeof(millis) == 'undefined'){
            //     return moment().toDate();
            // }

            return moment((millis*1000)).tz(timezone).toDate();
            // return new Date();
        };

        $rootScope.toUTCDate = toUTCDate;
        $rootScope.millisToUTCDate = millisToUTCDate;
        $rootScope.showLocalizedDate = showLocalizedDate;

        $rootScope.build = '1.3.9';
        $rootScope.version = '1.0.0';

        $rootScope.main_color = '#2d313f';
        $rootScope.saturation_value = -20,
        $rootScope.brightness_value = 5;

        //we define here the style of the map
        $rootScope.mapStyle = [{
            //set saturation for the labels on the map
            elementType: "labels",
            stylers: [{
                saturation: $rootScope.saturation_value
            }]
        }, { //poi stands for point of interest - don't show these lables on the map
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }, {
            //don't show highways lables on the map
            featureType: 'road.highway',
            elementType: 'labels',
            stylers: [{
                visibility: "off"
            }]
        }, {
            //don't show local road lables on the map
            featureType: "road.local",
            elementType: "labels.icon",
            stylers: [{
                visibility: "off"
            }]
        }, {
            //don't show arterial road lables on the map
            featureType: "road.arterial",
            elementType: "labels.icon",
            stylers: [{
                visibility: "off"
            }]
        }, {
            //don't show road lables on the map
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{
                visibility: "off"
            }]
        },
            //style different elements on the map
            {
                featureType: "transit",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "poi",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "poi.government",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "poi.sport_complex",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "poi.attraction",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "poi.business",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "transit",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "transit.station",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "landscape",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]

            }, {
                featureType: "road",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "road.highway",
                elementType: "geometry.fill",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }, {
                featureType: "water",
                elementType: "geometry",
                stylers: [{
                    hue: $rootScope.main_color
                }, {
                    visibility: "on"
                }, {
                    lightness: $rootScope.brightness_value
                }, {
                    saturation: $rootScope.saturation_value
                }]
            }
        ];

        $rootScope.horizontalSections = function(){
          var count = 0;
      		try {
      			count = $('.sections-wrapper section').length;
      		}
      		catch (ex) {
      		}
          var vWidth = $(window).width();
          var vheight = $(window).height();
          var activeheight = $('.sections-wrapper.onepage section.active').outerHeight();
          if(activeheight === null) activeheight = $('.sections-wrapper section:first-child').outerHeight();

          $('.sections-wrapper > section').css('width', vWidth);
          $('.sections-wrapper').css('width', vWidth * count);

          $('.sections-wrapper.onepage').css('height', activeheight);
        };

        $rootScope.getCurrentUsername = function(){
          if (typeof($localStorage['parent']) == 'undefined' && typeof($localStorage['child']) == 'undefined'){
            return '';
          }

          if ($rootScope.isParent()){
            return $localStorage['parent']['name'];
          }else{
            return $localStorage['child']['name'];
          }
        };

        $rootScope.purchaseOthers = function(){
            //$rootScope.showLoader();
            //if ($rootScope.isBrowser()){
              //show on website
            //}else{
              $cordovaInAppBrowser.open('http://kidzforce.storenvy.com', '_blank');
            //}
        };

        $rootScope.rooDailyDrops = function(uid){
            ChildService.dailyRooAvailable(uid).then(function(response){
                console.log(response);
                $ionicModal.fromTemplateUrl('rdd/dailydrop.html',{
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function(modal){
                    $rootScope.modal = modal;
                    $rootScope.modal.show();
                });
            },function(response){
                console.log(response);
            });
        };

        // // $rootScope.rooDailyDrops();

        // ionic.keyboard.enable();
        ionic.keyboard.disable();
    })

.config(function($ionicConfigProvider, $stateProvider, $urlRouterProvider, ionicDatePickerProvider, ionicTimePickerProvider, uiGmapGoogleMapApiProvider) {
  var datePickerObj = {
      inputDate: new Date(),
      titleLabel: 'Select a Date',
      setLabel: 'Set',
      todayLabel: 'Today',
      closeLabel: 'Close',
      mondayFirst: false,
      weeksList: ["S", "M", "T", "W", "T", "F", "S"],
      monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      templateType: 'popup',
      from: new Date(2012, 8, 1),
      to: new Date(2018, 8, 1),
      showTodayButton: true,
      dateFormat: 'dd MMMM yyyy',
      closeOnSelect: false,
      disableWeekdays: []
  };
  ionicDatePickerProvider.configDatePicker(datePickerObj);

  var timePickerObj = {
      inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
      format: 12,
      step: 15,
      setLabel: 'Set',
      closeLabel: 'Close'
  };
  ionicTimePickerProvider.configTimePicker(timePickerObj);

  $ionicConfigProvider.tabs.position('bottom');

    // $ionicNativeTransitionsProvider.setDefaultOptions({
    //     duration: 400, // in milliseconds (ms), default 400,
    //     slowdownfactor: 4, // overlap views (higher number is more) or no overlap (1), default 4
    //     iosdelay: -1, // ms to wait for the iOS webview to update before animation kicks in, default -1
    //     androiddelay: -1, // same as above but for Android, default -1
    //     winphonedelay: -1, // same as above but for Windows Phone, default -1,
    //     fixedPixelsTop: 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
    //     fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
    //     triggerTransitionEvent: '$ionicView.beforeEnter', // internal ionic-native-transitions option
    //     backInOppositeDirection: false // Takes over default back transition and state back transition to use the opposite direction transition to go back
    // });
    // Use for change ionic spinner to android pattern.
    $ionicConfigProvider.spinner.icon("android");
    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.scrolling.jsScrolling(false);
    //$ionicConfigProvider.views.maxCache(0);
    $ionicConfigProvider.views.forwardCache(true);

    // uiMaskConfigProvider.maskDefinitions({'A': /[a-z]/, '*': /[a-zA-Z0-9]/});
    // uiMaskConfigProvider.clearOnBlur(false);
    // uiMaskConfigProvider.eventsToHandle(['input', 'keyup', 'click']);


    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBCZvV8YTD4AyESm5IG-S0phuwzAKe0fmA',
        libraries: 'places'
    });


    if (!window.isBrowserMode){
      $stateProvider
          .state('app', {
              url: "/app",
              abstract: true,
              cache: false,
              templateUrl: "templates/menu/html/menu.html",
              controller: 'menuCtrl'
          })
          .state('about', {
              url: "/about",
              params: {
                  isAnimated: false
              },
              templateUrl: "templates/misc/html/about.html"

          })
          .state('tos', {
              url: "/tos",
              params: {
                  isAnimated: false
              },
              templateUrl: "templates/misc/html/tos.html"

          })
          .state('privacypolicy', {
              url: "/privacypolicy",
              params: {
                  isAnimated: false
              },
              templateUrl: "templates/misc/html/privacypolicy.html"

          })
          .state('login', {
              url: "/login",
              params: {
                  isAnimated: false
              },
              templateUrl: "templates/login/html/login.html",
              controller: 'loginCtrl'

          })
          .state('app.child-dashboard', {
              url: "/child/dashboard",
              views: {
                  'tab-child-dashboard': {
                      templateUrl: "templates/dashboard/dashboard-feed.html"
                  }
              },
              nativeTransitions: null,
              params: {
                  isAnimated: true
              },
          })
          .state('app.child-chores', {
              url: "/child/chores",
              views: {
                  'tab-child-chores': {
                      templateUrl: "templates/dashboard/chores.html"
                  }
              },
              nativeTransitions: null,
              params: {
                  isAnimated: true
              },
              cache: true
          })
          .state('app.child-earned', {
              url: "/child/earned",
              views: {
                  'tab-child-earned': {
                      templateUrl: "templates/dashboard/earned.html"
                  }
              },
              nativeTransitions: null,
              params: {
                  isAnimated: true
              },
          })
          .state('app.report', {
              url: "/app/report",
              views: {
                  'menuContent': {
                      templateUrl: "templates/not-available.html"
                  }
              },
              params: {
                  isAnimated: true
              },
          })
          .state('app.parent-dashboard', {
              url: "/parent/dashboard",
              cache: false,
              views: {
                  'tab-parent-dashboard': {
                      templateUrl: "templates/dashboard/dashboard-feed.html"
                  }
              },
              params: {
                  isAnimated: true
              },
          })
          .state('app.parent-chores', {
              url: "/parent/chores",
              cache: false,
              views: {
                  'tab-parent-chores': {
                      templateUrl: "templates/dashboard/chores.html"
                  }
              },
              params: {
                  isAnimated: true
              },
          })
          .state('app.parent-children', {
              url: "/parent/children",
              cache: false,
              views: {
                  'tab-parent-children': {
                      templateUrl: "http://ec2-107-21-160-8.compute-1.amazonaws.com/app/api/children/get?api_token=M82TBrvdHYSVBH6eDnkUmzkHSGx2&member-id=M82TBrvdHYSVBH6eDnkUmzkHSGx2&Authorized_Member_ID=M82TBrvdHYSVBH6eDnkUmzkHSGx2"
                  }
              },
              params: {
                  isAnimated: true
              },
          })
          .state('intro', {
              url: '/intro',
              templateUrl: 'templates/intro/intro.html',
              controller: 'IntroCtrl',
              cache: false
          })
          .state('roo_daily_drop', {
              url: '/rdd',
              templateUrl: 'rdd/dailydrop.html',
              controller: 'rooDailyDropController',
              cache: false
          });
      //Use $urlRouterProvider.otherwise(Url);
      $urlRouterProvider.otherwise('/login');

    }

});

var appControllers = angular.module('kb.controllers', ['ngStorage', 'ionic.ion.headerShrink', 'firebase', 'ngCordovaOauth', 'ion-google-autocomplete']); // Use for all controller of application.
var appServices = angular.module('kb.services', []);// Use for all service of application.
// friends factory
appControllers.factory('WordPress',['$http', function($http) {
	var data = {};
	data.getPosts = function (page) {
		return $http(
			{
				method: 'GET', url:'http://kidzforce.com/api/get_recent_posts/?page='+page
			}
		);
	}
	data.getPostsTaxonamy = function (type, slug, page) {
		if(type == 'tag') {
			return $http(
				{
					method: 'GET', url:'http://kidzforce.com/api/get_tag_posts/?page='+page+'&slug='+slug
				}
			);
		} else if(type == 'category') {
			return $http(
				{
					method: 'GET', url:'http://kidzforce.com/api/get_category_posts/?page='+page+'&slug='+slug
				}
			);
		}
	}
	data.getCategories = function () {
		return $http(
			{
				method: 'GET', url:'http://kidzforce.com/api/get_category_index/'
			}
		);
	}
	data.getTags = function () {
		return $http(
			{
				method: 'GET', url:'http://kidzforce.com/api/get_tag_index/'
			}
		);
	}
  	return data;
}]);
appControllers.factory('globalFactory', function() {
	return {
		// get first image or feed
		getPostImageFeed: function( postContent ) {
			var div = document.createElement('div');
			div.innerHTML = postContent;
			var img = div.getElementsByTagName("img");
			var iframe = div.getElementsByTagName("iframe");
			if (img.length >= 1) {
				imgthumb = img[0].src;
				return imgthumb;
			} else if (iframe.length >= 1){
				iframeVideo = iframe[0].src;
				var re = /(\?v=|\/\d\/|\/embed\/)([a-zA-Z0-9\-\_]+)/;
				videokeynum = iframeVideo.match(re);
				if(videokeynum) {
					videokey = iframeVideo.match(re)[2];
					imageurl = 'http://i2.ytimg.com/vi/'+videokey+'/0.jpg';
					return imageurl;	              
			  }
			}
		}
	};
});
appControllers

    .controller('signupIdentityModalCtrl', ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', '$timeout', '$ionicSlideBoxDelegate', 'ParentService', '$ionicModal', 'WizardHandler',
    function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, $ionicSlideBoxDelegate, $timeout, ParentService, $ionicModal, WizardHandler) {
        $scope.currentIndex = 0;

        $scope.params = {
            addressObject: {
              address: '',
              address_2: '',
              city: '',
              state: '',
              zip: ''
            },
            phone: '',
            ssn: '',
            tos: ''
        };

        $scope._calculateAge = function(birthday) { // birthday is a date
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        $scope.firstStepCompleted = function(){
            if ($scope.params.address != '' && $scope.params.phone != ''){
                return false;
            }else{
                return true;
            }
        };

        $scope.secondStepCompleted = function(){
            if ($scope.params.first_name != '' &&
                $scope.params.last_name != '' &&
                $scope.params.email != '' &&
                $scope.params.password != '' &&
                $scope.params.phone != ''){
                return false;
            }else{
                return true;
            }
        }

        $scope.next = function(index){
          if (window.cordova){
            cordova.plugins.Keyboard.close();
          }
            $rootScope.showLoader();
            var params = [];
            $scope.currentIndex = 1;
            $ionicLoading.hide();
        };

        $scope.prev = function(index){
            $scope.currentIndex = index;
        };

        $scope.submit = function(){
          if (window.cordova){
            cordova.plugins.Keyboard.close();
          }
          $rootScope.showLoader();
            ParentService.verifyIdentity($scope.params.addressObject, $scope.params.phone, $scope.params.ssn).then(
              function(success){
                $ionicLoading.hide();
                $rootScope.verifyIdentityModal.hide();
                // $ionicModal.fromTemplateUrl('http://ec2-107-21-160-8.compute-1.amazonaws.com/app/api/projects/add?api_token='+$localStorage['uid']+'&member-id='+$localStorage['uid']+'&Authorized_Member_ID='+$localStorage['uid'], {
                if ($rootScope.verifyIdentityToAddProject){
                  $ionicModal.fromTemplateUrl('templates/addproject.html', {
                      scope: $rootScope,
                      animation: 'slide-in-up'
                  }).then(function(modal) {
                      $rootScope.projectId = 0;
                      $rootScope.modal = modal;
                      $rootScope.modal.show();
                  });
                }
              },
              function(error){
                $ionicLoading.hide();
                $rootScope.showPopup('Unable to verify', 'Your identity could not be verified. Please contact KidzForce if you believe this is an error.');
              }
            );
        };

        $scope.countryCode = 'US';

        $scope.onAddressSelection = function (location) {
          $scope.params.addressObject.address = location.name;
   
          for (var i = 0; i < location.address_components.length; i++) {
            var component = location.address_components[i];

            if (component.types[0] == 'locality'){
              $scope.params.addressObject.city = component.long_name;
            }

            if (component.types[0] == 'administrative_area_level_1'){
              $scope.params.addressObject.state = component.short_name;
            }

            if (component.types[0] == 'postal_code'){
              $scope.params.addressObject.zip = component.short_name;
            }
          }
            // $scope.params.address = location.formatted_address;
        };

        $scope.formValidSubmit = function(form, index){
          if (form.$valid){
            if (index == 1){
              WizardHandler.wizard().goTo('social');
            }else{
              WizardHandler.wizard().finish();
            }
          }
        };
    }
]);

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
                                if (window.isBrowserMode){
                                  $rootScope.loggedIn = true;
                                  location.href = 'http://kidzforce.com/dashboard/';
                                }else{
                                  $state.go('app.parent-dashboard');
                                }
                            },
                            function(error){
                                console.error(error);
                                $ionicLoading.hide();
                                $scope.num_of_failures += 1;
                                if ($scope.num_of_failures == 3){
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
                    if ($scope.num_of_failures == 3){
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
            $scope.showLoader();
            AuthService.loginWithFacebook().then(
                function(response){
                    $ionicLoading.hide();

                    ParentService.getProfile().then(
                        function(profile){
                            $localStorage['parent'] = profile.data;
                            if (window.isBrowserMode){
                              $rootScope.loggedIn = true;
                              location.href = 'http://kidzforce.com/dashboard/';
                            }else{
                              $state.go('app.parent-dashboard');
                            }
                        },
                        function(error){
                            console.error(error);
                            $ionicLoading.hide();
                            $scope.showPopup('Invalid login', "Your login was not valid. Please check your login information and try again.", 'error');
                        });
                },
                function(error){
                    $ionicLoading.hide();
                    console.error(error);
                    $scope.showPopup('Invalid login', "Your login was not valid. Please check your login information and try again.", 'error');
                    //Attempt firebase login now for parent since authing as a child did not work.
                }
            );
        };

        $scope.attemptGoogleLogin = function(){
            $scope.showLoader();
            AuthService.loginWithGoogle().then(
                function(response){
                    $ionicLoading.hide();

                    ParentService.getProfile().then(
                        function(profile){
                            $localStorage['parent'] = profile.data;
                            if (window.isBrowserMode){
                              $rootScope.loggedIn = true;
                              location.href = 'http://kidzforce.com/dashboard/';
                            }else{
                              $state.go('app.parent-dashboard');
                            }
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
                    $scope.showPopup('Invalid login', "Your login was not valid. Please check your login information and try again.", 'error');
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
                   $rootScope.showPopup('Could not reset password', 'This could be because this user does not exist, or an internal error occurred.');
                 }
               );
             }
           });
        };

        $scope.$on('$ionicParentView.beforeEnter', function(){
          if (!window.isBrowserMode){
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
          }
        });
    }
]);

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
                          if (window.isBrowserMode){
                            deferred.reject(response); //Browser should not allow auth as child.
                          }
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

            service.awardDailyRoo = function(uid, reward){
                var deferred = $q.defer();

                var ref = firebase.database().ref().child('daily_drops').child(uid);
                var obj = $firebaseObject(ref);

                obj.$loaded().then(function(){
                    var date = new Date();
                    var utcDate = service.toUTCDate(date);
                    var dateTime = utcDate.getTime();
                    obj.$value = dateTime;

                    //send reward to server

                    obj.$save().then(function(){
                        deferred.resolve('awarded');
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

            return service;
            } // end of factory function
        ]
    );

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

angular.module('kb')

    .factory('ParentService',
        ['$http', '$q', '$localStorage', 'ENDPOINT_LIST', '$firebaseObject',
            function($http, $q, $localStorage, ENDPOINT_LIST, $firebaseObject) {

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


            return service;
            } // end of factory function
        ]
    );

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

        service.createProject = function(projectParams){
          var defer = $q.defer();

          var config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            }
          };

          var params = 'projectId='+encodeURIComponent(projectParams.id)+'&title='+encodeURIComponent(projectParams.title)+'&date='+encodeURIComponent(projectParams.date)+'&projectType='+encodeURIComponent(projectParams.type)+'&price='+encodeURIComponent(projectParams.price)+'&description='+encodeURIComponent(projectParams.description)+'&member-id='+encodeURIComponent(projectParams.member_id)+'&photos_base64='+encodeURIComponent(projectParams.photo)+'&timezone_offset='+encodeURIComponent(projectParams.timezone_offset)+'&minimum_age='+encodeURIComponent(projectParams.age_range)+'&api_token=' +encodeURIComponent($localStorage['uid']);

          $http.post(ENDPOINT_LIST.DOMAIN + 'projects/add', params, config)
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

window.isBrowserMode = false;

angular.module('kb.constant', [])

    .constant('ENDPOINT_LIST', (function () {         
    // var web_server = 'http://api.kidzforce.com/v1/';        
    // var api_root = '';
    var web_server = 'http://ec2-107-21-160-8.compute-1.amazonaws.com/app/api/';        
    var api_root = '';

            
    return {            
                    DOMAIN: web_server + api_root,
                    VERSION: '1.0.0',
                    BUILD: '1.3.0',
                    FBAPPID: '1159778540770974',
                    DOMAIN: web_server,
                    CHILD_CHECK_API: web_server + api_root + 'children/authas',
                    CHILD_NOTIFICATION_RESPOND_API: web_server + api_root + 'children/notification/respond',
                    CHILD_PROFILE_API: web_server + api_root + 'children/profile',
                    PARENT_PROFILE_API: web_server + api_root + 'parent/profile',
                    CHILD_RESUME_UPDATE_API: web_server + api_root + 'children/profile/resume',
                    CHILD_PASSWORD_UPDATE_API: web_server + api_root + 'children/profile/password',
                    CHILD_DELETE_API: web_server + api_root + 'children/profile/delete',
                    CHILD_LOCAL_RESULTS_API: web_server + api_root + 'children/projects/nearme',
                    CHILD_RELOAD_NOTIFICATIONS_API: web_server + api_root + 'children/notifications',
                    PARENT_RELOAD_NOTIFICATIONS_API: web_server + api_root + 'parent/notifications',
                    PROJECT_VIEW_API: web_server + api_root + 'projects/view',
                    PROJECT_APPLY_API: web_server + api_root + 'projects/apply',
                    PROJECT_DELETE_API: web_server + api_root + 'projects/delete',
                    CHILD_REQUEST_DEPOSIT_API: web_server + api_root + 'children/profile/deposit',
                    SIGNUP_VALIDATION_API: web_server + api_root + 'register/validate',
                    REGISTER_SUBMIT_API: web_server + api_root + 'register/add/submit',
                    CHORE_PRESET_API: web_server + api_root + 'projects/popularItems',
                    PROJECT_ADD_VALIDATION_API: web_server + api_root + 'projects/add/validate',
                    PARENT_IDENTITY_STATUS_API: web_server + api_root + 'parent/verified',
                    CHILD_PROJECT_CHECKIN_API: web_server + api_root + 'projects/checkin',
                    PARENT_PROJECTS_API: web_server + api_root + 'projects/list',
                    PARENT_CHILDREN_API: web_server + api_root + 'parent/children',
                    PARENT_PROFILE_UPDATE_API: web_server + api_root + 'profile/update',
                    PARENT_IDENTITY_VERIFY_API: web_server + api_root + 'parent/verify',
                    REGISTER_EMAIL_VALIDATION_API: web_server + api_root + 'register/userexists',
                    REQUEST_HELP_API: web_server + api_root + 'child/request_help',
                    REDEEM_POINTS_API: web_server + api_root + 'child/redeem_points'

                
    }    
})());

//Directive numbersOnly :
//Use for change input to have ability accept only number.
//Example : <input ng-model="contract.age" numbers-only type="tel">
//
appControllers.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }

            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});// End Directive numbersOnly.

//Filter epochToDate :
//Use for convert epoch date format to default date format.
//Example :
//<p>{{item.createdAt |epochToDate | date:"short"}}</p>
appControllers.filter('epochToDate', function ($filter) {
    return function (input) {
        return new Date(Date(input));
    };
});// End Filter epochToDate.

//Filter numberSuffix :
//Use for convert number to have suffix 1,000 to 1K.
//Example :
//{{item.likes.summary.total_count | numberSuffix}}
//
appControllers.filter('numberSuffix', function () {
    return function (input) {
        var exp;
        var suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

        if (window.isNaN(input)) {
            return 0;
        }

        if (input < 1000) {
            return input;
        }

        exp = Math.floor(Math.log(input) / Math.log(1000));

        return (input / Math.pow(1000, exp)).toFixed(1) + suffixes[exp - 1];
    }
});// End Filter numberSuffix.

appControllers.filter('validMonths', function () {
    return function (months, year) {
        var filtered = [];
        var now = new Date();
        var over18Month = now.getUTCMonth() + 1;
        var over18Year = now.getUTCFullYear() - 18;
        if(year != ""){
            if(year == over18Year){
                angular.forEach(months, function (month) {
                    if (month.id <= over18Month) {
                        filtered.push(month);
                    }
                });
            }
            else{
                angular.forEach(months, function (month) {
                        filtered.push(month);
                });
            }
        }
        return filtered;
    };
});

appControllers.filter('daysInMonth', function () {
    return function (days, year, month) {
        var filtered = [];
                angular.forEach(days, function (day) {
                    // console.log(month);
                    if (month != "" && typeof(month) != 'undefined'){
                        if (month.id == 1 || month.id == 3 || month.id == 5 || month.id == 7 || month.id == 8 || month.id == 10 || month.id == 12) {
                            filtered.push(day);
                        }
                        else if ((month.id == 4 || month.id == 6 || month.id == 9 || month.id == 11) && day <= 30){
                            filtered.push(day);
                        }
                        else if (month.id == 2){
                            if (year % 4 == 0 && day <= 29){
                                filtered.push(day);
                            }
                            else if (day <= 28){
                                filtered.push(day);
                            }
                        }
                    }
                });
        return filtered;
    };
});

appControllers.filter('validDays', function () {
    return function (days, year, month) {
        var filtered = [];
        var now = new Date();
        var over18Day = now.getUTCDate();
        var over18Month = now.getUTCMonth() + 1;
        var over18Year = now.getUTCFullYear() - 18;
        if(year == over18Year && month.id == over18Month){
            angular.forEach(days, function (day) {
                if (day <= over18Day) {
                    filtered.push(day);
                }
            });
        }
        else{
            angular.forEach(days, function (day) {
                    filtered.push(day);
            });
        }
        return filtered;
    };
});
// appControllers

//     .controller('addChildCtrl', ['$scope', '$state', '$rootScope', 'ChildService', 'ChildrenService', 'ionicDatePicker', '$ionicLoading', 'WizardHandler',
//     function($scope, $state, $rootScope, ChildService, ChildrenService, ionicDatePicker, $ionicLoading, WizardHandler) {
//         $scope.child = {
//             id: 0,
//             gender: 0,
//             name: '',
//             email: '',
//             username: '',
//             phone: '',
//             pin: '',
//             birthdate: ''
//         };

//         $scope.validate = function(stepNumber){
//           if (stepNumber == 1){
//             if ($scope.child.name == ''){
//               return false;
//             }

//             if ($scope.child.birthdate == ''){
//               return false;
//             }

//             return true;
//           }else if (stepNumber == 2){
//             if ($scope.child.email == '' || $scope.child.username == '' || $scope.child.phone == '' || $scope.child.pin == ''){
//               return false;
//             }

//             return true;
//           }
//         };

//         $scope.isBrowser = function(){

//             return false;

//             if (window.cordova == undefined || typeof(window.cordova) == 'undefined' || window.cordova == null){
//                 return true;
//             }else{
//                 return false;
//             }
//         };

//         $scope.isActive = function(name){
//             if (name == 'boy' && $scope.child.gender == 0){
//                 return true;
//             }else if (name == 'girl' && $scope.child.gender == 1){
//                 return true;
//             }else{
//                 return false;
//             }
//         };

//         $scope.isActiveClass = function(name){
//             if (name == 'boy' && $scope.child.gender == 0){
//                 return 'button-assertive';
//             }else if (name == 'girl' && $scope.child.gender == 1){
//                 return 'button-assertive';
//             }else{
//                 return 'button-positive';
//             }
//         };

//         $scope.setActive = function(name){
//             if (name == 'boy'){
//                 $scope.child.gender = 0;
//             }else{
//                 $scope.child.gender = 1;
//             }
//         };

//         $scope.pickDate = function(){
//           var ipObj1 = {
//             callback: function (val) {  //Mandatory
//               $scope.child.birthdate = new Date(val);
//             },
//             from: new Date(1999, 1, 1),
//             to: new Date(),
//             mondayFirst: true,          //Optional
//             showTodayButton: false,
//             closeOnSelect: true       //Optional
//           };
//           ionicDatePicker.openDatePicker(ipObj1);
//         };

//         $scope.addChild = function(){
//           if (window.cordova){
//             cordova.plugins.Keyboard.close();
//           }
//           $rootScope.showLoader();

//           $scope.child.username = $scope.child.username.toLowerCase();

//           // ChildrenService.childExistsByName($scope.child.username).then(
//           //   function(){
//               ChildService.createChild($scope.child).then(
//                 function(projectObject){
//                   $ionicLoading.hide();
//                   $rootScope.showPopup('Child Created', 'Your child has been created.', '').then(
//                     function(){
//                       $rootScope.modal.hide();
//                     });
//                 },
//                 function(error){
//                   $ionicLoading.hide();
//                   $rootScope.showPopup('Unable to create child', 'This could be related to a system error, please try again later.', 'error').then(
//                     function(){

//                     });
//                 }
//               );
//             // },
//             // function(){
//             //   $rootScope.showPopup('Username taken', 'This username is already inuse, please pick another one and try again.', 'error');
//             // });
//         };

//         $scope.getDateTest = function(){
//           $rootScope.getDateFromCalendarModal($scope, true, new Date(2009, 1, 1), new Date(1999, 1, 1), new Date(2010, 1, 1), function(date){
//             $scope.child.birthdate = date;
//             window.d = date;
//           });
//         };

//         $scope.formValidSubmit = function(form, index){
//           if (form.$valid){
//             if (index == 1){
//               WizardHandler.wizard().goTo('login');
//             }else{
//               $scope.addChild();
//             }
//           }
//         };
//     }
// ]);

appControllers.controller('addChildCtrl', function($scope, $state, $rootScope, ChildService, ChildrenService, ionicDatePicker, $ionicLoading){
  $scope.child = {
    id: 0,
    gender: 0,
    name: '',
    email: '',
    username: '',
    phone: '',
    pin: '',
    birthdate: ''
  };

  $scope.isActive = function(name){
    if (name == 'boy' && $scope.child.gender == 0){
        return true;
    }else if (name == 'girl' && $scope.child.gender == 1){
        return true;
    }else{
        return false;
    }
  };

  $scope.isActiveClass = function(name){
    if (name == 'boy' && $scope.child.gender == 0){
        return 'button-assertive';
    }else if (name == 'girl' && $scope.child.gender == 1){
        return 'button-assertive';
    }else{
        return 'button-positive';
    }
  };

  $scope.setActive = function(name){
    if (name == 'boy'){
        $scope.child.gender = 0;
    }else{
        $scope.child.gender = 1;
    }
  };

  $scope.pickDate = function(){
    var ipObj1 = {
      callback: function (val) {  //Mandatory
        $scope.child.birthdate = new Date(val);
      },
      from: new Date(1999, 1, 1),
      to: new Date(),
      mondayFirst: true,          //Optional
      showTodayButton: false,
      closeOnSelect: true       //Optional
    };
    ionicDatePicker.openDatePicker(ipObj1);
  };

  $scope.getDateTest = function(){
    $rootScope.getDateFromCalendarModal($scope, true, new Date(2009, 1, 1), new Date(1999, 1, 1), new Date(2010, 1, 1), function(date){
      $scope.child.birthdate = date;
      window.d = date;
    });
  };

  $scope.addChild = function() {
      if (window.cordova) {
          cordova.plugins.Keyboard.close();
      }
      $rootScope.showLoader();

      $scope.child.username = $scope.child.username.toLowerCase();

      // ChildrenService.childExistsByName($scope.child.username).then(
      //   function(){
      ChildService.createChild($scope.child).then(
          function(projectObject) {
              $ionicLoading.hide();
              $rootScope.showPopup('Child Created', 'Your child has been created.', '').then(
                  function() {
                      $rootScope.modal.hide();
                  });
          },
          function(error) {
              $ionicLoading.hide();
              $rootScope.showPopup('Username taken', 'That username appears to be taken, please enter another and try again.', 'error').then(
                  function() {

                  });
          }
      );
      // },
      // function(){
      //   $rootScope.showPopup('Username taken', 'This username is already inuse, please pick another one and try again.', 'error');
      // });
  };

  setTimeout(function(){
      var formWrap = document.getElementById( 'fs-form-wrap' );

      [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {  
        new SelectFx( el, {
          stickyPlaceholder: false,
          onChange: function(val){
            document.querySelector('span.cs-placeholder').style.backgroundColor = val;
          }
        });
      } );

      new FForm( formWrap, {
        onReview : function() {
          classie.add( document.body, 'overview' ); // for demo purposes only
        }
      } );
  }, 500);
});

appControllers

    .controller('addProjectCtrl', ['$scope', '$state', '$rootScope', 'ProjectService', 'ChildrenService', 'ionicDatePicker', 'ionicTimePicker', '$ionicLoading', 'WizardHandler',
    function($scope, $state, $rootScope, ProjectService, ChildrenService, ionicDatePicker, ionicTimePicker, $ionicLoading, WizardHandler) {
        $scope.project = {
            id: 0,
            type: 0,
            member_id: '',
            title: '',
            photo: '',
            date: '',
            time: '',
            timezone_offset: (new Date()).getTimezoneOffset() / 60,
            price: 10,
            description: '',
            age_min: 10,
            age_max: 13,
            age_range: 9
        };



        // $scope.$watch('project.age_range', function(new_val, old_val){
        //   if (new_val !== old_val){
        //     if ($scope.project.age_range == 1){
        //       $scope.project.age_min = 7;
        //       $scope.project.age_max = 9;
        //     }

        //     if ($scope.project.age_range == 2){
        //       $scope.project.age_min = 10;
        //       $scope.project.age_max = 13;
        //     }

        //     if ($scope.project.age_range == 3){
        //       $scope.project.age_min = 14;
        //       $scope.project.age_max = 17;
        //     }
        //   }
        // });


        $scope.validate = function(stepNumber){
          if (stepNumber == 1){
            if ($scope.project.title == ''){
              return false;
            }

            if ($scope.project.type == 1 && $scope.project.member_id == ''){
              return false;
            }

            return true;
          }else if (stepNumber == 2){
            //No validation
            return true;
          }else if (stepNumber == 3){
            if ($scope.project.date == '' || $scope.project.time == ''){
              return false;
            }

            return true;
          }else if (stepNumber == 4){
            return true;
          }
        };

        $scope.hasPhoto = function(){
            if ($scope.project.photo != ''){
                return true;
            }else{
                return false;
            }
        };

        $scope.isActive = function(name){
            if (name == 'public' && $scope.project.type == 0){
                return true;
            }else if (name == 'invite' && $scope.project.type == 1){
                return true;
            }else{
                return false;
            }
        };

        $scope.isActiveClass = function(name){
            if (name == 'public' && $scope.project.type == 0){
                return 'button-assertive';
            }else if (name == 'invite' && $scope.project.type == 1){
                return 'button-assertive';
            }else{
                return 'button-positive';
            }
        };

        $scope.setActive = function(name){
            if (name == 'public'){
                $scope.project.type = 0;
            }else{
                $scope.project.type = 1;
            }
        };

        $scope.popularItems = [];

        $scope.getPopularItems = function(){
            ProjectService.popularItems().then(function(items){
                $scope.popularItems = items;
            },
            function(error){
                console.error(error);
            });
        };

        $scope.getPopularItems();

        $scope.relatedItems = [];

        $scope.getRelatedItems = function(){
            ProjectService.relatedItems($scope.project.title).then(
                function(items){
                    $scope.relatedItems = items;
                },
                function(error){
                  alert(error);
                    console.error(error);
                });
        };

        $scope.photoChanged = function(files){
          var reader  = new FileReader();

          reader.addEventListener("load", function () {
            var base64Result = reader.result;
            // console.log(base64Result);
            $scope.$apply(function(){
              $scope.pickPhoto(base64Result);
            });
          }, false);

          if (files[0]) {
            reader.readAsDataURL(files[0]);
          }
        }

        $scope.pickPhoto = function(url){
          if (typeof(url) != 'undefined'){
            $scope.project.photo = url;
          }else{
            if (window.isBrowserMode || !window.cordova){
                //pick photo
                $("#project_photo").click();
            }else{
                //cordova photo picker
                window.imagePicker.getPictures(
                    function(results) {
                        for (var i = 0; i < results.length; i++) {
                          $scope.$apply(function(){
                            $scope.project.photo = results[i];
                          });
                        }
                    }, function (error) {
                        //console.log('Error: ' + error);
                    }, {
                        maximumImagesCount: 1,
                        width: 800
                    }
                );
            }
          }
        };

        $scope.selectPhoto = function(photoUrl){
            $scope.project.photo = photoUrl;
        };

        $scope.clearPhoto = function(){
            $scope.project.photo = '';
        };

        $scope.tmp = {
            file: ''
        };

        $scope.fileUploaded = function(files){
            //console.log(files);
        };

        $scope.pickTime = function(){
          var ipObj1 = {
            callback: function (val) {      //Mandatory
              if (typeof (val) === 'undefined') {
                //console.log('Time not selected');
              } else {
                var selectedTime = new Date(val*1000);
                $scope.project.time = $rootScope.millisToUTCDate(selectedTime.getTime());
                //console.log($scope.project.time);
              }
            },
            format: 12,         //Optional
            step: 1,           //Optional
            setLabel: 'Set'    //Optional
          };

          ionicTimePicker.openTimePicker(ipObj1);
        };

        $scope.addProject = function(){
          if (window.cordova){
            cordova.plugins.Keyboard.close();
          }
          
          $scope.project.date = new Date($scope.project.date.getFullYear(), $scope.project.date.getMonth(), $scope.project.date.getDate(), $scope.project.time.getHours(), $scope.project.time.getMinutes(), $scope.project.time.getSeconds(), $scope.project.time.getMilliseconds()).getTime() / 1000;
          
          $rootScope.showLoader();
          ProjectService.createProject($scope.project).then(
            function(projectObject){
              $ionicLoading.hide();
              if ($scope.project.id == 0){
                var tag = 'created';
              }else{
                var tag = 'updated';
              }
              $rootScope.showPopup('Project ' + tag, 'Your project has been ' + tag + '.', '').then(
                function(){
                  $rootScope.modal.hide();
                });
            },
            function(error){
              console.error(error);
              $ionicLoading.hide();
              if ($scope.project.id == 0){
                var tag = 'create';
              }else{
                var tag = 'update';
              }
              $rootScope.showPopup('Unable to ' + tag + ' project', 'This could be related to a system error, please try again later.', 'error').then(
                function(){

                });
            }
          );
        };

        $scope.getDateTest = function(){
          $rootScope.getDateFromCalendarModal($scope, true, new Date(), new Date(), new Date((new Date()).getFullYear(), ((new Date()).getMonth()+1), (new Date()).getDay()), function(date){
            $scope.project.date = date;
            $scope.date = date;
          });
        };

        $scope.formValidSubmit = function(form, index){

          if (form.$valid){
            if (index == 1){
              if ($scope.project.type == 1 && $scope.project.member_id != ''){
                ChildrenService.childExists($scope.project.member_id).then(
                  function(){
                    //exists 
                    $scope.getRelatedItems();
                    WizardHandler.wizard().goTo('photo');
                  },
                  function(){
                    //doesnt exist
                    $rootScope.showPopup('Invalid child', 'Enter a valid child id and try again.', 'error').then(
                      function(){
                        $scope.project.member_id = '';
                      });
                  });
              }else{
                $scope.getRelatedItems();
                WizardHandler.wizard().goTo('photo');
              }
            }else if (index == 2){
              WizardHandler.wizard().goTo('schedule');
            }else if (index == 3){
              WizardHandler.wizard().goTo('payment');
            }else{
              WizardHandler.wizard().finish();
            }
          }
        };

        $scope.scanCard = function(){
          if (typeof(window.cordova) != 'undefined' && !window.isBrowserMode){
            cordova.plugins.barcodeScanner.scan(
              function (result) {
                  console.log('result: ' + JSON.stringify(result));
                  $scope.$apply(function(){
                    $scope.project.member_id = result.text;
                  });
              },
              function (error) {
                  alert("Scanning failed: " + error);
              },
              {
                  preferFrontCamera : false, // iOS and Android
                  showFlipCameraButton : false, // iOS and Android
                  showTorchButton : true, // iOS and Android
                  torchOn: true, // Android, launch with the torch switched on (if available)
                  prompt : "Place a barcode inside the scan area", // Android
                  resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                  formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
                  orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                  disableAnimations : false, // iOS
                  disableSuccessBeep: false // iOS
              }
           );
          }
        };

        $scope.loadExistingProject = function(){
          if (typeof($rootScope.projectId) != 'undefined' && $rootScope.projectId != 0){
            $scope.project.id = $rootScope.projectId;
            ProjectService.getChoreById($scope.project.id).then(
              function(choreObject){
                if (choreObject.child_uid != 0 && choreObject.projectType == 1){
                  $scope.project.member_id = choreObject.child_uid;
                }

                $scope.project.type = choreObject.projectType;
                $scope.project.title = choreObject.name;
                $scope.project.description = choreObject.description;
                $scope.project.photo = choreObject.photos;
                $scope.project.price = choreObject.pointValuation;
                $scope.project.age_range = choreObject.age_range;
                $scope.project.date = new Date(choreObject.start_date*1000);
                $scope.project.time = new Date(choreObject.start_date*1000);

              });
          }else{
            $scope.project = {
                id: 0,
                type: 0,
                member_id: '',
                title: '',
                photo: '',
                date: '',
                time: '',
                timezone_offset: (new Date()).getTimezoneOffset() / 60,
                price: 10,
                description: '',
                age_min: 10,
                age_max: 13,
                age_range: 9
            };
          }
        };

        $scope.selectPreset = function(object){
          $scope.project.title = object.title;
          $scope.project.photo = object.image;
          $scope.project.price = object.price;
          $scope.project.age_range = object.minimum_age;
          WizardHandler.wizard().goTo('schedule');
        };

        $scope.skipPhoto = function(){
          $scope.project.photo = '';
        };
    }
]);


// appControllers.controller('addProjectCtrl', function($scope, $rootScope, $localStorage, ProjectService){
//   setTimeout(function(){
//     (function() {
//       var formWrap = document.getElementById( 'fs-form-wrap' );

//       [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {  
//         new SelectFx( el, {
//           stickyPlaceholder: false,
//           onChange: function(val){
//             document.querySelector('span.cs-placeholder').style.backgroundColor = val;
//           }
//         });
//       } );

//       new FForm( formWrap, {
//         onReview : function() {
//           classie.add( document.body, 'overview' ); // for demo purposes only
//         }
//       } );
//     })();
//   }, 500);
// });
appControllers

    .controller('checkInCtrl',
        ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', 'ChildService', '$ionicLoading',
            function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, ChildService, $ionicLoading) {


                $scope.profile = $localStorage['child'];

                $scope.mapMaximized = false;


                ChildService.viewChore($rootScope.checkIn.data.project_id).then(
                    function(data){
                        console.log(data);
                        $scope.chore = data;
                        var defaultPos = new google.maps.LatLng(data.home.lat, data.home.lng);

                        var mapOptions = {
                            center: defaultPos,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            zoom: 16,
                            scrollwheel: false,
                            panControl: false,
                            zoomControl: false,
                            scaleControl: false,
                            mapTypeControl: false,
                            streetViewControl: false,
                            styles: $rootScope.mapStyle
                        };

                        setTimeout(function(){
                            var map = new google.maps.Map(document.getElementById("checkInMap"), mapOptions);
                            $scope.map = map;

                            setTimeout(function(){
                                // if (window.cordova){
                                //     navigator.geolocation.getCurrentPosition(function(pos) {
                                //         map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                                //         var GeoMarker = new GeolocationMarker(map);
                                //     });
                                // }else{
                                //     var pos = {
                                //         coords: {
                                //             latitude: 37.3000,
                                //             longitude: -120.4833
                                //         }
                                //     }
                                //     map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                                //     //var GeoMarker = new GeolocationMarker(map);
                                // }

                                var chorePos = new google.maps.LatLng(data.home.lat, data.home.lng);
                                var choreMarker = new google.maps.Marker({
                                    position: chorePos,
                                    icon: 'img/icons/marker.svg',
                                    map: $scope.map,
                                    animation: google.maps.Animation.DROP
                                  });
                            }, 200);
                        }, 200);
                    },
                    function (error){
                        console.error(error);
                    });

                $scope.checkIn = function(chore_id){
                  $rootScope.showLoader();
                    ChildService.checkIn(chore_id).then(
                        function(success){
                            $ionicLoading.hide();
                            $rootScope.hasCheckIn = false;
                            $rootScope.checkIn = null;
                            
                            $rootScope.showPopup('Project started', 'When finished, press complete on the project card.', '').then(
                                function(){
                                    $rootScope.modal.hide();
                                });
                            
                        },
                        function(error){
                            $ionicLoading.hide();
                            $rootScope.showPopup('Unable to check-in', 'This could be related to a system error, please try again later.', 'error');
                        });
                };
            }
        ]
    );

appControllers

    .controller('childrenCtrl', ['$scope', '$state', '$rootScope', 'ParentService', 'ionicDatePicker', '$ionicLoading', 'ChildrenService', '$localStorage',
    function($scope, $state, $rootScope, ParentService, ionicDatePicker, $ionicLoading, ChildrenService, $localStorage) {
      $scope.isEmpty = false;
      $scope.dataLoaded = false;
      $scope.children = [];

      $scope.hasChildren = function(){
        if ($scope.children.length > 0){
          return true;
        }else{
          return false;
        }
      };

      ChildrenService.getChildrenForParent($localStorage['uid']).then(
        function(childrenObjects){
          $scope.children = childrenObjects;
          if ($scope.children.length == 0){
            $scope.isEmpty = true;
          }
          $scope.dataLoaded = true;
        });

      setInterval(function(){
          // console.log('checking');
          // console.log(new_val);
          if ($scope.children.length == 0){
              $scope.isEmpty = true;
          }else{
              $scope.isEmpty = false;
          }
      }, 500);
    }
]);

// appControllers

//     .controller('choresCtrl', ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', 'ChildService', 'ParentService', 'ProjectService', '$ionicScrollDelegate',
//     function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, ChildService, ParentService, ProjectService, $ionicScrollDelegate) {

//         if (window.isBrowserMode) {
//           //$scope.home = undefined;//[$localStorage['parent']['home']['lat'], $localStorage['parent']['home']['lng']];
//           $scope.home = [38.922525, -77.180702];
//         } else if (!$rootScope.isParent()){
//             if (typeof($localStorage['child']) == 'undefined'){
//                 $scope.home = undefined;
//             }else{
//                 if (typeof($localStorage['child']['home']) == 'undefined' || $localStorage['child']['home'] == null){
//                     $scope.home = undefined;
//                 }else{
//                     $scope.home = [$localStorage['child']['home']['lat'], $localStorage['child']['home']['lng']];
//                 }
//             }
//         }

//         $rootScope.showLoader();

//         // $rootScope.showLoader();
//         $scope.uid = $localStorage['uid'];

//         $scope.expandedChore = -1;
//         $scope.expanded = false;

//         // $scope.noChores = true;
//         $scope.isEmpty = false;
//         $scope.dataLoaded = false;

//         $scope.home = [38.922525, -77.180702];

//         $scope.currentLocation = {
//                 lat: parseFloat($scope.home[0]),
//                 lng: parseFloat($scope.home[1]),
//                 // radius: 1
//                 radius: 322 //200 mile radius
//             };

//         $scope.projects = [];
//         $scope.applications = [];
//         $scope.$watch('projects', function(new_val, old_val){
//             //if (new_val != old_val){
//                 if ($scope.projects.length == 0){
//                     $scope.isEmpty = true;
//                 }else{
//                     $scope.isEmpty = false;
//                 }
//             //}
//         });

//         setInterval(function(){
//             // console.log('checking');
//             // console.log(new_val);
//             //console.log($scope.project);
//             if ($scope.projects.length == 0){
//                 $scope.isEmpty = true;
//             }else{
//                 $scope.isEmpty = false;
//             }
//         }, 500);





//         $scope.centerChanged = function() {
//             //var center = $scope.map.getCenter().toJSON();

//             $scope.currentLocation.lat = $scope.home[0];//center.lat;
//             $scope.currentLocation.lng = $scope.home[1];//center.lng;

//             geoQuery.updateCriteria({
//                 center: [$scope.currentLocation.lat, $scope.currentLocation.lng],
//                 radius: $scope.currentLocation.radius
//             });
//         };



//         if (typeof($scope.home) != 'undefined'){
//             var defaultPos = new google.maps.LatLng($scope.home[0], $scope.home[1]);
//             console.log(defaultPos);
//             $scope.centerChanged();
//         }

//         var mapOptions = {
//             center: defaultPos,
//             mapTypeId: google.maps.MapTypeId.ROADMAP,
//             zoom: 16,
//             scrollwheel: false,
//             panControl: false,
//             zoomControl: false,
//             scaleControl: false,
//             mapTypeControl: false,
//             streetViewControl: false,
//             styles: $rootScope.mapStyle
//         };

//         $scope.$on("$ionicParentView.enter", function(event, data){
//             // handle event
//            // var map = document.getElementById("map");
//            // console.log(map);
//             // if (map) {
//                 // var map = new google.maps.Map(map, mapOptions);
//                 // window.mapObject = map;
//                 // $scope.map = map;
//                 // $scope.map.addListener('center_changed', $scope.centerChanged);
//                 // // $scope.map.setCenter(new google.maps.LatLng($scope.home[0], $scope.home[1]));

//                 // if (typeof($scope.home) != 'undefined'){
//                 //     var homeMarker = new google.maps.Marker({
//                 //         position: defaultPos,
//                 //         map: map,
//                 //         icon: 'img/icons/home-marker.png',
//                 //         animation: google.maps.Animation.DROP
//                 //     });
//                 // }



//                 // var GeoMarker = new GeolocationMarker($scope.map);
//                 // setTimeout(function(){
//                 //     $scope.centerChanged();
//                 // }, 100);
//                 // $scope.centerChanged();
//                 navigator.geolocation.getCurrentPosition(function(pos) {
//                     // setTimeout(function(){
//                         // $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
//                         // $scope.map.setCenter(new google.maps.LatLng(0,0));
//                         // var GeoMarker = new GeolocationMarker($scope.map);
//                     // }, 200);
//                     $scope.home = [pos.coords.latitude, pos.coords.longitude];
//                     $scope.centerChanged();
//                 });
//             // }


//         });

//         $scope.expandChore = function(index) {
//             if ($scope.expanded) {
//                 $scope.closeChore();
//                 $scope.expanded = false;
//             } else {
//                 $scope.closeChore();
//                 $scope.expandedChore = index;
//                 $scope.expanded = true;
//             }
//         };

//         $scope.choreIsExpanded = function(index) {
//             if ($scope.expandedChore == -1) {
//                 //return false;
//                 return 'choreclose';
//             } else {
//                 if ($scope.expandedChore == index) {
//                     //return false;
//                     return 'choreclose';
//                 } else {
//                     //return true;
//                     return 'choreopen';
//                 }
//             }
//         };

//         $scope.closeChore = function() {
//             $scope.expanded = false;
//             $scope.expandedChore = -1;
//         }

//         $scope.isExpanded = function(index) {
//             if ($scope.expandedChore == index) {
//                 setTimeout(function() {
//                     $ionicScrollDelegate.resize();
//                 }, 200);
//                 return 'choreopen';
//             } else {
//                 setTimeout(function() {
//                     $ionicScrollDelegate.resize();
//                 }, 200);
//                 return 'choreclose';
//             }
//         };



//         if (!$rootScope.isParent()) {
//             $scope.expandedChoreClass = function(index) {
//                 if ($scope.expandedChore == index) {
//                     if ($scope.expanded) {
//                         $scope.expanded = false;
//                         return 'ion-chevron-up';
//                     } else {
//                         $scope.expanded = true;
//                         return 'ion-chevron-down';
//                     }
//                 } else {
//                     return 'ion-chevron-down';
//                 }
//             };

//             $scope.profile = $localStorage['child'];

//             $scope.mapMaximized = false;

//             $scope.mapClass = function() {
//                 if ($scope.mapMaximized) {
//                     return 'mapExpanded';
//                 } else {
//                     return 'mapCollapsed';
//                 }
//             };

//             $scope.mapIconClass = function() {
//                 if ($scope.mapMaximized) {
//                     return 'ion-chevron-up';
//                 } else {
//                     return 'ion-chevron-down';
//                 }
//             };

//             $scope.expandMap = function() {
//                 if (!$rootScope.isParent() && !window.isBrowserMode) {
//                     setTimeout(function() {
//                         google.maps.event.trigger($scope.map, 'resize');
//                     }, 200);
//                     $scope.mapMaximized = !$scope.mapMaximized;
//                 }
//             };


//         }




//         $scope.reportChore = function(chore_id) {
//             $rootScope.showPopup('Reported', 'This chore has been flagged and is awaiting review by an Administrator.', 'error');
//         };

//         $scope.apply = function(chore_id) {
//             $scope.showLoader();
//             $scope.applying = true;
//             ChildService.applyForChore(chore_id).then(
//                 function(success) {

//                     //console.log(success);
//                     // for (var i = 0; i < $scope.chores.length; i++) {
//                     //     if ($scope.chores[i].project.id == chore_id) {
//                     //         $scope.chores[i].project.applied = true;
//                     //     }
//                     // }
//                     $ionicLoading.hide();
//                     $scope.applying = false;
//                     $scope.showPopup('Awaiting Approval', 'We have sent your request to the poster. We will notify you when they respond. ');
//                     //$state.go('app.child-dashboard');
//                 },
//                 function(error) {
//                     $ionicLoading.hide();
//                     console.log(error);
//                     $scope.applying = false;
//                     $rootScope.showPopup('Unable to apply', 'This could be related to a system error, please try again later.', 'error');
//                 }
//             );
//         };

//         $scope.projectStage = function(projectStage, stageNumber) {
//             if (projectStage == 'posted'){
//                 projectStage = 1;
//             }

//             if (projectStage == 'accepted'){
//                 projectStage = 2;
//             }

//             if (projectStage == 'started'){
//                 projectStage = 3;
//             }

//             if (projectStage == 'reviewed'){
//                 projectStage = 4;
//             }

//             if (projectStage == 'completed'){
//                 projectStage = 5;
//             }

//             if (projectStage >= stageNumber) {
//                 return 'assertive';
//             } else {
//                 return 'light';
//             }
//         };

//         // ProjectService.cycleUserChores($localStorage['uid']).then(function(){
//         //   console.log('Cycled');
//         // });

//         $scope.hasApplied = function(project_id){
//             for (var i = 0; i < $scope.applications.length; i++) {
//                 if ($scope.applications[i].project_id == project_id){
//                     return true;
//                 }
//             }

//             return false;
//         };







//         if (!$rootScope.isParent()) {
//             $scope.markers = {};
//             if (typeof($scope.home) == 'undefined'){
//                 $scope.home = [0,0];
//             }

//             $scope.home = [38.922525, -77.180702];

//             $scope.currentLocation = {
//                 lat: parseFloat($scope.home[0]),
//                 lng: parseFloat($scope.home[1]),
//                 // radius: 1
//                 radius: 322 //200 mile radius
//             };

//             ChildService.getProfileFromFB($localStorage['child']['member-id']).then(
//                 function(profile){

//                     ChildService.getProjectApplications($localStorage['child']['member-id']).then(
//                         function(applications){
//                             $scope.applications = applications;



//                             if ($rootScope.isParent()){
//                                 $scope.uid = $localStorage['uid'];
//                             }else{
//                                 $scope.uid = $localStorage['child']['member-id'];
//                             }

//                             $scope.dataLoaded = true;

//                             geoQuery.on("key_entered", function(key, location, distance) {
//                                 console.log('Key entered for chore');
//                                 ProjectService.getChoreById(key.replace('chore-', '')).then(
//                                     function(choreObject) {
//                                         console.log(choreObject);
//                                         if (choreObject.status != 'completed' && (choreObject.child_uid == 0 || choreObject.child_uid == $scope.uid) && choreObject.status != 'inactive' && choreObject.minimum_age <= $rootScope.getAgeFromDob(profile.dob)){
//                                             $scope.projects = $scope.projects.concat(choreObject);
//                                             $scope.isEmpty = false;

//                                             if (
//                                                 location[0] != parseFloat($scope.home[0]) &&
//                                                 location[1] != parseFloat($scope.home[1]) &&
//                                                 (!$rootScope.isParent() || window.isBrowserMode)
//                                             ) {
//                                                 // var jobMarker = new google.maps.Marker({
//                                                 //     position: new google.maps.LatLng(location[0], location[1]),
//                                                 //     map: $scope.map,
//                                                 //     icon: 'img/icons/marker.png',
//                                                 //     animation: google.maps.Animation.DROP
//                                                 // });
//                                                 // $scope.markers[key] = jobMarker;
//                                             }
//                                         }
//                                     });

//                             });

//                             geoQuery.on("key_exited", function(key, location, distance) {
//                                 console.log('Key exited for chore');
//                                 $scope.$apply(function() {
//                                     for (var i = 0; i < $scope.projects.length; i++) {
//                                         if ($scope.projects[i].id == key.replace('chore-', '')) {
//                                             $scope.projects = $scope.projects.slice(i, i);
//                                         }
//                                     }

//                                     if ($scope.projects.length == 0) {
//                                         $scope.isEmpty = true;
//                                         $scope.projects = [];
//                                     } else {
//                                         $scope.isEmpty = false;
//                                     }
//                                 });
//                             });

//                             setTimeout(function(){
//                                 $scope.$apply(function(){
//                                     $ionicLoading.hide();
//                                 });
//                             }, 200);


//                             $scope.zoomChanged = function() {
//                                 console.log('Zoom changed');
//                             };

//                             // setTimeout(function(){
//                             //     $scope.map.setCenter(new google.maps.LatLng(34.093762, -83.7238687));
//                             // }, 200);


//                     });
//                 });
//         }else{
//           ProjectService.getUserChores($localStorage['uid']).then(
//             function(chores){
//                 for (var i = 0; i < chores.length; i++) {
//                     var choreObject = chores[i];
//                     if (choreObject.status != 'completed' && choreObject.status != 'inactive'){
//                         $scope.projects = $scope.projects.concat(choreObject);
//                     }
//                 }
//                 $scope.dataLoaded = true;
//                 if (chores.length == 0){
//                     $scope.isEmpty = true;
//                 }

//                 setTimeout(function(){
//                     $scope.$apply(function(){
//                         $ionicLoading.hide();
//                     });
//                 }, 200);

//                 console.log(chores);
//             });
//         }

//         $scope.manageProject = function(projectId){
//             if (window.isBrowserMode || !window.cordova){
//                 //manage action sheet
//             }else{
//                 var options = {
//                   androidTheme : window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT, // material
//                   title: 'What do you want to do with this chore?',
//                   buttonLabels: ['Edit Project'],
//                   addCancelButtonWithLabel: 'Cancel',
//                   androidEnableCancelButton : true,
//                   winphoneEnableCancelButton : true,
//                   addDestructiveButtonWithLabel : 'Cancel Chore',
//                   destructiveButtonLast: true // you can choose where the destructive button is shown
//                 };
//                 window.plugins.actionsheet.show(options, function(buttonIndex){
//                     if (buttonIndex-1 == 0){
//                         //edit
//                         $rootScope.showEditProjectModal(projectId);
//                     }else if (buttonIndex-1 == 1){
//                         //delete
//                         var confirmPopup = $ionicPopup.confirm({
//                              title: 'Cancel Chore?',
//                              template: 'Are you sure you want to cancel this chore? This can not be undone.'
//                            });

//                            confirmPopup.then(function(res) {
//                              if(res) {
//                                $rootScope.showLoader();
//                                //delete project
//                                ProjectService.deleteProject(projectId).then(
//                                 function(){
//                                     $ionicLoading.hide();
//                                     $rootScope.showPopup('Chore deleted', 'This chore has been deleted.');
//                                 },
//                                 function(){
//                                     $ionicLoading.hide();
//                                     $rootScope.showPopup('Unable to delete chore', 'We were unable to delete this chore. This could be related to a system error, please try again later.', 'error');
//                                 });
//                              }
//                            });
//                     }else{
//                         //unknown action assume cancel
//                     }
//                     //}else if (buttonIndex == 1){
//                         //duplicate
//                     //}else if (buttonIndex == 2){
//                         //delete
//                     //}else{
//                         //unknown action assume cancel
//                     //}
//                 });
//             }
//         };

//         $scope.viewProject = function(projectId){
//             console.log(projectId);
//             $rootScope.showProjectViewModal(projectId);
//         };
//     }
// ]);



appControllers.controller('choresCtrl', function($scope, $rootScope, uiGmapGoogleMapApi, ChildService, ProjectService, $localStorage) {
    $scope.projects = [];
    $scope.myprojects = [];
    $scope.projectsLoaded = 'not loaded';
    $scope.activeFilter = 'new';

    setTimeout(function() {
        $("#nonotification").hide();
    }, 500);

    if ($rootScope.isParent()) {
        $scope.activeFilter = 'my';
    }

    $scope.changeActiveFilter = function(newFilter) {
        if (newFilter != $scope.activeFilter) {
            $scope.activeFilter = newFilter;
        }
    };

    $scope.isActiveFilter = function(filter) {
        if (filter == $scope.activeFilter) {
            return 'active';
        }
    }

    if (!$rootScope.isParent() && typeof($localStorage['child']['home']) != 'undefined' && $localStorage['child']['home'] != null) {
        $scope.home = $localStorage['child']['home'];
        $scope.center = {
            latitude: parseFloat($scope.home[0]),
            longitude: parseFloat($scope.home[1])
        };
    } else {
        $scope.center = {
            latitude: 0,
            longitude: 0
        };
    }

    $scope.map = {
        center: $scope.center,
        zoom: 14
    };
    $scope.options = {
        scrollwheel: false,
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        styles: $rootScope.mapStyle
    };

    $scope.homeMarker = {
        id: 0,
        coords: $scope.center,
        options: {
            icon: 'img/icons/home-marker.png'
        }
    };

    $scope.choreMarkers = [];

    //$scope.projectsLoaded = 'not-empty';

    if (!$rootScope.isParent()) {

        var firebaseRef = firebase.database().ref().child('chore-locations');

        // Create a GeoFire index
        var geoFire = new GeoFire(firebaseRef);

        navigator.geolocation.getCurrentPosition(function(pos) {
            $scope.$apply(function() {
                $scope.map.center = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };

                if ($scope.center.latitude == 0 && $scope.center.longitude == 0) {
                    $scope.center.latitude = $scope.map.center.latitude;
                    $scope.center.longitude = $scope.map.center.longitude;
                    $scope.homeMarker = {
                        id: 0,
                        coords: $scope.center,
                        options: {
                            icon: 'img/icons/home-marker.png'
                        }
                    };
                }

                $scope.geoQuery = geoFire.query({
                    center: [$scope.map.center.latitude, $scope.map.center.longitude],
                    radius: 322
                });

                $scope.geoQuery.on("ready", function() {
                    // setTimeout(function(){
                    //     if ($scope.projects.length == 0) {
                    //         $scope.projectsLoaded = 'empty';
                    //     } else {
                    //         $scope.projectsLoaded = 'not-empty';
                    //     }
                    // }, 1000);
                });

                ChildService.getProfileFromFB($localStorage['child']['member-id']).then(
                    function(profile) {
                        ChildService.getProjectApplications($localStorage['child']['member-id']).then(
                            function(applications) {
                                $scope.applications = applications;

                                $scope.geoQuery.on("key_entered", function(key, location, distance) {
                                    console.log('Key entered for chore');

                                    ProjectService.getChoreById(key.replace('chore-', '')).then(
                                        function(choreObject) {
                                            if ((choreObject.child_uid == 0 || choreObject.child_uid == $scope.uid) && choreObject.minimum_age <= $rootScope.getAgeFromDob(profile.dob) && choreObject.status != 'inactive') {
                                                $scope.projects = $scope.projects.concat(choreObject);
                                                // $scope.projectsLoaded = 'not-empty';

                                                if (
                                                    location[0] != parseFloat($scope.map.center.latitude) &&
                                                    location[1] != parseFloat($scope.map.center.longitude) &&
                                                    (!$rootScope.isParent() || window.isBrowserMode)
                                                ) {
                                                    $scope.choreMarkers = $scope.choreMarkers.concat({
                                                        id: key.replace('chore-', ''),
                                                        latitude: location[0],
                                                        longitude: location[1],
                                                        icon: 'img/icons/marker.png'
                                                    });
                                                }
                                            } else {
                                                // if (choreObject.status == 'posted'){
                                                // if ($scope.projects.length == 0){
                                                // $scope.projectsLoaded = 'empty';
                                                // }
                                                // }
                                            }
                                        });
                                });
                            });
                    });

                ChildService.getMyProjects($localStorage['child']['member-id']).then(
                    function(myProjects) {
                        $scope.myprojects = myProjects;
                        if ($scope.myprojects.length == 0) {
                            $scope.projectsLoaded = 'empty';
                            $scope.myprojects = [];
                        } else {
                            $scope.projectsLoaded = 'not-empty';
                        }
                    });

                $scope.geoQuery.on("key_exited", function(key, location, distance) {
                    console.log('Key exited for chore');
                    $scope.$apply(function() {
                        for (var i = 0; i < $scope.projects.length; i++) {
                            if ($scope.projects[i].id == key.replace('chore-', '')) {
                                $scope.projects = $scope.projects.slice(i, i);
                            }
                        }

                        if ($scope.projects.length == 0) {
                            $scope.projectsLoaded = 'empty';
                            $scope.projects = [];
                        } else {
                            $scope.projectsLoaded = 'not-empty';
                        }
                    });
                });
            });
        });

        $scope.$watch('map.center', function(new_val, old_val) {
            if (new_val !== old_val) {
                geoQuery.updateCriteria({
                    center: [$scope.map.center.latitude, $scope.map.center.longitude],
                    radius: 322
                });
            }
        });


    } else {
        ProjectService.getUserChores($localStorage['uid']).then(
            function(chores) {
                $scope.myprojects = chores;

                if ($scope.myprojects.length == 0) {
                    $scope.projectsLoaded = 'empty';
                    $scope.myprojects = [];
                } else {
                    $scope.projectsLoaded = 'not-empty';
                }
            });
    }

    $scope.viewProject = function(projectId) {
        console.log(projectId);
        $rootScope.showProjectViewModal(projectId);
    };

    $scope.hasMap = function() {
        if (!$rootScope.isParent()) {
            return 'hasMap';
        }
    };

});
appControllers

    .controller('helpMeCtrl',
        ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', 'ChildService', 'ParentService', '$ionicScrollDelegate', '$cordovaContacts',
            function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, ChildService, ParentService, $ionicScrollDelegate, $cordovaContacts) {
              $scope.first_contact = null;
              $scope.second_contact = null;
              $scope.getContactList = function() {
                navigator.contacts.pickContact(function(contact){
                    console.log('The following contact has been selected:' + JSON.stringify(contact));
                    $scope.$apply(function(){
                      if ($scope.first_contact == null){
                        $scope.first_contact = contact;
                      }else{
                        $scope.second_contact = contact;
                      }
                      ChildService.storeContacts($localStorage['child']['member-id'], contact).then(
                        function(response){
                          console.log(response);
                        });
                    });
                },function(err){
                    console.error('Error: ' + err);
                });
              };

              ChildService.getEmergencyContacts($localStorage['child']['member-id']).then(
                function(contacts){
                  $scope.contacts = contacts;
                  for (var i = 0; i < $scope.contacts.length; i++) {
                    if ($scope.first_contact == null){
                      $scope.first_contact = $scope.contacts[i];
                    }else{
                      $scope.second_contact = $scope.contacts[i];
                    }
                  }
                }
              );

              $scope.sendEmergency = function(){
                // var options = {
                //     replaceLineBreaks: false, // true to replace \n by a new line, false by default
                //     android: {
                //         intent: 'INTENT'  // send SMS with the native android SMS messaging
                //         //intent: '' // send SMS without open any other app
                //     }
                // };

                // var success = function () {  };
                // var error = function (e) {  };
                // navigator.geolocation.getCurrentPosition(function(pos) {
                //     //sms.send($scope.first_contact.phoneNumbers[0].value, 'I am sending an alert with my location through KidzForce. comgooglemaps://?center=' + pos.coords.latitude + ',' + pos.coords.longitude + '&zoom=14&views=traffic', options, success, error);
                //     //sms.send($scope.second_contact.phoneNumbers[0].value, 'I am sending an alert with my location through KidzForce. comgooglemaps://?center=' + pos.coords.latitude + ',' + pos.coords.longitude + '&zoom=14&views=traffic', options, success, error);
                //     $rootScope.showPopup('Contacts Notified', 'We have notifed your emergency contacts.');
                // });

                ChildService.requestHelp($scope.first_contact.phoneNumbers[0].value, $scope.second_contact.phoneNumbers[0].value).then(function(){
                  console.log('sent alert');
                  $rootScope.showPopup('Contacts Notified', 'We have notifed your emergency contacts.')
                });
                
              };
            }
        ]
    );

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

appControllers

    .controller('notificationCtrl', ['$scope', '$rootScope', '$sce', '$state', '$ionicPopup', '$ionicHistory', '$ionicGesture', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', '$q', '$interval', '$cordovaBadge', 'ProjectService', 'ChildService', 'ParentService', 'ChildrenService', 'WordPress',
    function($scope, $rootScope, $sce, $state, $ionicPopup, $ionicHistory, $ionicGesture, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, $q, $interval, $cordovaBadge, ProjectService, ChildService, ParentService, ChildrenService, WordPress) {

        if (!$rootScope.isParent()){
            $rootScope.rooDailyDrops($localStorage['child']['member-id']);
        }

        $scope.isEmpty = false;

        $scope.setBadge = function(value) {
          if (!window.isBrowserMode){
            $cordovaBadge.hasPermission().then(function(result) {
                $cordovaBadge.set(value);
            }, function(error) {

            });
          }
        }

        $scope.clearBadge = function(){
          if (!window.isBrowserMode){
            $cordovaBadge.clear().then(function() {
            // You have permission, badge cleared.
            }, function(err) {
            // You do not have permission.
            });
          }
        }

        $scope.notifications = [];

        // // //console.log(JSON.stringify($scope.notifications));
        $scope.respond = function(notifiableId, response) {
            //$scope.showLoader();
            $scope.declineDialog().then(
                function(success) {
                    NotificationService.respond(notifiableId, response).then(
                        function(response) {
                            //console.log(response);
                            $ionicLoading.hide();
                        },
                        function(error) {
                            $ionicLoading.hide();
                        }
                    );
                },
                function(canceled) {
                    //console.log('Canceled request');
                }
            );
        };

        $scope.additionalAction = function(notification){
          if (notification.type == "App\\Notifications\\newNotifications\\Homeowner\\ApplicantOfferNotification"){
            $rootScope.viewChildProfile(notification.data.child_id);
          }
        };

        $scope.onClickNotification = function(key, type, id, star) {

            if (type == 'dismiss'){
                $ionicLoading.show();
                $scope.notifications[key].animate = 'zoomOut';
                NotificationService.notificationaction(id, type, star).then(
                    function(response) {
                        //setTimeout(function(){
                            //$scope.$apply(function(){
                                $ionicLoading.hide();
                                //$scope.reload();
                            //});
                        //}, 500);

                    },
                    function(error) {
                        $ionicLoading.hide();
                    }
                );
            }else{
               //$scope.confirmDialog('Are you sure?', 'You can not undo this action.', 'Confirm').then(
                //    function(success) {
                    
                    if (type == 'check-in'){
                        $rootScope.showCheckInModal($scope.notifications[key]);
                        // setTimeout(function(){
                        //     $scope.notifications.splice(key, 1);
                        // }, 5);
                    }else if (type == 'help'){
                        $rootScope.showReportModal('Project Ref: #' + $scope.notifications[key].data.project_id, 'Need help with this project.');
                        // setTimeout(function(){
                        //     $scope.notifications.splice(key, 1);
                        // }, 5);
                    }else{
                        $scope.notifications[key].animate = 'zoomOut';
                        // setTimeout(function(){
                        //     $scope.notifications.splice(key, 1);
                        // }, 5);
                        // //console.log(id);

                        $ionicLoading.show();
                        NotificationService.notificationaction(id, type, star).then(
                            function(response) {
                                //setTimeout(function(){
                                //    $scope.$apply(function(){
                                        $ionicLoading.hide();
                                        //$scope.reload();
                                //    });
                                //}, 500);

                            },
                            function(error) {
                                $ionicLoading.hide();
                            }
                        );
                    }
                //    },
                //    function(canceled) {
                //        //console.log('Canceled request');
                //    }
                //);
            }



            // response-additional-data.
        }

        $scope.actionOrInfoCard = function(type){
            if (type == 'App\\Notifications\\newNotifications\\Child\\RequestedRatingNotification' ||
                type == 'App\\Notifications\\newNotifications\\Homeowner\\ApplicantOfferNotification' ||
                type == 'App\\Notifications\\newNotifications\\Child\\ReceivedRequestForApplicationNotification' ||
                type == 'App\\Notifications\\newNotifications\\Project\\CheckedInNotification' ||
                type == 'App\\Notifications\\newNotifications\\Child\\CheckInNotification' ||
                type == 'App\\Notifications\\newNotifications\\Parent\\RequestForApplicationNotification'){
                return true;
            }else{
                return false;
            }
        };

        $scope.hasRating = function(type){
            if (type == 'App\\Notifications\\newNotifications\\Child\\RequestedRatingNotification' ||
                type == 'App\\Notifications\\newNotifications\\Child\\ReceivedRatingNotification'){
                return true;
            }else{
                return false;
            }
        };

        $scope.hasMap = function(type){
            /*if (type == 'App\\Notifications\\newNotifications\\Child\\CheckInNotification'){
                return true;
            }else{
                return false;
            }*/
            return false;
        };

        $scope.generateActions = function(type, project){

            var toReturn = [];
            //Action Cards
            switch (type){
                case 'App\\Notifications\\newNotifications\\Child\\RequestedRatingNotification':
                    toReturn = [
                        {
                            'name': 'SUBMIT',
                            'icon': 'ion-checkmark-round',
                            'action': 'submit-review'
                        },
                        {
                            'name': 'HELP',
                            'icon': 'ion-alert-circled',
                            'action': 'help'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Homeowner\\ApplicantOfferNotification':
                    toReturn = [
                        {
                            'name': 'ACCEPT',
                            'icon': 'ion-checkmark-round',
                            'action': 'accept'
                        },
                        {
                            'name': 'DECLINE',
                            'icon': 'ion-minus-circled',
                            'action': 'decline'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Child\\ReceivedRequestForApplicationNotification':
                    toReturn = [
                        {
                            'name': 'ACCEPT',
                            'icon': 'ion-checkmark-round',
                            'action': 'accept-project-offer'
                        },
                        {
                            'name': 'PASS',
                            'icon': 'ion-minus-circled',
                            'action': 'pass'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Project\\CheckedInNotification':
                    $rootScope.hasCheckIn = true;
                    $rootScope.checkIn = project;
                    toReturn = [
                        {
                            'name': 'START PROJECT',
                            'icon': 'ion-checkmark-round',
                            'action': 'check-in'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Child\\CheckInNotification':
                    toReturn = [
                        {
                            'name': 'COMPLETE',
                            'icon': 'ion-checkmark-round',
                            'action': 'complete'
                        }
                    ];
                    break;

                case 'App\\Notifications\\newNotifications\\Parent\\RequestForApplicationNotification':
                    toReturn = [
                        {
                            'name': 'ALLOW',
                            'icon': 'ion-checkmark-round',
                            'action': 'allow'
                        },
                        {
                            'name': 'DENY',
                            'icon': 'ion-checkmark-round',
                            'action': 'deny'
                        }
                    ];
                    break;
            }

            //Readonly Cards
            switch (type){
                case 'App\\Notifications\\newNotifications\\Child\\ReceivedRatingNotification':
                    break;

                case 'App\\Notifications\\newNotifications\\Child\\ApplicantAcceptedNotification':
                    break;

                case 'App\\Notifications\\newNotifications\\Homeowner\\ApplicantAcceptedNotification':
                    break;

                case 'App\\Notifications\\newNotifications\\Project\\CheckInNotification':
                    break;

                case 'App\\Notifications\\newNotifications\\Homeowner\\ApplicantDeclinedNotification':
                    break;
            }


            return toReturn;

        };

        // $scope.hasOffset = function(index){
        //     if (index > 0){
        //         return 'col-offset-10';
        //     }
        // };

        $scope.cardRightAction = function(notification){
            //Show Map Thumbnail
            /*if (notification.type == 'App\\Notifications\\newNotifications\\Child\\CheckInNotification'){
                return $sce.trustAsHtml('<img src="'+notification.data.geocoded_image+'" class="mapThumbnailCard" />');
            }*/
        };

        $scope.navigateToProjects = function(){
          return "#/app/parent/chores";
        };

        var uid = '';

        if ($rootScope.isParent()){
            uid = $localStorage['uid'];
        }else{
            uid = $localStorage['child']['member-id'];
        }

        NotificationService.getNotificationsFromFB(uid).then(
            function(notificationsObjects){
                $scope.notifications = notificationsObjects;
                $scope.cycleNotifications();
                $scope.notifications.$watch(function(event){
                    $scope.cycleNotifications();
                });
            });

        $scope.cycleNotifications = function(){
            if ($scope.notifications.length == 0){
                $scope.isEmpty = true;
            }else{
                $scope.isEmpty = false;
            }

            for (var i = 0; i < $scope.notifications.length; i++) {
                if (typeof($scope.notifications[i]['read_at']) != 'undefined'){
                    if ($scope.notifications[i]['read_at'] != ''){
                        $scope.notifications.$remove($scope.notifications[i]);
                        continue;
                    }
                }
                $scope.notifications[i]['animate'] = 'zoomIn';
                $scope.notifications[i]['isActionCard'] = $scope.actionOrInfoCard($scope.notifications[i]['type']);
                if ($scope.notifications[i]['isActionCard']){
                    $scope.notifications[i]['cardclass'] = 'actioncard';
                }else{
                    $scope.notifications[i]['cardclass'] = 'infocard';
                }
                $scope.notifications[i]['actions'] = $scope.generateActions($scope.notifications[i]['type'], $scope.notifications[i]);
                $scope.notifications[i]['cardRightAction'] = $scope.cardRightAction($scope.notifications[i]);
            }
        };

        if ($rootScope.isParent()){
            ParentService.getProfileFromFB($localStorage['uid']).then(
                function(profileObj){
                    console.log(profileObj);
                    $scope.profile = profileObj;
                    
                    $scope.balance = {
                        number_of_total_projects: $scope.profile.num_of_total_projects,
                        number_of_completed_projects: $scope.profile.num_of_completed_projects,
                        avg_review_score: $scope.profile.avg_review_score,
                    };

                    $scope.$watch('profile', function(new_val, old_val){
                        if (new_val != old_val){
                            $scope.balance = {
                                number_of_total_projects: $scope.profile.num_of_total_projects,
                                number_of_completed_projects: $scope.profile.num_of_completed_projects,
                                avg_review_score: $scope.profile.avg_review_score,
                            };
                        }
                    });
                });
        }else{
            ChildService.getProfileFromFB($localStorage['child']['member-id']).then(
                function(profileObj){
                    $scope.profile = profileObj;
                });

            ChildrenService.getChildBalanceForParent($localStorage['child']['member-id']).then(
                function(balanceObj){
                    $scope.balance = balanceObj;
                });
        }

        $scope.profile = {
            rank: '',
            name: '',
            num_of_total_projects: 0,
            num_of_completed_projects: 0,
            avg_review_score: 0
        };

        // $scope.wordpress_posts = [];
        // $scope.times = 1;
        // WordPress.getPosts($scope.times)
        // .success(function (posts) {
        //     $scope.wordpress_posts = $scope.wordpress_posts.concat(posts.posts);
        //     $scope.$broadcast('scroll.infiniteScrollComplete');
        //     $scope.times = $scope.times + 1;
        //     if(posts.posts.length == 0) {
        //         $scope.postsCompleted = true;
        //     }
        // })
        // .error(function (error) {
        //     $scope.items = [];
        // });


    }
]);

appControllers

    .controller('profileCtrl',
        ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'ChildService', '$http', 'NotificationService', 'ParentService',
            function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, ChildService, $http, NotificationService, ParentService) {

              if ($rootScope.isParent()){
                $scope.profile = $localStorage['parent'];
                $scope.identity = {};

                ParentService.getIdentity($localStorage['uid']).then(
                  function(identityObject){
                    $scope.identity = identityObject;
                  });

              }else{
                $scope.profile = $localStorage['child'];
                $scope.memberId = $scope.profile['member-id'];
              }


              $scope.getQRImageLink = function(){
                if (typeof($scope.memberId) != 'undefined'){
                  var qr = new QRious({
                    value: $scope.memberId
                  });
                  var qrImageLink = qr.toDataURL();
                  return qrImageLink;
                }
              };

              $scope.updateResume = function(){
                  $scope.showLoader();
                  ChildService.updateResume($scope.profile['member-id'], $scope.profile.resume).then(
                      function(success){
                          $ionicLoading.hide();
                          $scope.showSuccessPopup('Hooray!', 'Success message goes here');
                      },
                      function(error){
                          $ionicLoading.hide();
                          $scope.showErrorPopup('Oops!', 'Error message goes here');
                      }
                  );
              };

              $scope.newauth = {
                  password: '',
                  confirm: ''
              };

              $scope.isCompletedPassword = function(){
                if ($scope.newauth.password == '' || $scope.newauth.confirm == ''){
                  return false;
                }else{
                  return true;
                }
              };

              $scope.updatePassword = function(){
                  $scope.showLoader();

                  if ($scope.newauth.password != $scope.newauth.confirm){
                    $ionicLoading.hide();
                    $rootScope.showPopup('Password mismatch', 'The password you entered does not match the confirm password.');
                    return;
                  }

                  console.log($scope.profile);
                  if ($rootScope.isParent()){
                    firebase.auth().currentUser.updatePassword($scope.newauth.password).then(
                      function(success){
                        $ionicLoading.hide();
                        $rootScope.showPopup('Password updated', 'Your password has been updated.');
                      },
                      function(error){
                        $ionicLoading.hide();
                        $rootScope.showPopup('Problem updating', error.message);
                      }
                    );
                  }else{
                    ChildService.updatePassword($scope.profile['member-id'], $scope.newauth.password, $scope.newauth.confirm).then(
                        function(success){
                            $ionicLoading.hide();
                            $scope.showPopup('Password updated', 'Your password has been updated.');
                        },
                        function(error){
                            $ionicLoading.hide();
                            $rootScope.showPopup('Unable to update password', 'This could be related to a system error, please try again later.', 'error');
                        }
                    );
                  }
              };

              $scope.printCards  = function(){
                if (!window.isBrowserMode){
                  if (window.cordova){
                    cordova.plugins.printer.print('http://api.kidzforce.com/business_cards/print.php?design=1&name=John+Doe&home_phone=(555)+555-5555&cell_phone=(444)+444-4444&work_phone=(333)+333-3333&website=jamescostian.com&company=Local+pawn+shop&position=CEO&skype=jamescostian&email=james%40jamescostian.com&location=Silicon+Valley%2C+CA');
                  }

                  //$rootScope.showPopup('Printed', 'Your business cards have been sent to the printer.');
                }
              };

              $scope.purchasePremium = function(){
                  $rootScope.showLoader();
                  ProductsService.purchaseProduct('com.riveloper.KIDZ-BIZ-101.promo_pack').then(
                      function(success){
                          $ionicLoading.hide();
                          console.log(success);
                      },
                      function(error){
                          $ionicLoading.hide();
                          console.error(error);
                      }
                  );
              };

              $scope.updateAccount = function(){
                $rootScope.verifyIdentityToAddProject = false;
                $rootScope.showVerifyIdentityModal();
              };

              $scope.countryCode = 'US';

              $scope.onAddressSelection = function (location) {
                  $scope.profile.home_address = location.formatted_address;
              };
            }
        ]
    );


appControllers.controller('paymentMethodsCtrl', ['$scope', '$rootScope', '$ionicPopup', '$ionicLoading', '$timeout',
  function($scope, $rootScope, $ionicPopup, $ionicLoading, $timeout){
    $scope.paymentMethods = [
      {
        icon: 'https://sandbox.braintreegateway.com/images/payment_instrument_images/visa.png',
        masked: '**** **** **** 1234',
        card: '',
        exp: '01/20',
        cvc: '123',
        name: 'Austin Sweat'
      }
    ];

    $scope.currentSelectedPaymentMethod = {};
    $scope.managePopup = null;

    $scope.managePaymentMethod = function(paymentMethod){
      $scope.currentSelectedPaymentMethod = paymentMethod;
      $scope.managePopup = $ionicPopup.show({
        template: '<div class="list">'+
  '<label class="item item-input">'+
    '<span class="input-label">Name</span>'+
    '<input type="text" ng-model="currentSelectedPaymentMethod.name">'+
  '</label>'+
'<label class="item item-input">'+
    '<span class="input-label">Card</span>'+
    '<input type="text" placeholder="{{currentSelectedPaymentMethod.masked}}" ng-model="currentSelectedPaymentMethod.card">'+
  '</label>'+
  

'<label class="item item-input">'+
    '<span class="input-label">Exp</span>'+
    '<input type="text" ng-model="currentSelectedPaymentMethod.exp">'+
  '</label><label class="item item-input">'+
    '<span class="input-label">CVC</span>'+
    '<input type="text" ng-model="currentSelectedPaymentMethod.cvc">'+
  '</label>'+
'</div>'+
'<button class="button button-full button-positive" ng-click="savePaymentMethod(currentSelectedPaymentMethod)">Save</button></div>'+
  '<button class="button button-full button-assertive" ng-click="deletePaymentMethod(currentSelectedPaymentMethod)">Delete</button></div>',
        title: 'Manage Visa 1234',
        subTitle: 'You can delete this payment method.',
        scope: $scope,
        buttons: []
      });

      $scope.managePopup.then(function(res){

      });
    };

    $scope.savePaymentMethod = function(paymentMethod){
      console.log(paymentMethod);
      $ionicLoading.show();
      $timeout(function(){
        $ionicLoading.hide();
        $scope.managePopup.close();
      }, 1000);
    };

    $scope.deletePaymentMethod = function(paymentMethod){
      console.log(paymentMethod);
      $ionicLoading.show();
      $timeout(function(){
        $ionicLoading.hide();
        $scope.managePopup.close();
      }, 1000);
    };
  }
]);

appControllers

    .controller('reportCtrl',
        ['$scope', '$rootScope', '$state', 'ChildService', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService',
            function($scope, $rootScope, $state, ChildService, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService) {
                $scope.params = $rootScope.help;

                $scope.sendReport = function(){
                    $rootScope.showPopup('Report Filed', 'We have filed your report and will be in contact shortly.').then(function(){
                        $rootScope.modal.hide();
                    });
                };
            }
        ]
    );
appControllers

    .controller('reviewsCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', '$firebaseAuth', '$cordovaOauth', 'ChildService', '$sce', '$compile',
        function($scope, $rootScope, $state, $stateParams, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, $firebaseAuth, $cordovaOauth, ChildService, $sce, $compile) {
            $scope.reviews = [];
            $scope.projects = {};
            $rootScope.showLoader();
            ChildService.getReviews($rootScope.childId).then(
              function(reviews){
                $scope.reviews = reviews;
                $ionicLoading.hide();
                
                for (var i = 0; i < $scope.reviews.length; i++) {
                  var reviewObject = $scope.reviews[i];
                
                  ProjectService.getChoreById(reviewObject.project).then(
                    function(projectObject){
                      $scope.projects[reviewObject.project] = $scope.projects.concat(projectObject);
                    });
                }
              },
              function(error){
                console.error(error);
              }
            );

            $scope._calculateAge = function(birthday) { // birthday is a date
                var ageDifMs = Date.now() - birthday.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            ChildService.getProfileFromFB($rootScope.childId).then(
              function(profile){
                $scope.profile = profile;
                $scope.profile.age = $scope._calculateAge(new Date($scope.profile.dob));
              });
        }
    ]);

appControllers

    .controller('rewardCtrl',
        ['$scope', '$rootScope', '$state', 'ChildService', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', 'ChildrenService', 'ProjectService',
            function($scope, $rootScope, $state, ChildService, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, ChildrenService, ProjectService) {
                $scope.profile = $localStorage['child'];

                $scope.rewards = [];
                $scope.allRewards = [];
                $scope.itteration = 1;

                $scope.moreDataAvailable = true;
                $scope.reload = function(){
                    if (Object.keys($scope.allRewards).length == 0){
                        ChildService.getRewards().then(
                            function(response){
                                $scope.allRewards = response;
                                $scope.reload();
                            },
                            function(error){
                                
                            });
                    }else{
                        if (Object.keys($scope.allRewards).length != Object.keys($scope.rewards).length){
                            if ($scope.itteration == 0){
                                $scope.start = 0;
                                $scope.end = 5;
                            }else{
                                $scope.start = 5 * ($scope.itteration-1);
                                $scope.end = 5 * $scope.itteration;
                            }

                            var notifications = ($scope.allRewards.slice($scope.start, $scope.end)); //start, end
                            for (var i = 0; i < Object.keys(notifications).length; i++) {
                                $scope.rewards = $scope.rewards.concat(notifications[i]);
                            }
                        }else{
                            $scope.moreDataAvailable = false;
                        }

                        $scope.itteration += 1;
                    }
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                };

                $scope.showLoader();
                $scope.reload();

                $scope.redeemReward = function(rewardId){
                    $rootScope.showLoader();
                    ChildService.requestReward(rewardId).then(
                        function(success){
                            $ionicLoading.hide();
                            $rootScope.showPopup('Reward Redeemed', 'We have sent your reward to your parents email.', '');
                        },
                        function(error){
                            $ionicLoading.hide();
                            $rootScope.showPopup('Unable to reward', 'This could be related to a system error, please try again later.', 'error');
                        }
                    );
                };

                $scope.deposit = function(){
                    ChildService.requestDeposit().then(
                        function(success){
                            $scope.profile.num_of_cash = 0;
                            // $rootScope.showPopup('ON THE WAY', 'Your transaction is completed, funds will be available in 1 - 3 business days.');
                            $rootScope.showPopup('Deposit complete', 'Your transaction is completed, funds will be available in 1 - 3 business days.', '');
                        },
                        function(error){
                            $rootScope.showPopup('Unable to deposit', 'This could be related to a system error, please try again later.', 'error');
                        }
                    );
                    
                };

                ChildrenService.getChildBalanceForParent($localStorage['child']['member-id']).then(
                    function(balanceObj){
                        $scope.balance = balanceObj;
                    });

                $scope.reviews = [];
                $scope.projects = {};
                $rootScope.showLoader();
                ChildService.getReviews($localStorage['child']['member-id']).then(
                  function(reviews){
                    $scope.reviews = reviews;
                    $ionicLoading.hide();
                    
                    for (var i = 0; i < $scope.reviews.length; i++) {
                      var reviewObject = $scope.reviews[i];

                      console.log(reviewObject);
                    
                      ProjectService.getChoreById(reviewObject.project).then(
                        function(projectObject){
                            console.log(projectObject);
                          $scope.projects[reviewObject.project] = projectObject;
                        });
                    }
                  },
                  function(error){
                    console.error(error);
                  }
                );
            }
        ]
    );
appControllers

    .controller('viewProjectCtrl', ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', 'NotificationService', 'ChildService', 'ParentService', 'ProjectService', '$ionicScrollDelegate',
    function($scope, $state, $rootScope, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, NotificationService, ChildService, ParentService, ProjectService, $ionicScrollDelegate) {
        if ($rootScope.isParent()){
            $scope.uid = $localStorage['uid'];
        }else{
            $scope.uid = $localStorage['child']['member-id'];
            ChildService.getProfileFromFB($localStorage['child']['member-id']).then(
                function(profile){
                    $scope.profile = profile;

                    ChildService.getProjectApplications($localStorage['child']['member-id']).then(
                        function(applications){
                            $scope.applications = applications;
                        });
                });
        }
        //$rootScope.projectViewId
        console.log($rootScope.projectViewId);
        ProjectService.getChoreById($rootScope.projectViewId).then(
            function(choreObject){
                $scope.project = choreObject;
            }
        );

        $scope.hasApplied = function(project_id){
            for (var i = 0; i < $scope.applications.length; i++) {
                if ($scope.applications[i].project_id == project_id){
                    return true;
                }
            }

            return false;
        };

        $scope.manageProject = function(projectId){
            if (window.isBrowserMode || !window.cordova){
                //manage action sheet
            }else{
                var options = {
                  androidTheme : window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT, // material
                  title: 'What do you want to do with this chore?',
                  buttonLabels: ['Edit Project'],
                  addCancelButtonWithLabel: 'Cancel',
                  androidEnableCancelButton : true,
                  winphoneEnableCancelButton : true,
                  addDestructiveButtonWithLabel : 'Cancel Chore',
                  destructiveButtonLast: true // you can choose where the destructive button is shown
                };
                window.plugins.actionsheet.show(options, function(buttonIndex){
                    if (buttonIndex-1 == 0){
                        //edit
                        $rootScope.showEditProjectModal(projectId);
                    }else if (buttonIndex-1 == 1){
                        //delete
                        var confirmPopup = $ionicPopup.confirm({
                             title: 'Cancel Chore?',
                             template: 'Are you sure you want to cancel this chore? This can not be undone.'
                           });

                           confirmPopup.then(function(res) {
                             if(res) {
                               $rootScope.showLoader();
                               //delete project
                               ProjectService.deleteProject(projectId).then(
                                function(){
                                    $ionicLoading.hide();
                                    $rootScope.showPopup('Chore deleted', 'This chore has been deleted.');
                                },
                                function(){
                                    $ionicLoading.hide();
                                    $rootScope.showPopup('Unable to delete chore', 'We were unable to delete this chore. This could be related to a system error, please try again later.', 'error');
                                });
                             }
                           });
                    }else{
                        //unknown action assume cancel
                    }
                    //}else if (buttonIndex == 1){
                        //duplicate
                    //}else if (buttonIndex == 2){
                        //delete
                    //}else{
                        //unknown action assume cancel
                    //}
                });
            }
        };

        $scope.reportChore = function(chore_id) {
            $rootScope.showPopup('Reported', 'This chore has been flagged and is awaiting review by an Administrator.', 'error');
        };

        $scope.apply = function(chore_id) {
            $scope.showLoader();
            $scope.applying = true;
            ChildService.applyForChore(chore_id).then(
                function(success) {

                    //console.log(success);
                    // for (var i = 0; i < $scope.chores.length; i++) {
                    //     if ($scope.chores[i].project.id == chore_id) {
                    //         $scope.chores[i].project.applied = true;
                    //     }
                    // }
                    $ionicLoading.hide();
                    $scope.applying = false;
                    $scope.showPopup('Awaiting Approval', 'We have sent your request to the poster. We will notify you when they respond. ');
                    //$state.go('app.child-dashboard');
                },
                function(error) {
                    $ionicLoading.hide();
                    console.log(error);
                    $scope.applying = false;
                    $rootScope.showPopup('Unable to apply', 'This could be related to a system error, please try again later.', 'error');
                }
            );
        };

        $scope.projectStage = function(projectStage, stageNumber) {
            if (projectStage == 'posted'){
                projectStage = 1;
            }

            if (projectStage == 'accepted'){
                projectStage = 2;
            }

            if (projectStage == 'started'){
                projectStage = 3;
            }

            if (projectStage == 'reviewed'){
                projectStage = 4;
            }

            if (projectStage == 'completed'){
                projectStage = 5;
            }

            if (projectStage >= stageNumber) {
                return 'assertive';
            } else {
                return 'light';
            }
        };
    }
]);
appControllers

    .controller('menuPlusCtrl', ['$scope', '$rootScope',
        function($scope, $rootScope){
            $scope.multiActionActive = false;
            $scope.activateMultiAction = function(){
              $scope.multiActionActive = !$scope.multiActionActive;
            };
            $scope.multiActionActiveCheck = function(){
              if ($scope.multiActionActive){
                return 'active';
              }else{
                return 'inactive';
              }
            };
        }
    ])

    .controller('webCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$ionicPopup', '$ionicHistory', '$cordovaInAppBrowser', 'ENDPOINT_LIST', '$localStorage', '$ionicLoading', 'AuthService', '$http', '$firebaseAuth', '$cordovaOauth', 'ParentService', '$sce', '$compile', 'ProjectService',
        function($scope, $rootScope, $state, $stateParams, $ionicPopup, $ionicHistory, $cordovaInAppBrowser, ENDPOINT_LIST, $localStorage, $ionicLoading, AuthService, $http, $firebaseAuth, $cordovaOauth, ParentService, $sce, $compile, ProjectService) {
            $rootScope.content = '';
            $rootScope.showHomeSection = true;

            if (firebase.auth().currentUser != null){
                if (!$localStorage['checked']){
                    $rootScope.showLoader();
                    AuthService.checkIfEmailExists(firebase.auth().currentUser.email).then(
                        function(response){
                            //doesnt exist
                            // console.log(response);
                            $ionicLoading.hide();

                            $localStorage['checked'] = false;
                            AuthService.reset();
                        },
                        function(response){
                            //does exist
                            // console.log(response);
                            $ionicLoading.hide();
                            $localStorage['checked'] = true;
                        });
                }
            }

            $scope.loadInit = function() {

                $rootScope.showLoader();
                $http.get(location.origin + '/app/api/parent/dashboard?api_token='+encodeURIComponent($localStorage['uid']), {})
                    .then(function(response) {
                        $ionicLoading.hide();
                        $rootScope.content = $sce.trustAsHtml(response.data);
                        $rootScope.showHomeSection = false;

                        setTimeout(function() {
                            var $div = $('ion-tabs');
                            angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                $compile($div)(scope);
                                scope.$digest();
                            });
                        }, 200);

                        setTimeout(function() {
                            var $div = $('[ng-controller="notificationCtrl"]');
                            angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                $compile($div)(scope);
                                scope.$digest();
                            });

                            setTimeout(function() {
                                var $div = $('[ng-controller="choresCtrl"]');
                                angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                    var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                    $compile($div)(scope);
                                    scope.$digest();
                                });
                            }, 200);

                            setTimeout(function() {
                                var $div = $('[ng-controller="childrenCtrl"]');
                                angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                    var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                    $compile($div)(scope);
                                    scope.$digest();
                                });
                            }, 200);

                            setTimeout(function() {
                                var $div = $('[ng-init="initMap(\'googlemaps2\')"]');
                                angular.element($('[ng-controller="webCtrl"]')).injector().invoke(function($compile) {
                                    var scope = angular.element($('[ng-controller="webCtrl"]')).scope();
                                    $compile($div)(scope);
                                    scope.$digest();
                                });
                            }, 200);
                        }, 200);
                    });
            };


            $scope.initMap = function(identifer) {
                if ($rootScope.isParent()) {
                    if (typeof($localStorage['parent']['home']) == 'undefined' || $localStorage['parent']['home'] == null){
                        $scope.home = [0,0];
                    }else{
                        $scope.home = [$localStorage['parent']['home']['lat'], $localStorage['parent']['home']['lng']];
                    }
                } else {
                    $scope.home = [$localStorage['child']['home']['lat'], $localStorage['child']['home']['lng']];
                }
                $scope.home = [34.093762, -83.723869];
                var defaultPos = new google.maps.LatLng($scope.home[0], $scope.home[1]);

                var mapOptions = {
                    center: defaultPos,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    zoom: 16,
                    scrollwheel: false,
                    panControl: false,
                    zoomControl: false,
                    scaleControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    styles: $rootScope.mapStyle
                };

                setTimeout(function() {
                    var map = new google.maps.Map(document.getElementById(identifer), mapOptions);

                    var homeMarker = new google.maps.Marker({
                        position: defaultPos,
                        map: map,
                        icon: 'app/int-test/img/icons/home-marker.png',
                        animation: google.maps.Animation.DROP
                    });

                    $scope.map = map;
                    // navigator.geolocation.getCurrentPosition(function(pos) {
                    //     $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                    //     var GeoMarker = new GeolocationMarker($scope.map);
                    // });

                    var firebaseRef = firebase.database().ref().child('chore-locations');

                    // Create a GeoFire index
                    var geoFire = new GeoFire(firebaseRef);

                    geoQuery = geoFire.query({
                        center: [$scope.home[0], $scope.home[1]],
                        radius: 322
                    });

                    // geoQuery.updateCriteria({
                    //     center: [34.093762, -83.7238687],
                    //     radius: 322
                    // });

                    // window.g = geoQuery;

                    // geoQuery.on("ready", function() { });

                    // geoQuery.on("key_entered", function(key, location, distance) {
                    //     console.log('Key entered for chore');
                    //     ProjectService.getChoreById(key.replace('chore-', '')).then(
                    //         function(choreObject) {
                    //             if (choreObject.status != 'completed' && (choreObject.child_uid == 0 || choreObject.child_uid == $scope.uid) && choreObject.status != 'inactive'){
                    //                 if (
                    //                     location[0] != parseFloat($scope.home[0]) &&
                    //                     location[1] != parseFloat($scope.home[1]) &&
                    //                     (!$rootScope.isParent() || window.isBrowserMode)
                    //                 ) {
                    //                     var jobMarker = new google.maps.Marker({
                    //                         position: new google.maps.LatLng(location[0], location[1]),
                    //                         map: $scope.map,
                    //                         icon: 'img/icons/marker.png',
                    //                         animation: google.maps.Animation.DROP
                    //                     });
                    //                     $scope.markers[key] = jobMarker;
                    //                 }
                    //             }
                    //         });

                    // });

                    // geoQuery.on("key_exited", function(key, location, distance) {
                        
                    // });
            

                    // $scope.centerChanged = function() {
                    //     var center = $scope.map.getCenter().toJSON();

                    //     $scope.currentLocation.lat = center.lat;
                    //     $scope.currentLocation.lng = center.lng;

                    //     geoQuery.updateCriteria({
                    //         center: [$scope.currentLocation.lat, $scope.currentLocation.lng],
                    //         radius: $scope.currentLocation.radius
                    //     });
                    // };

                    // setTimeout(function(){
                    //     $scope.map.setCenter(new google.maps.LatLng(34.093762, -83.7238687));
                    // }, 200);

                }, 200);
            };

            $scope.multiActionActive = false;
            $scope.activateMultiAction = function(){
              $scope.multiActionActive = !$scope.multiActionActive;
            };
            $scope.multiActionActiveCheck = function(){
              if ($scope.multiActionActive){
                return 'active';
              }else{
                return 'inactive';
              }
            };

            
        }
    ]);
