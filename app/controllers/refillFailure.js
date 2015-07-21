var args = arguments[0] || {};

function didClickRefillQuick(e) {
	$.app.navigator.open({
		titleid : "titleRefillQuick",
		ctrl : "refillQuick",
		ctrlArguments : {
			phone : args.phone
		}
	});
}

function didClickPhone(e) {
	$.uihelper.showDialer(Alloy.Models.appload.get("supportphone"));
}