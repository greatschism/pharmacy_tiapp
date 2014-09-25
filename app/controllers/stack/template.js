var args = arguments[0] || {}, App = require("core"), _controller;

(function() {
	if (args.titleImage) {
		$.titleImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			id : "titleImg"
		});
		$.titleImg.image = args.titleImage;
		$.actionView.add($.titleImg);
	} else {
		$.titleLbl.text = args.title || Alloy.Globals.Strings[args.titleid || ""];
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
		if (children[i].role === "actionbar") {
			$.actionView.add(children[i]);
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
	var animated = _animated || true;
}

function hideNavBar(_animated, _callback) {
	if ($.actionbar.top != 0) {
		var animated = _animated || true;
		if (animated) {
			var navBarAnimation = Ti.UI.createAnimation({
				top : -Alloy.CFG.navBarHeight,
				duration : Alloy.CFG.ANIMATION_DURATION
			});
		}
	}
}

exports.child = _controller;
