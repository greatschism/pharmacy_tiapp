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

exports.child = _controller;
