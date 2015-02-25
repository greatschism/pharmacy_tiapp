var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    moment = require("alloy/moment");

function init() {
	if (args.dob) {
		$.dob.setValue(args.dob);
	}
	$.containerView.addEventListener("postlayout", didPostLayout);
}

function didPostLayout(e) {
	$.containerView.removeEventListener("postlayout", didPostLayout);
	var fromTop = e.source.rect.y;
	$.usernameTooltip.applyProperties({
		top : fromTop - Alloy.CFG.accountCreation.usernameTooltip.top
	});
	$.passwordTooltip.applyProperties({
		top : fromTop - Alloy.CFG.accountCreation.passwordTooltip.top
	});
}

function setParentViews(_view) {
	$.dob.setParentView(_view);
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	nextItem ? $[nextItem] && $[nextItem].focus ? $[nextItem].focus() : $[nextItem].showPicker() : didClickSignup();
}

function didClickSignup(e) {
	var email = $.emailTxt.getValue(),
	    dob = $.dob.getValue(),
	    uname = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue();
	if (!utilities.validateEmail(email)) {
		dialog.show({
			message : Alloy.Globals.strings.valEmailRequired
		});
		return;
	}
	if (!dob) {
		dialog.show({
			message : Alloy.Globals.strings.valDOBRequired
		});
		return;
	}
	if (!uname) {
		dialog.show({
			message : Alloy.Globals.strings.valUsernameRequired
		});
		return;
	}
	if (!utilities.validateUserName(uname)) {
		dialog.show({
			message : Alloy.Globals.strings.msgUserNameTips
		});
		return;
	}
	if (!password) {
		dialog.show({
			message : Alloy.Globals.strings.valPasswordRequired
		});
		return;
	}
	if (!utilities.validatePassword(password)) {
		dialog.show({
			message : Alloy.Globals.strings.msgPasswordTips
		});
		return;
	}
	http.request({
		method : "PATIENTS_STORE_TO_APP_CONVERSION",
		data : {
			filter : [{
				type : "mobile_otp"
			}],
			data : [{
				patient : {
					user_name : uname,
					email_address : email,
					password : password
				}
			}]
		},
		success : didSuccess
	});
}

function didSuccess(_result) {
	dialog.show({
		message : Alloy.Globals.strings.msgAccountCreated,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});
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

function didClickTooltip(e) {
	e.source.hide();
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

exports.init = init;
exports.setParentViews = setParentViews;
