var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment");

function init() {
	if (args.dob) {
		$.dob.setValue(args.dob);
	}
	uihelper.getImage($.logoImg);
	Alloy.Models.store.on("change", didChangeStore);
	$.userContainerView.addEventListener("postlayout", didPostLayoutUserContainerView);
	$.rxContainerView.addEventListener("postlayout", didPostLayoutRxContainerView);
}

function didPostLayoutUserContainerView(e) {
	$.userContainerView.removeEventListener("postlayout", didPostLayoutUserContainerView);
	$.usernameTooltip.applyProperties({
		top : e.source.rect.y - Alloy.CFG.fullSignup.usernameTooltip.top
	});
	$.passwordTooltip.applyProperties({
		top : e.source.rect.y - Alloy.CFG.fullSignup.passwordTooltip.top
	});
}

function didPostLayoutRxContainerView(e) {
	$.rxContainerView.removeEventListener("postlayout", didPostLayoutRxContainerView);
	$.rxNoTooltip.applyProperties({
		top : e.source.rect.y - Alloy.CFG.fullSignup.rxNoTooltip.top
	});
}

function setParentViews(_view) {
	$.dob.setParentView(_view);
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	nextItem ? $[nextItem] && $[nextItem].focus ? $[nextItem].focus() : $[nextItem].showPicker ? $[nextItem].showPicker() : $[nextItem].fireEvent("click") : didClickCreateAccount();
}

function didClickAgreement(e) {
	app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : "true"
	});
}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(e.value);
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function didChangeStore() {

}

function didClickCreateAccount(e) {

}

function didFocusUsername(e) {
	$.usernameTooltip.show();
}

function didBlurUsername(e) {
	$.usernameTooltip.hide();
}

function didFocusPassword(e) {
	$.passwordTooltip.show();
}

function didBlurPassword(e) {
	$.passwordTooltip.hide();
}

function didFocusRxNo(e) {
	$.rxNoTooltip.show();
}

function didBlurRxNo(e) {
	$.rxNoTooltip.hide();
}

function didClickTooltip(e) {
	e.source.hide();
}

function terminate() {
	Alloy.Models.store.off("change", didChangeStore);
}

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews;
