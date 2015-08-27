// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngMessages', 'ngCordova','ionic-toast'])

.run(function($ionicPlatform, $cordovaSQLite, DB) {
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
                        controller: 'usercontrol'
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
    });