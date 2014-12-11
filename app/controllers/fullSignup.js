var args = arguments[0] || {},
    app = require("core"),
    locationFirstUpdate = true;

function init() {
	Alloy.Models.store.on("change", updateStore);
}

function setParentViews(view) {
	$.dob.setParentView(view);
}

function didClickSignup(e) {
	app.navigator.open({
		titleid : "titleVerifyMobileNumber",
		ctrl : "textToApp",
		stack : true
	});
}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(e.value);
}

function didFocusPassword(e) {
	$.passwordTooltip.show();
}

function didBlurPassword(e) {
	$.passwordTooltip.hide();
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	if (nextItem == "pharmacy" && locationFirstUpdate) {
		choosePharmacy();
	} else {
		$[nextItem] ? $[nextItem].focus() : didClickSignup();
	}
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function choosePharmacy(e) {
	app.navigator.open({
		titleid : "titleStores",
		ctrl : "stores",
		ctrlArguments : {
			orgin : "fullSignup"
		},
		stack : true
	});
}

function updateStore() {
	if (locationFirstUpdate) {
		locationFirstUpdate = false;
		$.locationLbl.color = Alloy.Globals.config.foregroundColors.secondary;
	}
	$.locationLbl.text = Alloy.Models.store.get("addressline1");
}

function terminate() {
	Alloy.Models.store.off("change", updateStore);
}

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews;
