var args = arguments[0] || {};

function didClickType(e) {
	$.app.navigator.open({
		titleid : "titleRefillType",
		ctrl : "refillType",
		ctrlArguments : {
			phone : args.phone
		}
	});
}

function didClickPhone(e) {
	$.uihelper.openDialer(Alloy.Models.appload.get("supportphone"));
}