// appControllers

//     .controller('addProjectCtrl', ['$scope', '$state', '$rootScope', 'ProjectService', 'ChildrenService', 'ionicDatePicker', 'ionicTimePicker', '$ionicLoading', 'WizardHandler',
//     function($scope, $state, $rootScope, ProjectService, ChildrenService, ionicDatePicker, ionicTimePicker, $ionicLoading, WizardHandler) {
//         $scope.project = {
//             id: 0,
//             type: 0,
//             member_id: '',
//             title: '',
//             photo: '',
//             date: '',
//             time: '',
//             timezone_offset: (new Date()).getTimezoneOffset() / 60,
//             price: 10,
//             description: '',
//             age_min: 10,
//             age_max: 13,
//             age_range: 9
//         };



//         // $scope.$watch('project.age_range', function(new_val, old_val){
//         //   if (new_val !== old_val){
//         //     if ($scope.project.age_range == 1){
//         //       $scope.project.age_min = 7;
//         //       $scope.project.age_max = 9;
//         //     }

//         //     if ($scope.project.age_range == 2){
//         //       $scope.project.age_min = 10;
//         //       $scope.project.age_max = 13;
//         //     }

//         //     if ($scope.project.age_range == 3){
//         //       $scope.project.age_min = 14;
//         //       $scope.project.age_max = 17;
//         //     }
//         //   }
//         // });


//         $scope.validate = function(stepNumber){
//           if (stepNumber == 1){
//             if ($scope.project.title == ''){
//               return false;
//             }

//             if ($scope.project.type == 1 && $scope.project.member_id == ''){
//               return false;
//             }

//             return true;
//           }else if (stepNumber == 2){
//             //No validation
//             return true;
//           }else if (stepNumber == 3){
//             if ($scope.project.date == '' || $scope.project.time == ''){
//               return false;
//             }

//             return true;
//           }else if (stepNumber == 4){
//             return true;
//           }
//         };

//         $scope.hasPhoto = function(){
//             if ($scope.project.photo != ''){
//                 return true;
//             }else{
//                 return false;
//             }
//         };

//         $scope.isActive = function(name){
//             if (name == 'public' && $scope.project.type == 0){
//                 return true;
//             }else if (name == 'invite' && $scope.project.type == 1){
//                 return true;
//             }else{
//                 return false;
//             }
//         };

//         $scope.isActiveClass = function(name){
//             if (name == 'public' && $scope.project.type == 0){
//                 return 'button-assertive';
//             }else if (name == 'invite' && $scope.project.type == 1){
//                 return 'button-assertive';
//             }else{
//                 return 'button-positive';
//             }
//         };

//         $scope.setActive = function(name){
//             if (name == 'public'){
//                 $scope.project.type = 0;
//             }else{
//                 $scope.project.type = 1;
//             }
//         };

//         $scope.popularItems = [];

//         $scope.getPopularItems = function(){
//             ProjectService.popularItems().then(function(items){
//                 $scope.popularItems = items;
//             },
//             function(error){
//                 console.error(error);
//             });
//         };

//         $scope.getPopularItems();

//         $scope.relatedItems = [];

//         $scope.getRelatedItems = function(){
//             ProjectService.relatedItems($scope.project.title).then(
//                 function(items){
//                     $scope.relatedItems = items;
//                 },
//                 function(error){
//                   alert(error);
//                     console.error(error);
//                 });
//         };

//         $scope.photoChanged = function(files){
//           var reader  = new FileReader();

//           reader.addEventListener("load", function () {
//             var base64Result = reader.result;
//             // console.log(base64Result);
//             $scope.$apply(function(){
//               $scope.pickPhoto(base64Result);
//             });
//           }, false);

//           if (files[0]) {
//             reader.readAsDataURL(files[0]);
//           }
//         }

