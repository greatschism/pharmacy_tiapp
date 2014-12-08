var args = arguments[0] || {},
    icons = Alloy.CFG.icons,
    app = require("core"),
    controller;

(function() {

	if (args.navBarHidden === true) {
		hideNavBar(false);
	}

	if (args.stack) {
		$.leftBtn.title = icons.back;
		$.template.applyProperties({
			opacity : 0,
			zIndex : 3,
			left : app.device.width
		});
	} else {
		$.leftBtn.title = icons.hamburger;
	}

	controller = Alloy.createController(args.ctrl, args.ctrlArguments || {});
	var children = controller.getTopLevelViews(),
	    title = args.title || Alloy.Globals.strings[args.titleid || ""] || "",
	    navBarItems = 0;
	for (var i in children) {
		var view = children[i].__controllerPath ? children[i].getView() : children[i],
		    role = children[i].role;
		switch(role) {
		case "navBar":
			navBarItems++;
			$.navBarView.add(view);
			break;
		case "overlay":
			$.template.add(view);
			break;
		default:
			view && $.contentView.add(view);
		}
	}
	if (title.length > 8 && navBarItems == 0) {
		$.titleLbl.applyProperties({
			left : 60,
			right : 60,
			text : title
		});
	} else {
		$.titleLbl.text = title;
	}

	_.isFunction(controller.setParentViews) && controller.setParentViews($.contentView);

})();

function didClickLeftBtn(e) {
	if (args.stack) {
		app.navigator.close();
	} else {
		app.navigator.hamburger.toggleLeftMenu();
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

exports.child = controller;
exports.showNavBar = showNavBar;
exports.hideNavBar = hideNavBar;
