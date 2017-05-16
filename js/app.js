var config = {
    apiKey: "AIzaSyBhxSeZh75dG3_3fuIdXzivdbU_ue2NC9g",
    authDomain: "kidzbiz101-9e406.firebaseapp.com",
    databaseURL: "https://kidzbiz101-9e406.firebaseio.com",
    storageBucket: "kidzbiz101-9e406.appspot.com",
    messagingSenderId: "339595614369"
};
firebase.initializeApp(config);

angular.module('kb', ['ionic', 'ngIOS9UIWebViewPatch', 'kb.controllers', 'ngMessages', 'ngCordova', 'kb.constant', 'ionic.rating', 'firebase', 'ngCordovaOauth', 'ngStorage', 'mgo-angular-wizard', 'ionic-datepicker', 'ionic-timepicker', 'ngAnimate', 'onezone-datepicker', 'ui.mask', 'uiGmapgoogle-maps', "ion-datetime-picker", '720kb.datepicker', 'angular-ios-actionsheet'])
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

        // if (!window.isBrowserMode){
            if (storage.first_run) {
                $localStorage['first_run'] = false;
                $state.go('intro');
            }else{
              $state.go('login');
            }
        // }

        window.addEventListener('native.keyboardshow', keyboardShowHandler);

        function keyboardShowHandler(e){
            //alert('Keyboard height is: ' + e.keyboardHeight);
            console.log('keyboard showing');
            // cordova.plugins.Keyboard.disableScroll(false);
            document.body.classList.add('keyboard-open');
        }

        window.addEventListener('native.keyboardhide', keyboardHideHandler);

        function keyboardHideHandler(e){
            //alert('Goodnight, sweet prince');
            // cordova.plugins.Keyboard.disableScroll(true);
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

                // $rootScope.showNoConnectionDialog();
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

        $rootScope.showEarnedModal = function(title, message) {
            // $ionicModal.fromTemplateUrl('templates/dashboard/helpme.html', {
            $ionicModal.fromTemplateUrl('templates/dashboard/earned-modal.html', {
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
            // if (window.isBrowserMode){
            //     $ionicModal.fromTemplateUrl('http://kidzforce.com/api/public/templates/project/view-project-modal.html', {
            //         scope: $rootScope,
            //         animation: 'slide-in-up'
            //     }).then(function(modal){
            //         $rootScope.projectViewModal = modal;
            //         $rootScope.projectViewModal.show();
            //     });
            // }else{
                $ionicModal.fromTemplateUrl('templates/project/view-project-modal.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function(modal){
                    $rootScope.projectViewModal = modal;
                    $rootScope.projectViewModal.show();
                });
            // } 
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
            // if (!window.isBrowserMode){
                setTimeout(function(){
                    $state.go('login');
                }, 200);
            // }else{
                // firebase.auth().signOut().then(function(){ 
                    // firebase.auth().currentUser = null;
                    // $rootScope.loggedIn = false;
                // });
            // }
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
                        $rootScope.showLoader();
                        $rootScope.projectId = undefined;
                        $rootScope.duplicateProjectId = undefined;
                        $ionicModal.fromTemplateUrl('templates/addproject.html', {
                            scope: $rootScope,
                            animation: 'slide-in-up'
                        }).then(function(modal) {
                            $rootScope.modal = modal;
                            $rootScope.modal.show();
                        });
                        $ionicLoading.hide();
                    }


                    $ionicLoading.hide();
                },
                function(error){
                    console.error(error);
                });
        };

        $rootScope.showEditProjectModal = function(projectId, duplicate){
            $rootScope.showLoader();
            $rootScope.projectId = projectId;
            if (duplicate){
                $rootScope.duplicateProjectId = projectId;
            }else{
                $rootScope.duplicateProjectId = undefined;
            }
            $ionicModal.fromTemplateUrl('templates/addproject.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
            $ionicLoading.hide();
        };

        $rootScope.showAddChildModal = function(childId) {
            $rootScope.showLoader();
            $rootScope.childId = childId;
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

        $rootScope.$on('modal.hidden', function() {
            // Execute action
            if ($rootScope.verifyIdentityModal == undefined){
                $rootScope.modal.remove();
            }
        });

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
            

                console.log("KEYBOARD: Now load keyboard plugin...");
                console.log("KEYBOARD: Keyboard plugin: " + window.cordova.plugins.Keyboard);
                console.log("KEYBOARD: And cordova keyboard: " + cordova.plugins.Keyboard);

                if (window.cordova && window.cordova.plugins.Keyboard) {
                    console.log("KEYBOARD:The keyboard plugin is here so use it");
                    // cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);
                }

                console.log("KEYBOARD: Loaded keyboard plugin...");
                if (window.StatusBar) {
                    StatusBar.styleLightContent();
                    StatusBar.overlaysWebView(false);
                }
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
          // if (window.isBrowserMode){
          //   return true;
          // }

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

        $rootScope.build = '1.5.1';
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
    if (ionic.Platform.isAndroid()){
        $ionicConfigProvider.scrolling.jsScrolling(false);
    }
    $ionicConfigProvider.views.maxCache(2);
    $ionicConfigProvider.views.forwardCache(true);

    // uiMaskConfigProvider.maskDefinitions({'A': /[a-z]/, '*': /[a-zA-Z0-9]/});
    // uiMaskConfigProvider.clearOnBlur(false);
    // uiMaskConfigProvider.eventsToHandle(['input', 'keyup', 'click']);


    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBCZvV8YTD4AyESm5IG-S0phuwzAKe0fmA',
        libraries: 'places'
    });


    // if (!window.isBrowserMode){
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
          .state('app.parent-earned', {
              url: "/parent/earned",
              views: {
                  'menuContent': {
                      templateUrl: "templates/dashboard/earned-modal.html"
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

    // }

});