//         $scope.pickPhoto = function(url){
//           if (typeof(url) != 'undefined'){
//             $scope.project.photo = url;
//           }else{
//             if (window.isBrowserMode || !window.cordova){
//                 //pick photo
//                 $("#project_photo").click();
//             }else{
//                 //cordova photo picker
//                 window.imagePicker.getPictures(
//                     function(results) {
//                         for (var i = 0; i < results.length; i++) {
//                           $scope.$apply(function(){
//                             $scope.project.photo = results[i];
//                           });
//                         }
//                     }, function (error) {
//                         //console.log('Error: ' + error);
//                     }, {
//                         maximumImagesCount: 1,
//                         width: 800
//                     }
//                 );
//             }
//           }
//         };

//         $scope.selectPhoto = function(photoUrl){
//             $scope.project.photo = photoUrl;
//         };

//         $scope.clearPhoto = function(){
//             $scope.project.photo = '';
//         };

//         $scope.tmp = {
//             file: ''
//         };

//         $scope.fileUploaded = function(files){
//             //console.log(files);
//         };

//         $scope.pickTime = function(){
//           var ipObj1 = {
//             callback: function (val) {      //Mandatory
//               if (typeof (val) === 'undefined') {
//                 //console.log('Time not selected');
//               } else {
//                 var selectedTime = new Date(val*1000);
//                 $scope.project.time = $rootScope.millisToUTCDate(selectedTime.getTime());
//                 //console.log($scope.project.time);
//               }
//             },
//             format: 12,         //Optional
//             step: 1,           //Optional
//             setLabel: 'Set'    //Optional
//           };

//           ionicTimePicker.openTimePicker(ipObj1);
//         };

//         $scope.addProject = function(){
//           if (window.cordova){
//             cordova.plugins.Keyboard.close();
//           }
          
//           $scope.project.date = new Date($scope.project.date.getFullYear(), $scope.project.date.getMonth(), $scope.project.date.getDate(), $scope.project.time.getHours(), $scope.project.time.getMinutes(), $scope.project.time.getSeconds(), $scope.project.time.getMilliseconds()).getTime() / 1000;
          
//           $rootScope.showLoader();
//           ProjectService.createProject($scope.project).then(
//             function(projectObject){
//               $ionicLoading.hide();
//               if ($scope.project.id == 0){
//                 var tag = 'created';
//               }else{
//                 var tag = 'updated';
//               }
//               $rootScope.showPopup('Project ' + tag, 'Your project has been ' + tag + '.', '').then(
//                 function(){
//                   $rootScope.modal.hide();
//                 });
//             },
//             function(error){
//               console.error(error);
//               $ionicLoading.hide();
//               if ($scope.project.id == 0){
//                 var tag = 'create';
//               }else{
//                 var tag = 'update';
//               }
//               $rootScope.showPopup('Unable to ' + tag + ' project', 'This could be related to a system error, please try again later.', 'error').then(
//                 function(){

//                 });
//             }
//           );
//         };

//         $scope.getDateTest = function(){
//           $rootScope.getDateFromCalendarModal($scope, true, new Date(), new Date(), new Date((new Date()).getFullYear(), ((new Date()).getMonth()+1), (new Date()).getDay()), function(date){
//             $scope.project.date = date;
//             $scope.date = date;
//           });
//         };

//         $scope.formValidSubmit = function(form, index){

//           if (form.$valid){
//             if (index == 1){
//               if ($scope.project.type == 1 && $scope.project.member_id != ''){
//                 ChildrenService.childExists($scope.project.member_id).then(
//                   function(){
//                     //exists 
//                     $scope.getRelatedItems();
//                     WizardHandler.wizard().goTo('photo');
//                   },
//                   function(){
//                     //doesnt exist
//                     $rootScope.showPopup('Invalid child', 'Enter a valid child id and try again.', 'error').then(
//                       function(){
//                         $scope.project.member_id = '';
//                       });
//                   });
//               }else{
//                 $scope.getRelatedItems();
//                 WizardHandler.wizard().goTo('photo');
//               }
//             }else if (index == 2){
//               WizardHandler.wizard().goTo('schedule');
//             }else if (index == 3){
//               WizardHandler.wizard().goTo('payment');
//             }else{
//               WizardHandler.wizard().finish();
//             }
//           }
//         };

