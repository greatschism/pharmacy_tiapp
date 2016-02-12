var args = arguments[0] || {};

(function() {

	var dict = {
		id : args.id || "rightNavBtn",
		analyticsId : args.analyticsId || "RightNavBtn",
		role : args.role || "rightNavButton"
	};
	if (OS_ANDROID) {
		_.extend(dict, {
			width : Ti.UI.SIZE,
			height : Ti.UI.FILL
		});
	}
	$.widget = Ti.UI.createView(dict);
	$.widget.addEventListener("click", didClick);
	$.addTopLevelView($.widget);

	//actual button
	if (OS_IOS) {
		/**
		 * ios navigation buttons
		 * will get decent padding
		 * on left / right
		 * by default
		 */
		args = _.omit(args, ["left", "right", "textAlign"]);
	}
	$.button = Ti.UI.createButton(args);
	$.widget.add($.button);

})();

function didClick(e) {
	$.trigger("click", e);
}

exports.getNavButton = function() {
	return $.button;
};
