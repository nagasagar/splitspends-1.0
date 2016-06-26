angular.module('starter.controllers', ['ngCordova'])

.controller('IntroCtrl', function($scope, $state, $ionicHistory, $ionicSlideBoxDelegate) {

    // Called to navigate to the main app
    $scope.startApp = function() {
        $ionicHistory.nextViewOptions({
            historyRoot: true
        })
        $state.go("app.listexpenses");
        $ionicHistory.clearHistory();
    };
    $scope.next = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function() {
        $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };
})


.controller('settingscontrol', function($scope, $rootScope, $cordovaSQLite, $ionicModal, $window, DB_CONFIG) {

    $scope.themes = [
        'positive',
        'calm',
        'energized',
        'royal',
        'dark'
    ];

    $scope.themeChange = function(theme) {
        // save theme locally
        $window.localStorage.appTheme = theme;
        $rootScope.appTheme = $window.localStorage.appTheme;
        $rootScope.appTheme_bar = "bar-" + theme;
        // reload
        $scope.hideselectthememodal();
        $window.location.reload(true)
    }
    $scope.showselectthememodal = function(expenseid) {
        $ionicModal.fromTemplateUrl('selecttheme.html', function(modal) {
            $scope.selectthememodal = modal;
            $scope.selectthememodal.show();
        }, {
            scope: $scope
        });
    }
    $scope.hideselectthememodal = function(expenseid) {
        $scope.selectthememodal.hide();
    }
    $scope.rateapp = function() {
        if (device.platform === "ios") {
            window.open('itms-apps://itunes.apple.com/us/app/domainsicle-domain-name-search/id511364723?ls=1&mt=8');
        } else {
            window.open('market://details?id=com.nagasagar.splitspends995349');
        }
    }
})