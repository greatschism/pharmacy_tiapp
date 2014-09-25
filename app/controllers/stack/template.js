var args = arguments[0] || {}, App = require("core"), _controller;

(function() {

	if (args.titleImage) {
		$.titleImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			id : "titleImg"
		});
		$.titleImg.image = args.titleImage;
		$.navBarView.add($.titleImg);
	} else {
		$.titleLbl.text = args.title || Alloy.Globals.Strings[args.titleid || ""];
	}

	if (args.navBarHidden === true) {
		hideNavBar(false);
	}

	if (args.stack) {
		$.addClass($.leftImg, "back");
		$.template.applyProperties({
			opacity : 0,
			left : App.Device.width
		});
	}

	_controller = Alloy.createController(args.ctrl, args.ctrlArguments || {});
	var children = _controller.getTopLevelViews();
	for (var i in children) {
		if (children[i].role === "navBar") {
			$.navBarView.add(children[i]);
		} else {
			$.contentView.add(children[i]);
		}
	}

})();

function didTap(e) {
	if (args.stack) {
		App.Navigator.close();
	}
}

function showNavBar(_animated, _callback) {
	if ($.navBar.top != 0) {
		if (_animated !== false) {
			var contentAnimation = Ti.UI.createAnimation({
				top : Alloy.CFG.navBarHeight,
				duration : Alloy.CFG.ANIMATION_DURATION
			});
			$.contentView.animate(contentAnimation);
			var navBarAnimation = Ti.UI.createAnimation({
				top : 0,
				duration : Alloy.CFG.ANIMATION_DURATION,
				delay : 100
			});
			navBarAnimation.addEventListener("complete", function onComplete() {
				navBarAnimation.removeEventListener("complete", onComplete);
				$.contentView.top = Alloy.CFG.navBarHeight;
				$.navBar.top = 0;
				if (_callback) {
					_callback();
				}
			});
			$.navBar.animate(navBarAnimation);
		} else {
			$.contentView.top = Alloy.CFG.navBarHeight;
			$.navBar.top = 0;
			if (_callback) {
				_callback();
			}
		}
	} else {
		if (_callback) {
			_callback();
		}
	}
}

function hideNavBar(_animated, _callback) {
	if ($.navBar.top == 0) {
		if (_animated !== false) {
			var navBarAnimation = Ti.UI.createAnimation({
				top : -Alloy.CFG.navBarHeight,
				duration : Alloy.CFG.ANIMATION_DURATION
			});
			$.navBar.animate(navBarAnimation);
			var contentAnimation = Ti.UI.createAnimation({
				top : 0,
				duration : Alloy.CFG.ANIMATION_DURATION,
				delay : 100
			});
			contentAnimation.addEventListener("complete", function onComplete() {
				contentAnimation.removeEventListener("complete", onComplete);
				$.navBar.top = -Alloy.CFG.navBarHeight;
				$.contentView.top = 0;
				if (_callback) {
					_callback();
				}
			});
			$.contentView.animate(contentAnimation);
		} else {
			$.navBar.top = -Alloy.CFG.navBarHeight;
			$.contentView.top = 0;
			if (_callback) {
				_callback();
			}
		}
	} else {
		if (_callback) {
			_callback();
		}
	}
}

exports.child = _controller;
exports.showNavBar = showNavBar;
exports.hideNavBar = hideNavBar;
