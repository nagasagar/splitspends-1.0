// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngMessages','ngCordova'])

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
});