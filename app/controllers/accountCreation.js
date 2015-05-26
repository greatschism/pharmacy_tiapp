var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    moment = require("alloy/moment"),
    containerViewFromTop = 0;

function init() {
	if (args.dob) {
		$.dob.setValue(args.dob);
	}
	$.unameTxt.tooltip = "usernameTooltip";
	$.passwordTxt.tooltip = "passwordTooltip";
	$.containerView.addEventListener("postlayout", didPostlayout);
}

function setParentViews(view) {
	$.dob.setParentView(view);
}

function didPostlayout(e) {
	$.containerView.removeEventListener("postlayout", didPostlayout);
	containerViewFromTop = e.source.rect.y;
}

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
}

function didFocusUsername(e) {;
	if (_.has($.usernameTooltip, "size")) {
		$.usernameTooltip.applyProperties({
			top : (containerViewFromTop + $.usernameTooltip.ARROW_PADDING) - $.usernameTooltip.size.height
		});
		delete $.usernameTooltip.size;
	}
	$.usernameTooltip.show();
}

function didFocusPassword(e) {
	if (_.has($.passwordTooltip, "size")) {
		$.passwordTooltip.applyProperties({
			top : (containerViewFromTop + $.passwordTooltip.ARROW_PADDING + Alloy.TSS.form_txt.height) - $.passwordTooltip.size.height
		});
		delete $.passwordTooltip.size;
	}
	$.passwordTooltip.show();
}

function didBlurTxt(e) {
	$[e.source.tooltip].hide();
}

function didClickTooltip(e) {
	e.source.hide();
}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(!e.value);
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	$[nextItem] && $[nextItem].focus ? $[nextItem].focus() : didClickSignup();
}

function didClickSignup(e) {
	var email = $.emailTxt.getValue(),
	    dob = $.dob.getValue(),
	    uname = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue();
	if (!utilities.validateEmail(email)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valEmailRequired
		});
		return;
	}
	if (!dob) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valDOBRequired
		});
		return;
	}
	if (!uname) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valUsernameRequired
		});
		return;
	}
	if (!utilities.validateUserName(uname)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgUserNameTips
		});
		return;
	}
	if (!password) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valPasswordRequired
		});
		return;
	}
	if (!utilities.validatePassword(password)) {
		uihelper.showDialog({
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

function didSuccess(result) {
	uihelper.showDialog({
		message : Alloy.Globals.strings.msgAccountCreated,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

function didClickAgreement(e) {
	app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : "true"
	});
}

exports.init = init;
exports.setParentViews = setParentViews;
