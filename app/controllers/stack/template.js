var args = arguments[0] || {},
    app = require("core"),
    config = require("config"),
    icons = Alloy.CFG.icons,
    controller;

(function() {

	if (args.navBarHidden === true) {
		hideNavBar(false);
	}

	if (args.stack) {
		$.leftIconLbl.text = icons.back;
	} else {
		$.leftIconLbl.visible = false;
	}

	//reload tss of this controller in memory
	config.updateTSS(args.ctrl);

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
			left : Alloy._nav_icn_width,
			right : Alloy._nav_icn_width,
			text : title
		});
	} else {
		$.titleLbl.text = title;
	}

	_.isFunction(controller.setParentViews) && controller.setParentViews($.contentView);

})();

function didClickLeftActionView(e) {
	if (args.stack) {
		_.isFunction(controller.backButtonHandler) ? controller.backButtonHandler(false) : app.navigator.close();
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
