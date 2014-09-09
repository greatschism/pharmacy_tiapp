var args = arguments[0] || {}, App = require("core"), _controller;

(function() {
	$.titleLbl.text = args.title || "";
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
	} else {
		App.hamburger.toggleLeftMenu();
	}
}

exports.child = _controller;
