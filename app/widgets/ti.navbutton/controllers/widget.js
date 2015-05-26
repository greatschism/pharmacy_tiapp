var args = arguments[0] || {};

if (OS_IOS) {
	$.widget.role = args.role || "rightNavButton";
	$.button = Ti.UI.createButton(args);
	$.widget.add($.button);
}

if (OS_ANDROID) {
	$.role = args.role || "rightNavButton";
}

function didClick(e) {
	$.trigger("click", e);
}

function setMenu(menu) {
	$.button = Ti.UI.createButton(args);
	$.button.addEventListener("click", didClick);
	$.menuItem = menu.add({
		actionView : $.button,
		visible : false,
		showAsAction : args.showAsAction || Ti.Android.SHOW_AS_ACTION_ALWAYS
	});
	setTimeout(function() {
		$.menuItem.setVisible(true);
	}, 150);
}

exports.setMenu = setMenu;
