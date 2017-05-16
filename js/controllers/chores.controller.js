appControllers.controller('choresCtrl', function($scope, $rootScope, uiGmapGoogleMapApi, ChildService, ProjectService, $localStorage, $ionicPopup, $ionicLoading, iosActionSheet) {
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

        // navigator.geolocation.getCurrentPosition(function(pos) {
            // $scope.$apply(function() {
                var pos = {
                    coords: {
                        latitude: 32.52134195160539,
                        longitude: -82.705078125
                    }
                }
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
                    radius: 9999
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

                                            for (var i = 0; i < $scope.applications.length; i++) {
                                                if ($scope.applications[i].project_id == choreObject.$id){
                                                    choreObject.status = 'applied';
                                                }
                                            }

                                            // choreObject.status.$watch

                                            var _date = $rootScope.showLocalizedDate(choreObject.start_date * 1, choreObject.timezone);
                                            if (!moment(_date).isAfter(new Date())){
                                                choreObject.status = 'expired';
                                            }
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
            // });
        // });

        $scope.$watch('map.center', function(new_val, old_val) {
            if (new_val !== old_val) {
                // setTimeout(function(){
                $scope.geoQuery.updateCriteria({
                    center: [$scope.map.center.latitude, $scope.map.center.longitude],
                    radius: 9999
                });
                // }, 5000);
            }
        });


    } else {
        ProjectService.getUserChores($localStorage['uid']).then(
            function(chores) {
                for (var i = 0; i < chores.length; i++) {
                    var _date = $rootScope.showLocalizedDate(chores[i].start_date * 1, chores[i].timezone);
                    if (!moment(_date).isAfter(new Date())){
                        chores[i].status = 'inactive';
                    }
                }
                $scope.myprojects = chores;

                if ($scope.myprojects.length == 0) {
                    $scope.projectsLoaded = 'empty';
                    $scope.myprojects = [];
                } else {
                    $scope.projectsLoaded = 'not-empty';
                }
            });
    }

    $scope.viewProject = function(projectId, status) {
        if ($rootScope.isParent()) {
            if (window.isBrowserMode || !window.cordova) {
                //manage action sheet
                var options = [];
                options = options.concat({
                    text: 'Manage Project',
                    label: true
                });

                if (status == 'inactive' || status == 'completed'){
                    options = options.concat({
                        text: 'View Project Details',
                        onClick: function(){
                            $rootScope.showProjectViewModal(projectId);
                        }
                    });
                    options = options.concat({
                        text: 'Duplicate Project',
                        onClick: function(){
                            $rootScope.showEditProjectModal(projectId, true);
                        }
                    });
                }else{
                    options = options.concat({
                        text: 'View Project Details',
                        onClick: function(){
                            $rootScope.showProjectViewModal(projectId);
                        }
                    });
                    options = options.concat({
                        text: 'Edit Project',
                        onClick: function(){
                            $rootScope.showEditProjectModal(projectId);
                        }
                    });
                    options = options.concat({
                        text: 'Duplicate Project',
                        onClick: function(){
                            $rootScope.showEditProjectModal(projectId, true);
                        }
                    });
                    if (status != 'inactive' && status != 'completed'){
                        options = options.concat({
                            text: 'Cancel Project',
                            color: true,
                            onClick: function(){
                                var confirmPopup = $ionicPopup.confirm({
                                    title: 'Cancel Project?',
                                    template: 'Are you sure you want to cancel this project? This can not be undone.'
                                });

                                confirmPopup.then(function(res) {
                                    if (res) {
                                        $rootScope.showLoader();
                                        //delete project
                                        ProjectService.deleteProject(projectId).then(
                                            function() {
                                                $ionicLoading.hide();
                                                $rootScope.showPopup('Project deleted', 'This project has been deleted.');
                                            },
                                            function() {
                                                $ionicLoading.hide();
                                                $rootScope.showPopup('Unable to delete project', 'We were unable to delete this project. This could be related to a system error, please try again later.', 'error');
                                            });
                                    }
                                });
                            }
                        });
                    }
                }

                options = options.concat({
                    text: 'Cancel',
                    bold: true
                });

                iosActionSheet(options).then(function(data){
                    $scope.output = data;
                  }, function(){
                    $scope.output = 'rejected';
                  });
            } else {
            	console.log(status);
            	if (status == 'inactive' || status == 'completed'){
            		var buttonLabels = ['View Project Details', 'Duplicate Project'];
            		var destructiveButtonLast = false;
            	}else{
            		var buttonLabels = [ 'View Project Details', 'Edit Project', 'Duplicate Project'];
            		var destructiveButtonLast = true;
            	}
                var options = {
                    androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT, // material
                    buttonLabels: buttonLabels,
                    addCancelButtonWithLabel: 'Cancel',
                    androidEnableCancelButton: true,
                    winphoneEnableCancelButton: true
                };

                if (status != 'inactive' && status != 'completed'){
                    options['addDestructiveButtonWithLabel'] = 'Cancel Project';
                    options['destructiveButtonLast'] = true; // you can choose where the destructive button is shown
                }
                window.plugins.actionsheet.show(options, function(buttonIndex) {
                	console.log(buttonIndex);
                	console.log(status);
                	if (buttonLabels[buttonIndex-1] == 'Edit Project') {
                        //edit
                        $rootScope.showEditProjectModal(projectId);
                    } else if (buttonLabels[buttonIndex-1] == 'Duplicate Project'){
                    	console.log('duplicate');
                    	$rootScope.showEditProjectModal(projectId, true);
                    } else if (buttonIndex - 1 == 0){
                    	$rootScope.showProjectViewModal(projectId);
                    } else if (buttonIndex - 1 == 3 && status != 'inactive' && status != 'completed') {
                        //delete
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Cancel Project?',
                            template: 'Are you sure you want to cancel this project? This can not be undone.'
                        });

                        confirmPopup.then(function(res) {
                            if (res) {
                                $rootScope.showLoader();
                                //delete project
                                ProjectService.deleteProject(projectId).then(
                                    function() {
                                        $ionicLoading.hide();
                                        $rootScope.showPopup('Project deleted', 'This project has been deleted.');
                                    },
                                    function() {
                                        $ionicLoading.hide();
                                        $rootScope.showPopup('Unable to delete project', 'We were unable to delete this project. This could be related to a system error, please try again later.', 'error');
                                    });
                            }
                        });
                    } else {
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
        } else {
            if (status != 'accepted'){
                $rootScope.showProjectViewModal(projectId);
            }else{
                if (window.isBrowserMode){
                    var options = [];
                    options = options.concat({
                        text: 'Manage Project',
                        label: true
                    });

                    options = options.concat({
                        text: 'View Project Details',
                        onClick: function(){
                            $rootScope.showProjectViewModal(projectId);
                        }
                    });

                    if (status != 'inactive' && status != 'completed'){
                        options = options.concat({
                            text: 'Quit Project',
                            color: true,
                            onClick: function(){
                                ChildService.quitProject(projectId).then(function(){
                                    console.log('project quit');
                                });
                            }
                        });
                    }

                    options.concat({
                        text: 'Cancel'
                    });

                    iosActionSheet(options).then(function(data){
                        
                      }, function(){
                        
                      });
                }else{
                    console.log(projectId);
                    // $rootScope.showProjectViewModal(projectId);
                    var buttonLabels = ['View Project Details'];
                    var destructiveButtonLast = true;
                    
                    var options = {
                        androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT, // material
                        buttonLabels: buttonLabels,
                        addCancelButtonWithLabel: 'Cancel',
                        androidEnableCancelButton: true,
                        winphoneEnableCancelButton: true
                    };

                    if (status != 'inactive' && status != 'completed'){
                        options['addDestructiveButtonWithLabel'] = 'Quit Project';
                        options['destructiveButtonLast'] = true; // you can choose where the destructive button is shown
                    }
                    window.plugins.actionsheet.show(options, function(buttonIndex) {
                        console.log(buttonIndex);
                        console.log(status);
                        if (buttonLabels[buttonIndex-1] == 'View Project Details') {
                            //edit
                            $rootScope.showProjectViewModal(projectId);
                        }else{
                            ChildService.quitProject(projectId).then(function(){
                                console.log('project quit');
                            });
                        }
                    });
                }
            }
        }
    };

    $scope.hasMap = function() {
        if (!$rootScope.isParent()) {
            return 'hasMap';
        }
    };

});