//         $scope.scanCard = function(){
//           if (typeof(window.cordova) != 'undefined' && !window.isBrowserMode){
//             cordova.plugins.barcodeScanner.scan(
//               function (result) {
//                   console.log('result: ' + JSON.stringify(result));
//                   $scope.$apply(function(){
//                     $scope.project.member_id = result.text;
//                   });
//               },
//               function (error) {
//                   alert("Scanning failed: " + error);
//               },
//               {
//                   preferFrontCamera : false, // iOS and Android
//                   showFlipCameraButton : false, // iOS and Android
//                   showTorchButton : true, // iOS and Android
//                   torchOn: true, // Android, launch with the torch switched on (if available)
//                   prompt : "Place a barcode inside the scan area", // Android
//                   resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
//                   formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
//                   orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
//                   disableAnimations : false, // iOS
//                   disableSuccessBeep: false // iOS
//               }
//            );
//           }
//         };

//         $scope.loadExistingProject = function(){
//           if (typeof($rootScope.projectId) != 'undefined' && $rootScope.projectId != 0){
//             $scope.project.id = $rootScope.projectId;
//             ProjectService.getChoreById($scope.project.id).then(
//               function(choreObject){
//                 if (choreObject.child_uid != 0 && choreObject.projectType == 1){
//                   $scope.project.member_id = choreObject.child_uid;
//                 }

//                 $scope.project.type = choreObject.projectType;
//                 $scope.project.title = choreObject.name;
//                 $scope.project.description = choreObject.description;
//                 $scope.project.photo = choreObject.photos;
//                 $scope.project.price = choreObject.pointValuation;
//                 $scope.project.age_range = choreObject.age_range;
//                 $scope.project.date = new Date(choreObject.start_date*1000);
//                 $scope.project.time = new Date(choreObject.start_date*1000);

//               });
//           }else{
//             $scope.project = {
//                 id: 0,
//                 type: 0,
//                 member_id: '',
//                 title: '',
//                 photo: '',
//                 date: '',
//                 time: '',
//                 timezone_offset: (new Date()).getTimezoneOffset() / 60,
//                 price: 10,
//                 description: '',
//                 age_min: 10,
//                 age_max: 13,
//                 age_range: 9
//             };
//           }
//         };

//         $scope.selectPreset = function(object){
//           $scope.project.title = object.title;
//           $scope.project.photo = object.image;
//           $scope.project.price = object.price;
//           $scope.project.age_range = object.minimum_age;
//           WizardHandler.wizard().goTo('schedule');
//         };

//         $scope.skipPhoto = function(){
//           $scope.project.photo = '';
//         };
//     }
// ]);


