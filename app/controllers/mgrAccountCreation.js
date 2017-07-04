var moment = require("alloy/moment"),
    rightButtonDict = $.createStyle({
	classes : ["txt-positive-right-btn","positive-fg-color"],
	title : Alloy.Globals.strings.strShow,
	width: "25%",
	backgroundColor: 'transparent'
}),
    passwordContainerViewFromTop = 0;
    var args= arguments[0]||{};

function init() {
	/**
	 * Set the right button "show/hide"
	 * with right parameters.
	 */
	if (Alloy.CFG.toggle_password_enabled) {
		setRightButton(rightButtonDict.title, rightButtonDict);
	}
	$.uihelper.getImage("logo", $.logoImg);
	$.passwordTxt.tooltip = $.strings.msgPasswordTips;
	$.containerView.addEventListener("postlayout", didPostlayoutPasswordContainerView);
	
    var iDict = {};
	iDict.accessibilityValue = $.strings.dobAccessibilityLbl;
    $.dobDp.__views.widget.applyProperties(iDict);
    
    var sDict = {};
	sDict.accessibilityLabel = $.strings.registerLblAgreementAccessibility;
	$.agreementAttr.applyProperties(sDict);
}

function focus() {
var height = $.uihelper.getHeightFromChildren($.nameView);
	$.nameVDividerView.height = height;}

function didClickContinue() {
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    phone = $.phoneTxt.getValue(),
	    email = $.emailTxt.getValue(),
	    dob = $.dobDp.getValue();
	    phone = $.utilities.validatePhoneNumber(phone);

	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.phoneValPhoneInvalid
		});
		return;
	}
	if (!fname) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValFirstName
		});
		return;
	}
	if (!$.utilities.validateName(fname)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValFirstNameInvalid
		});
		return;
	}
	if (!lname) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValLastName
		});
		return;
	}
	if (!$.utilities.validateName(lname)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValLastNameInvalid
		});
		return;
	}
	if (!dob) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValDob
		});
		return;
	}
	if (!password) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValPasssword
		});
		return;
	}
	if (!$.utilities.validatePassword(password)) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.registerValPasswordInvalid
		});
		return;
	}
	if (!email) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValEmail
		});
		return;
	}
	if (!$.utilities.validateEmail(email)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValEmailInvalid
		});
		return;
	}
	if (moment().diff(dob, "years", true) < 18) {
		$.uihelper.showDialog({
			message : String.format(Alloy.Globals.strings.msgAgeRestriction, Alloy.Models.appload.get("supportphone")),
		});
		return;
	}
	$.http.request({
		method : "patient_register",
		params : {
			filter : {
				sort_order : "asc"
			},
			data : [{
				patient : {
					user_name : email,
					password : password,
					first_name : fname,
					last_name : lname,
					birth_date : moment(dob).format(Alloy.CFG.apiCodes.dob_format),
					gender : "",
					address_line1 : "",
					address_line2 : "",
					city : "",
					state : "",
					zip : "",
					home_phone : "",
					mobile : "1" + phone,
					email_address : email,
					rx_number : "",
					store_id : "",
					user_type : "PARTIAL",
					optional : null
				}
			}]

		},
		success : didRegister,
		failure : didFail
	});
}

function didFail() {
	$.app.navigator.open({
		titleid : "titleMgrAccountExists",
		ctrl : "mgrAccountExists",
		ctrlArguments : {
			username : $.emailTxt.getValue(),
			password : $.passwordTxt.getValue(),
			is_adult_partial : true
		},
		stack : true
	});
}

function didRegister() {
	$.utilities.setProperty("familyMemberAddPrescFlow", false, "bool", true);
	if (args.origin === "registerChildInfo") {
		successMessage = Alloy.Globals.strings.msgMgrChildAccountCreation;
	} else {
		successMessage = Alloy.Globals.strings.msgMgrAdultAccountCreation;
	}
	$.uihelper.showDialog({
		message : successMessage,
		buttonNames : [$.strings.dialogBtnOK],
		success : function() {
			$.app.navigator.open({
				titleid : "titleLogin",
				ctrl : "login",
				ctrlArguments : {
					username : $.emailTxt.getValue(),
					password : $.passwordTxt.getValue(),
					is_adult_partial : true,
					parent: args.origin === "registerChildInfo" ? "registerChildInfo"  : "registerAdultInfo"
				},
				stack : false
			});
		}
	});

}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function setParentView(view) {
	$.dobDp.setParentView(view);
}

function didToggleShowPassword() {
	if (Alloy.CFG.toggle_password_enabled) {
		if ($.passwordTxt.getPasswordMask()) {
			$.passwordTxt.setPasswordMask(false);
			_.extend(rightButtonDict, {
				title : $.strings.strHide,
				width: "25%",
				backgroundColor: 'transparent'
			});
		} else {
			$.passwordTxt.setPasswordMask(true);
			_.extend(rightButtonDict, {
				title : $.strings.strShow,
				width: "25%",
				backgroundColor: 'transparent'
			});
		}
		setRightButton(rightButtonDict.title, rightButtonDict);
	}
}

function setRightButton(iconText, iconDict) {
	$.passwordTxt.setButton(iconText, "right", iconDict);
}

function didBlurFocusPassword() {
	$.passwordTooltip.hide();
}

function didFocusPassword(e) {
		$.passwordTooltip.updateArrow($.createStyle({
			classes : ["direction-down"]
		}).direction, $.createStyle({
			classes : ["i5", "inactive-fg-color", "icon-filled-arrow-down"]
		}));
	
	if (_.has($.passwordTooltip, "size")) {
		$.passwordTooltip.applyProperties({
			top : (passwordContainerViewFromTop + $.containerView.top ) 
		});
		delete $.passwordTooltip.size;
	}
	if (!Ti.App.accessibilityEnabled) {
		$.passwordTooltip.show();
	}
}

function didPostlayoutPasswordContainerView(e) {
	$.containerView.removeEventListener("postlayout", didPostlayoutPasswordContainerView);
	passwordContainerViewFromTop = e.source.rect.y - 15;
}

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
}

function didClickTooltip(e) {
	e.source.hide();
}

function didClickAgreement(e) {
	$.app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : true,
		ctrlArguments : {
			registrationFlow : true
		}
	});
}

exports.setParentView = setParentView;
exports.focus = focus;
exports.init = init;
