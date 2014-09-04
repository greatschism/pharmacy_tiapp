var args = arguments[0] || {};

(function() {
	$.titleLbl.text = args.title || "";
	var children = Alloy.createController(args.ctrl, args.ctrlArguments || {}).getTopLevelViews();
	for (var i in children) {
		if (children[i].role === "actionbar") {
			$.actionView.add(children[i]);
		} else {
			$.contentView.add(children[i]);
		}
	}
})();
