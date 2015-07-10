var args = arguments[0] || {};

(function() {

	if (OS_IOS) {
		$.widget.role = args.role || "rightNavButton";
		$.button = Ti.UI.createButton(args);
		$.widget.add($.button);
	}

	if (OS_ANDROID) {
		if (!_.has(args, "role")) {
			args.role = "rightNavButton";
		}
		$.button = Ti.UI.createButton(args);
		$.button.addEventListener("click", didClick);
		$.addTopLevelView($.button);
	}

})();

function didClick(e) {
	$.trigger("click", e);
}

function getNavButton() {
	return $.button;
}

exports.getNavButton = getNavButton;
