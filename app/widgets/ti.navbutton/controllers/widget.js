var args = arguments[0] || {};

(function() {

	var dict = {
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
		 * ios gets some
		 * padding on right
		 * by default
		 */
		args = _.omit(args, ["right"]);
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
