"use strict";
angular.module("ionic-toast", ["ionic"]).run(["$templateCache", function(t) {
	var o = '<div class="ionic_toast" ng-class="ionicToast.toastClass" ng-style="ionicToast.toastStyle"><span class="ionic_toast_close" ng-click="hide()"><i class="ion-close-round toast_close_icon"></i></span><span ng-bind-html="ionicToast.toastMessage"></span></div>';
	t.put("ionic-toast/templates/ionic-toast.html", o)
}]).provider("ionicToast", function() {
	this.$get = ["$compile", "$document", "$interval", "$rootScope", "$templateCache", "$timeout", function(t, o, i, n, s, a) {
		var c, e = {
				toastClass: "",
				toastMessage: "",
				toastStyle: {
					display: "none",
					opacity: 0
				}
			},
			l = {
				top: "ionic_toast_top",
				middle: "ionic_toast_middle",
				bottom: "ionic_toast_bottom"
			},
			d = n.$new(),
			p = t(s.get("ionic-toast/templates/ionic-toast.html"))(d);
		d.ionicToast = e, o.find("body").append(p);
		var u = function(t, o, i) {
			d.ionicToast.toastStyle = {
				display: t,
				opacity: o
			}, d.ionicToast.toastStyle.opacity = o, i()
		};
		return d.hide = function() {
			u("none", 0, function() {
				console.log("toast hidden")
			})
		}, {
			show: function(t, o, i, n) {
				t && o && n && (a.cancel(c), n > 5e3 && (n = 5e3), angular.extend(d.ionicToast, {
					toastClass: l[o] + " " + (i ? "ionic_toast_sticky" : ""),
					toastMessage: t
				}), u("block", 1, function() {
					i || (c = a(function() {
						d.hide()
					}, n))
				}))
			},
			hide: function() {
				d.hide()
			}
		}
	}]
});