var args = arguments[0] || {};

function init() {
	$.utilities.setProperty(Alloy.CFG.first_launch, false, "bool", false);
}

function didClick(e) {
	$.app.navigator.open(_.findWhere(Alloy.Collections.menuItems.toJSON(), {
		landing_page : true
	}));
}

exports.init = init;
