var args = arguments[0] || {}, App = require("core"), _controller;

(function() {
	if (args.titleImage) {
		$.titleImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			classes : ["title-img"]
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

function showNavBar(_animated) {
	
}

function hideNavBar(_animated) {

}

exports.child = _controller;
