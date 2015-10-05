var moment = require("alloy/moment"),
    passwordContainerViewFromTop = 0;

function init() {
	$.uihelper.getImage("logo", $.logoImg);
	$.passwordTxt.tooltip = $.strings.msgPasswordTips;
	$.containerView.addEventListener("postlayout", didPostlayoutPasswordContainerView);
}

function focus() {
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
}

function didClickContinue() {
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    email = $.emailTxt.getValue(),
	    dob = $.dobDp.getValue();

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
			feature_code : "THXXX",
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
					mobile : "",
					email_address : email,
					rx_number : "",
					store_id : "",
					user_type : "PARTIAL",
					optional : [{
						key : "",
						value : ""
					}, {
						key : "",
						value : ""
					}]
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
	successMessage = Alloy.Globals.strings.msgMgrAccountCreation;
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
					is_adult_partial : true
				},
				stack : false
			});
		}
	});

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

function didToggleShowPassword(e) {
	$.passwordTxt.setPasswordMask(!e.value);
}

function didBlurFocusPassword() {
	$.passwordTooltip.hide();
}

function didFocusPassword(e) {
	if (_.has($.passwordTooltip, "size")) {
		$.passwordTooltip.applyProperties({
			top : (passwordContainerViewFromTop + Alloy.TSS.form_txt.height + Alloy.TSS.content_view.top / 2) - $.passwordTooltip.size.height
		});
		delete $.passwordTooltip.size;
	}
	$.passwordTooltip.show();
}

function didPostlayoutPasswordContainerView(e) {
	$.containerView.removeEventListener("postlayout", didPostlayoutPasswordContainerView);
	passwordContainerViewFromTop = e.source.rect.y;
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
