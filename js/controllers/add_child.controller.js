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

appControllers.controller('addChildCtrl', function($scope, $state, $rootScope, ChildService, ChildrenService, ParentService, ionicDatePicker, $ionicLoading, $localStorage){
  $scope.child = {
    id: 0,
    gender: 0,
    name: '',
    email: '',
    username: '',
    phone: '',
    pin: '',
    birthdate: moment((new Date("Jan 1, 2009"))).format("MMM D, YYYY")
  };

  $scope.isBrowserMode = window.isBrowserMode;

  $scope.submitBtn = 'Add Child';

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
        console.log(val);
        $scope.child.birthdate = val;
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
      $scope.child.birthdate = (date.getMonth()+1) + '/' + (date.getDate()) + '/' + (date.getFullYear());;
    });
  };

  $scope.addChild = function() {
      if (window.cordova) {
          cordova.plugins.Keyboard.close();
      }
      $rootScope.showLoader();

      console.log($scope.child);

      $scope.child.username = $scope.child.username.toLowerCase();

      // ChildrenService.childExistsByName($scope.child.username).then(
      //   function(){
      if ($scope.child.id == 0){
        $scope.child.birthdate = new Date($scope.child.birthdate);
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
      }else{
        $scope.child.birthdate = new Date($scope.child.birthdate);
        ChildService.updateChild($scope.child).then(
            function(projectObject) {
                $ionicLoading.hide();
                $rootScope.showPopup('Child Updated', 'Your child has been updated.', '').then(
                    function() {
                        $rootScope.modal.hide();
                    });
            },
            function(error) {
                $ionicLoading.hide();
                $rootScope.showPopup('Unable to update child', 'This could be related to a system error, please try again later.', 'error').then(
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

      window.childForm = new FForm( formWrap, {} ); 

      if (typeof($rootScope.childId) != 'undefined'){
        // ChildrenService.getChildById($rootScope.childId).then(function(child){
        //   console.log(child);
        // }, function(error){
        //   console.error(error);
        // });
        ChildrenService.getChildFromParent($localStorage['uid'], $rootScope.childId).then(function(children){
          $scope.submitBtn = 'Update Child';
          if (children.gender == 1){
            children.gender = 0;
          }else if (children.gender == 2){
            children.gender = 1;
          }
          children.dob = new Date(children.dob);
          $scope.child = {
            id: children.$id,
            gender: children.gender,
            name: children.name,
            email: children.email,
            username: children.username,
            phone: children.phone,
            pin: children.pin,
            birthdate: children.dob
          };
          setTimeout(function(){
            childForm._nextField(4, true);
          }, 200);
        });
      }

  }, 500);

    $scope.checkIfValid = function(){
    if ($scope.child.name == '' || typeof($scope.child.name) == 'undefined'){
      return true;
    }

    if ($scope.child.username == '' || typeof($scope.child.username) == 'undefined'){
      return true;
    }

    if ($scope.child.phone == '' || typeof($scope.child.phone) == 'undefined'){
      return true;
    }

    if ($scope.child.pin == '' || typeof($scope.child.pin) == 'undefined'){
      return true;
    }

    var amountOfYears = moment(new Date($scope.child.birthdate)).fromNow(true).replace(' years','');
      
    if (moment(new Date($scope.child.birthdate)).isAfter(new Date())){
      return true;
    }

    if (amountOfYears.indexOf('hours') >= 0){
      return true;
    }

    if (!(parseInt(amountOfYears) >= 7 && parseInt(amountOfYears) <= 17)){
      return true;
    }

    return false;
  };
});
