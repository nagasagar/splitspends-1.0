// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngMessages', 'ngCordova', 'ionic-toast', 'ngSpecialOffer', 'ngStorage'])

.run(function($ionicPlatform, $specialOffer, $cordovaSQLite, $rootScope, $window,$state,$ionicHistory, DB) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        //$cordovaSQLite.deleteDB("my.db");
        DB.init();
        var introdone = $window.localStorage.introdone;
        

        // App theme
        var selectedTheme = $window.localStorage.appTheme;
        if (selectedTheme) {
            $rootScope.appTheme = selectedTheme;
            $rootScope.appTheme_bar = "bar-" + selectedTheme;
        } else {
            $rootScope.appTheme = 'positive';
            $rootScope.appTheme_bar = "bar-" + "positive";
        }
        if (!introdone) {
            $window.localStorage.introdone = true;
            $state.go("app.intro")
        } else{
            $ionicHistory.nextViewOptions({
            historyRoot: true
            })
            $state.go("app.listgroups")
            $ionicHistory.clearHistory();
        }

        $specialOffer.init({
            id: 'Split Spends',
            showOnCount: 5,
            title: 'Rate Us',
            text: 'If you like this app please rate us',
            agreeLabel: 'Rate App',
            remindLabel: 'Remind Me',
            declineLabel: 'No Thanks',
            onAgree: function() {
                if (device.platform === "ios") {
                    window.open($specialOffer.appStoreUrl(iosId));
                } else {
                    window.open('market://details?id=com.nagasagar.splitspends995349');
                }
            },
            onDecline: function() {
                // declined
            },
            onRemindMeLater: function() {
                // will be reminded in 5 more uses
            }
        });
    });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.tabs.position('bottom');
        $stateProvider
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                //controller: 'AppCtrl'
            })
            .state('app.settings', {
                url: "/settings",
                views: {
                    'menuContent': {
                        templateUrl: "templates/settings.html",
                        controller: 'settingscontrol'
                    }
                }
            })
            .state('app.listusers', {
                url: "/listusers",
                views: {
                    'menuContent': {
                        templateUrl: "templates/listusers.html",
                        controller: 'usercontrol'
                    }
                }
            })
            .state('app.listgroups', {
                url: "/listgroups",
                views: {
                    'menuContent': {
                        templateUrl: "templates/listgroups.html",
                        controller: 'groupcontrol'
                    }
                }
            })
            .state('app.listexpenses', {
                url: "/listexpenses",
                views: {
                    'menuContent': {
                        templateUrl: "templates/listexpenses.html",
                        controller: 'expensecontrol'
                    }
                }
            })
            .state('app.groupdetail', {
                url: "/listgroups/:groupId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/groupdetail.html",
                        controller: 'groupdetailcontroltrl'
                    }
                }
            })
            .state('app.expensedetail', {
                url: "/listexpenses/:expenseId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/expensedetail.html",
                        controller: 'expensedetailcontroltrl'
                    }
                }
            })
            .state('app.intro', {
                url: '/intro',
                views: {
                    'menuContent': {
                        templateUrl: "templates/intro.html",
                        controller: 'IntroCtrl'
                    }
                }
            })
            .state('app.userdetail', {
                url: "/listusers/:userId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/userdetail.html",
                        controller: 'userdetailcontroltrl'
                    }
                }
            });
        $urlRouterProvider.otherwise('/app/listexpenses');
    })
    .config(function($provide) {
        $provide.decorator("$q", function($delegate) {
            //Helper method copied from q.js.
            var isPromiseLike = function(obj) {
                return obj && angular.isFunction(obj.then);
            }

            /*
             * @description Execute a collection of tasks serially.  A task is a function that returns a promise
             *
             * @param {Array.<Function>|Object.<Function>} tasks An array or hash of tasks.  A tasks is a function
             *   that returns a promise.  You can also provide a collection of objects with a success tasks, failure task, and/or notify function
             * @returns {Promise} Returns a single promise that will be resolved or rejected when the last task
             *   has been resolved or rejected.
             */
            function serial(tasks) {
                //Fake a "previous task" for our initial iteration
                var prevPromise;
                var error = new Error();
                angular.forEach(tasks, function(task, key) {
                    var success = task.success || task;
                    var fail = task.fail;
                    var notify = task.notify;
                    var nextPromise;

                    //First task
                    if (!prevPromise) {
                        nextPromise = success();
                        if (!isPromiseLike(nextPromise)) {
                            error.message = "Task " + key + " did not return a promise.";
                            throw error;
                        }
                    } else {
                        //Wait until the previous promise has resolved or rejected to execute the next task
                        nextPromise = prevPromise.then(
                            /*success*/
                            function(data) {
                                if (!success) {
                                    return data;
                                }
                                var ret = success(data);
                                if (!isPromiseLike(ret)) {
                                    error.message = "Task " + key + " did not return a promise.";
                                    throw error;
                                }
                                return ret;
                            },
                            /*failure*/
                            function(reason) {
                                if (!fail) {
                                    return $delegate.reject(reason);
                                }
                                var ret = fail(reason);
                                if (!isPromiseLike(ret)) {
                                    error.message = "Fail for task " + key + " did not return a promise.";
                                    throw error;
                                }
                                return ret;
                            },
                            notify);
                    }
                    prevPromise = nextPromise;
                });

                return prevPromise || $delegate.when();
            }

            $delegate.serial = serial;
            return $delegate;
        });
    })
    .directive('navBarClass', function() {
        return {
            restrict: 'A',
            compile: function(element, attrs) {

                // We need to be able to add a class the cached nav-bar
                // Which provides the background color
                var cachedNavBar = document.querySelector('.nav-bar-block[nav-bar="cached"]');
                var cachedHeaderBar = cachedNavBar.querySelector('.bar-header');

                // And also the active nav-bar
                // which provides the right class for the title
                var activeNavBar = document.querySelector('.nav-bar-block[nav-bar="active"]');
                var activeHeaderBar = activeNavBar.querySelector('.bar-header');
                var barClass = attrs.navBarClass;
                var ogColors = [];
                var colors = ['positive', 'stable', 'light', 'royal', 'dark', 'assertive', 'calm', 'energized'];
                var cleanUp = function() {
                    for (var i = 0; i < colors.length; i++) {
                        var currentColor = activeHeaderBar.classList.contains('bar-' + colors[i]);
                        if (currentColor) {
                            ogColors.push('bar-' + colors[i]);
                        }
                        activeHeaderBar.classList.remove('bar-' + colors[i]);
                        cachedHeaderBar.classList.remove('bar-' + colors[i]);
                    }
                };
                return function($scope) {
                    $scope.$on('$ionicView.beforeEnter', function() {
                        cleanUp();
                        cachedHeaderBar.classList.add($scope.appTheme_bar);
                        activeHeaderBar.classList.add($scope.appTheme_bar);
                    });
                    $scope.$on('$ionicView.enter', function() {
                        cleanUp();
                        cachedHeaderBar.classList.add($scope.appTheme_bar);
                        activeHeaderBar.classList.add($scope.appTheme_bar);
                    });

                    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                        for (var j = 0; j < ogColors.length; j++) {
                            activeHeaderBar.classList.add(ogColors[j]);
                            cachedHeaderBar.classList.add(ogColors[j]);
                        }
                        cachedHeaderBar.classList.remove($scope.appTheme_bar);
                        activeHeaderBar.classList.remove($scope.appTheme_bar);
                        ogColors = [];

                    });
                };
            }
        };
    });