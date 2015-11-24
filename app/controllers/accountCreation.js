var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    moment = require("alloy/moment"),
    rightButtonDict = $.createStyle({
	classes : ["txt-positive-right-btn"],
	title : Alloy.Globals.strings.strShow,
}),
    containerViewFromTop = 0;

function init() {
	/**
	 * Set the right button "show/hide"
	 * with right parameters.
	 */
	if (Alloy.CFG.toggle_password_enabled) {
		setRightButton(rightButtonDict.title, rightButtonDict);
	}
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

function didToggle() {
	if (Alloy.CFG.toggle_password_enabled) {
		if ($.passwordTxt.getPasswordMask()) {
			$.passwordTxt.setPasswordMask(0);
			_.extend(rightButtonDict, {
				title : $.strings.strHide,
			});
		} else {
			$.passwordTxt.setPasswordMask(1);
			_.extend(rightButtonDict, {
				title : $.strings.strShow,
			});
		}
		setRightButton(rightButtonDict.title, rightButtonDict);
	}
}

function setRightButton(iconText, iconDict) {
	$.passwordTxt.setButton(iconText, "right", iconDict);
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
		method : "patients_store_to_app_conversion",
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
