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
	} else {
		$.addClass($.leftImg, "hamburger");
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
	} else {
		App.Navigator.hamburger.toggleLeftMenu();
	}
}

function showNavBar(_animated, _callback) {
	var afterAnimation = function() {
		$.navBar.top = 0;
		$.contentView.top = Alloy.CFG.navBarHeight;
		if (_callback) {
			_callback();
		}
	};
	if ($.navBar.top != 0 && _animated !== false) {
		animateNavbar(0, Alloy.CFG.navBarHeight, afterAnimation);
	} else {
		afterAnimation();
	}
}

function hideNavBar(_animated, _callback) {
	var afterAnimation = function() {
		$.navBar.top = -Alloy.CFG.navBarHeight;
		$.contentView.top = 0;
		if (_callback) {
			_callback();
		}
	};
	if ($.navBar.top == 0 && _animated !== false) {
		animateNavbar(-Alloy.CFG.navBarHeight, 0, afterAnimation);
	} else {
		afterAnimation();
	}
}

function animateNavbar(_navBarTop, _contentTop, _callback) {
	var navBarAnimation = Ti.UI.createAnimation({
		top : _navBarTop,
		duration : Alloy.CFG.ANIMATION_DURATION
	});
	navBarAnimation.addEventListener("complete", function navBarComplete() {
		$.navBar.top = _navBarTop;
		navBarAnimation.removeEventListener("complete", navBarComplete);
	});
	$.navBar.animate(navBarAnimation);
	var contentAnimation = Ti.UI.createAnimation({
		top : _contentTop,
		duration : Alloy.CFG.ANIMATION_DURATION,
		delay : 100
	});
	contentAnimation.addEventListener("complete", function contentComplete() {
		$.contentView.top = _contentTop;
		contentAnimation.removeEventListener("complete", contentComplete);
		if (_callback) {
			_callback();
		}
	});
	$.contentView.animate(contentAnimation);
}

exports.child = _controller;
exports.showNavBar = showNavBar;
exports.hideNavBar = hideNavBar;