appControllers.controller('addProjectCtrl', function($scope, $q, $rootScope, $localStorage, ProjectService, $ionicLoading, $cordovaImagePicker){
  $scope.project = {
      id: 0,
      type: 0,
      member_id: '',
      title: '',
      photos: '',
      date: '',
      time: '',
      timezone_offset: (new Date()).getTimezoneOffset() / 60,
      price: 10,
      description: '',
      age_min: 10,
      age_max: 13,
      age_range: 9,
      addressObject: {
        address: '',
        address_2: '',
        city: '',
        state: '',
        zip: ''
      }
  };

  $scope.isBrowserMode = window.isBrowserMode;

  // if (!window.isBrowserMode){
    // $scope.$watch(function(){ return $scope.project.date; }, function(new_val, old_val){
    //   if (new_val !== old_val){
    //     if (typeof(new_val) == 'object'){
    //       $scope.project.date = (moment(($scope.project.date).getTime()).format("M/D/YYYY"));
    //     }
    //   }
    // });
  // }

  $scope.submitBtn = 'Add Project';

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

  $scope.scanCard = function(){
    if (window.cordova){
      window.cordova.plugins.Keyboard.close();
    }
    setTimeout(function(){
      if (typeof(window.cordova) != 'undefined' && !window.isBrowserMode){
        cordova.plugins.barcodeScanner.scan(
          function (result) {
              console.log('result: ' + JSON.stringify(result));
              $scope.$apply(function(){
                $scope.project.member_id = result.text;
              });
          },
          function (error) {
              //alert("Scanning failed: " + error);
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
    }, 200);
  };

  $scope.countryCode = 'US';

  $scope.onAddressSelection = function (location) {
    $scope.project.addressObject.address = location.name;

    for (var i = 0; i < location.address_components.length; i++) {
      var component = location.address_components[i];

      if (component.types[0] == 'locality'){
        $scope.project.addressObject.city = component.long_name;
      }

      if (component.types[0] == 'administrative_area_level_1'){
        $scope.project.addressObject.state = component.short_name;
      }

      if (component.types[0] == 'postal_code'){
        $scope.project.addressObject.zip = component.short_name;
      }
    }
      // $scope.params.address = location.formatted_address;
  };

  $scope.payment_method = {
    name: 'John Doe',
    card: '5555555555554444',
    ccv: '123',
    exp: '01/2020'
  };

  $scope.addProject = function() {
      if (window.cordova) {
          cordova.plugins.Keyboard.close();
      }
      $rootScope.showLoader();

      if ($scope.project.id == 0){
        if (typeof($scope.project.date) == 'string'){
          $scope.project.date = new Date($scope.project.date);
        }
        if (typeof($scope.project.time) == 'string'){
          $scope.project.time = new Date($scope.project.time);
        }
        $scope.project.date = new Date($scope.project.date.getFullYear(), $scope.project.date.getMonth(), $scope.project.date.getDate(), $scope.project.time.getHours(), $scope.project.time.getMinutes(), $scope.project.time.getSeconds(), $scope.project.time.getMilliseconds()).getTime() / 1000;
        ProjectService.createProject($scope.project, $scope.payment_method).then(
            function(projectObject) {
                $ionicLoading.hide();
                $rootScope.showPopup('Project Created', 'Your project has been created.', '').then(
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
      }else{
        if (typeof($scope.project.date) == 'string'){
          $scope.project.date = new Date($scope.project.date);
        }
        if (typeof($scope.project.time) == 'string'){
          $scope.project.time = new Date($scope.project.time);
        }
        $scope.project.date = new Date($scope.project.date.getFullYear(), $scope.project.date.getMonth(), $scope.project.date.getDate(), $scope.project.time.getHours(), $scope.project.time.getMinutes(), $scope.project.time.getSeconds(), $scope.project.time.getMilliseconds()).getTime() / 1000;
        ProjectService.createProject($scope.project, $scope.payment_method).then(
            function(projectObject) {
                $ionicLoading.hide();
                $rootScope.showPopup('Project Updated', 'Your project has been updated.', '').then(
                    function() {
                        $rootScope.modal.hide();
                    });
            },
            function(error) {
                $ionicLoading.hide();
                $rootScope.showPopup('Unable to update project', 'This could be related to a system error, please try again later.', 'error').then(
                    function() {

                    });
            }
        );
      }
      // },
      // function(){
      //   $rootScope.showPopup('Username taken', 'This username is already inuse, please pick another one and try again.', 'error');
      // });
  };

  $scope.getBase64FromImageUrl = function(url) {
    var defer = $q.defer();
    var img = new Image();

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width =this.width;
        canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        defer.resolve(dataURL);
    };

    img.src = url;

    return defer.promise;
  }


  $scope.uploadPhoto = function(){
    // window.imagePicker.getPictures(
    //     function(results) {
    //         for (var i = 0; i < results.length; i++) {
    //           $scope.$apply(function(){
    //             console.log(results[i]);
    //             $scope.project.photos = results[i];
    //             projectForm._nextField();
    //           });
    //         }
    //     }, function (error) {
    //         console.log('Error: ' + error);
    //     }, {
    //         maximumImagesCount: 1,
    //         width: 800
    //     }
    // );

    var cameraOptions = { quality: 100,
    destinationType: navigator.camera.DestinationType.FILE_URI,
    sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
    targetWidth: 600,
    targetHeight: 600,
    encodingType: Camera.EncodingType.JPEG};

    navigator.camera.getPicture(function (imageURI) {

       window.resolveLocalFileSystemURL(imageURI, function success(fileEntry) {
                console.log("got file: " + fileEntry.fullPath);
                console.log('cdvfile URI: ' + fileEntry.toInternalURL());
                $scope.getBase64FromImageUrl(fileEntry.toInternalURL()).then(function(imageUrl){
                  console.log(imageUrl);
                  $scope.project.photos = imageUrl;
                  console.log($scope.project);
                });
            });
      

    }, function(err) {
      console.log(JSON.stringify(err));
    }, cameraOptions);
    
  };

  $scope.pickPhoto = function(src){
    $scope.project.photos = src;
    projectForm._nextField();
  };

  $scope.relatedItems = [];

  $scope.getRelatedItems = function(){
      ProjectService.relatedItems($scope.project.title).then(
          function(items){
            console.log(items);
              $scope.relatedItems = items;
          },
          function(error){
            alert(error);
              console.error(error);
          });
  };

  // $scope.$watch('project.photos', function(new_val, old_val){
  //   if (new_val != old_val){
  //     console.log('called');
  //     if ($scope.project.photos != ''){
  //       // $scope.getRelatedItems();
  //     }
  //   }
  // });

  setTimeout(function(){
    // $(".modal-backdrop .hide").remove();
      if (document.getElementsByClassName('fs-form-wrap').length >= 2){
        var formWrap = document.getElementsByClassName('fs-form-wrap')[1];
      }else{
        var formWrap = document.getElementById( 'fs-form-wrap' );
      }

      [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {  
        new SelectFx( el, {
          stickyPlaceholder: false,
          onChange: function(val){
            document.querySelector('span.cs-placeholder').style.backgroundColor = val;
          }
        });
      } );

      window.projectForm = new FForm( formWrap, {} ); 

      if (typeof($rootScope.projectId) != 'undefined'){
        // ChildrenService.getChildById($rootScope.childId).then(function(child){
        //   console.log(child);
        // }, function(error){
        //   console.error(error);
        // });
        ProjectService.getChoreById($rootScope.projectId).then(function(project){
          if (typeof($rootScope.duplicateProjectId) != 'undefined' && $rootScope.duplicateProjectId == $rootScope.projectId){
            $scope.submitBtn = 'Create Project';
            project.start_date = '';
            project.start_time = '';
            project.id = 0;
            project.child_uid = '';
          
          }else{
            $scope.submitBtn = 'Update Project';
            project.start_date = $rootScope.showLocalizedDate(project.start_date*1, project.timezone);
            project.start_time = project.start_date;
            console.log(project);
          }

          var _address = JSON.parse(project.address).address;
          $scope.data = {
            location: {
              formatted_address: ''
            }
          };
          $scope.data.location.formatted_address = _address.address;
          console.log($scope.data);
          $scope.project = {
              id: project.id,
              type: project.projectType,
              member_id: project.child_uid,
              title: project.name,
              photos: project.photos,
              date: project.start_date,
              time: project.start_time,
              timezone_offset: (new Date()).getTimezoneOffset() / 60,
              price: project.pointValuation,
              description: project.description,
              age_range: project.minimum_age,
              addressObject: {
                address: _address.address,
                address_2: _address.address_2,
                city: _address.city,
                state: _address.state,
                zip: _address.zip
              }
          };
          setTimeout(function(){
            projectForm._nextField(4, true);
          }, 200);
        });
      }

  }, 500);

  $scope.checkIfValid = function(){
    // console.log($scope.project);
    if ($scope.project.title == '' || typeof($scope.project.title) == 'undefined'){
      return true;
    }

    if ($scope.project.date == '' || typeof($scope.project.date) == 'undefined'){
      return true;
    }

    if ($scope.project.time == '' || typeof($scope.project.time) == 'undefined'){
      return true;
    }

    if ($scope.project.price == '' || typeof($scope.project.price) == 'undefined'){
      return true;
    }

    if ($scope.project.addressObject.address == '' || typeof($scope.project.addressObject.address) == 'undefined'){
      return true;
    }
    
    if (!moment((moment(($scope.project.date).getTime()).format("M/D/YYYY")) + ' ' + (moment(($scope.project.time).getTime()).format("h:mm A"))).isAfter(new Date())){
      return true;
    }

    return false;
  };
});