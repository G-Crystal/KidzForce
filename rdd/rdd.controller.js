appControllers
    .controller('rooDailyDropController', ['$scope', '$rootScope', '$q', 'ChildService', '$localStorage',
        function($scope, $rootScope, $q, ChildService, $localStorage) {

            function qlinqoPlayAreaClicked(pos) {
                //console.log('canvas clicked ('+ pos.x +','+ pos.y +')');

                //add a play piece to the playfield
                Qlinqo.newGamePiece(pos.x, pos.y);
            }

            function qlinqoGameOverClicked(pos) {
                if (Qlinqo.ballsScored == 1) {
                    FW.StopRandomBlasts();
                    Qlinqo.gameOverLayer.children[0].fadeAway();
                    Qlinqo.startOver();
                }
            }

            $scope.setupQlinqo = function() {
            	var defer = $q.defer();
                //stats.js
                //https://github.com/mrdoob/stats.js
                if (Qlinqo.addStats) {
                    document.stats = new Stats();

                    // Align top-left
                    document.stats.getDomElement().style.position = 'absolute';
                    document.stats.getDomElement().style.left = '0px';
                    document.stats.getDomElement().style.top = '0px';

                    document.body.appendChild(document.stats.getDomElement());
                }

                document.StratiscapeDraw = new Stratiscape({
                    'containerId': 'canvasContainer',
                    'layers': [{
                            'name': 'canvasQlinqoBackground',
                            x: 0,
                            y: 0,
                            width: $("body").width()*1.5,
                            height: $("body").height()*1.7,
                            'zIndex': 1,
                            'backgroundColor': 'black'
                        }, {
                            'name': 'canvasQlinqoPlayfield',
                            x: 0,
                            y: 200,
                            width: 652,
                            height: 660,
                            'zIndex': 2
                        }, {
                            'name': 'canvasQlinqoMouseHit',
                            x: 0,
                            y: 200,
                            width: 652,
                            height: 80,
                            'zIndex': 3,
                            'clickCallback': qlinqoPlayAreaClicked,
                            'mouseHitId': 'canvasMouseHitDetector'
                        }, {
                            'name': 'canvasQlinqoForeground',
                            x: 0,
                            y: 200,
                            width: 652,
                            height: 660,
                            'zIndex': 4
                        }, {
                            'name': 'canvasQlinqoBox2dDebug',
                            x: 0,
                            y: 200,
                            width: 652,
                            height: 660,
                            'zIndex': 5
                        }, {
                            'name': 'canvasQlinqoStatus',
                            x: 0,
                            y: 200,
                            width: 652,
                            height: 660,
                            'zIndex': 6
                        },
                        // {'name':'canvasQlinqoGameOver', x:180, y:240, width:120, height:160,'zIndex':7, 'clickCallback':qlinqoGameOverClicked, 'mouseHitId':'canvasGameOverHitDetector'},
                        {
                            'name': 'canvasFWForeground',
                            x: 0,
                            y: 200,
                            width: 652,
                            height: 660,
                            'zIndex': 8
                        }
                    ]
                });
                if (document.StratiscapeDraw.canvasSupported) {
                    var playfieldLayer = document.StratiscapeDraw.getLayer('canvasQlinqoPlayfield');
                    var foregroundLayer = document.StratiscapeDraw.getLayer('canvasQlinqoForeground');
                    var backgroundLayer = document.StratiscapeDraw.getLayer('canvasQlinqoBackground');
                    var debugLayer = document.StratiscapeDraw.getLayer('canvasQlinqoBox2dDebug');
                    var statusLayer = document.StratiscapeDraw.getLayer('canvasQlinqoStatus');
                    var gameOverLayer = document.StratiscapeDraw.getLayer('canvasQlinqoGameOver');

                    //scale our canvas layers to better match screen resolution
                    //http://blogs.msdn.com/b/davrous/archive/2012/04/06/modernizing-your-html5-canvas-games-with-offline-apis-file-apis-css3-amp-hardware-scaling.aspx
                    document.StratiscapeDraw.scaleLayers({
                        'mainWidth': Qlinqo.width,
                        'mainHeight': Qlinqo.height,
                        'paddingWidth': 0,
                        'paddingHeight': 0,
                        'ratioTolerance': 0.0,
                        'additionalElementIds': ['pageContainer', 'outerDiv']
                    });

                    Qlinqo.Setup(playfieldLayer, foregroundLayer, backgroundLayer, debugLayer, statusLayer, gameOverLayer, defer);

                    FW.Setup(document.StratiscapeDraw.getLayer('canvasFWForeground'));

                } else {
                    $('#canvasContainer').html('<p style="color:red">Bummer! This game will not run on your device!</p>');
                }

                return defer.promise;
            }
            
            if (!$rootScope.isParent()){
                $scope.uid = $localStorage['child']['member-id'];
            }else{
                $scope.uid = $localStorage['uid'];
            }

            $scope.handleScore = function(score){
               if (score == 0){
                  $rootScope.showPopup('Better luck next time!', 'You did not win this time, but maybe tomorrow!', 'error').then(function(){
                     ChildService.awardDailyRoo($scope.uid, 0).then(function(){
                        $rootScope.modal.hide();
                     });
                  });
               }else{
                  $rootScope.showPopup('You won!', 'You have received '+score+' points!').then(function(){
                     ChildService.awardDailyRoo($scope.uid, score).then(function(){
                        $rootScope.modal.hide();
                     });
                  });
               }
            };

            setTimeout(function() {
                $scope.setupQlinqo().then(function(score){
                	if (score == 0){
                		$rootScope.showPopup('Better luck next time!', 'You did not win this time, but maybe tomorrow!', 'error').then(function(){
                			ChildService.awardDailyRoo($scope.uid, 0).then(function(){
                				$rootScope.modal.hide();
                			});
                		});
                	}else{
                		$rootScope.showPopup('You won!', 'You have received '+score+' points!').then(function(){
                			ChildService.awardDailyRoo($scope.uid, score).then(function(){
                				$rootScope.modal.hide();
                			});
                		});
                	}
                });
            }, 1000);
        }
    ]);