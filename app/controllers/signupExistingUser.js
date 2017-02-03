var args = $.args,
    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    apiCodes = Alloy.CFG.apiCodes,
    rightButtonDict = $.createStyle({
	classes : ["margin-right-large", "i5", "active-fg-color", "bg-color-disabled", "touch-enabled"],
}),
    rightButtonTitle = $.createStyle({
	classes : ["icon-help"],
}),
rightPwdButtonDict = $.createStyle({
	classes : ["txt-positive-right-btn","positive-fg-color"],
	title : Alloy.Globals.strings.strShow,
	width : "25%",
	backgroundColor: 'transparent'
}),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    passwordContainerViewFromTop = 0,
    store = {},
    optionalValues = null;

function init() {
	$.signupExistingUserLbl.text = $.strings.signupExistingUserLbl;
	$.askInfoLbl.text = $.strings.signupExistingUserAskInfo;
	
	/**
	 * Set the right button "show/hide"
	 * with right parameters.
	 */
	if (Alloy.CFG.toggle_password_enabled) {
		setRightButton(rightPwdButtonDict.title, rightPwdButtonDict);
	}

	if (args.is_migrated_user || args.is_store_user || args.dispensing_account_exists) {
		optionalValues = {};
		if (args.is_migrated_user) {
			optionalValues.is_migrated_user = args.is_migrated_user;
		}
		if (args.is_store_user) {
			optionalValues.is_store_user = args.is_store_user;
		}
		if (args.dispensing_account_exists) {
			optionalValues.dispensing_account_exists = args.dispensing_account_exists;
		}
	};
	
	$.passwordTxt.tooltip = $.strings.msgPasswordTips;
	
	$.passwordTooltip.updateArrow($.createStyle({
		classes : ["direction-down"]
	}).direction, $.createStyle({
		classes : ["i5", "inactive-fg-color", "icon-tooltip-arrow-down"]
	}));
	
	$.containerView.addEventListener("postlayout", didPostlayoutPasswordContainerView);
}

function focus() {
	
}

function didPostlayoutPasswordContainerView(e) {
	$.containerView.removeEventListener("postlayout", didPostlayoutPasswordContainerView);
	passwordContainerViewFromTop = e.source.rect.y - 15;
}

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
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
	$.passwordTooltip.show();
}

function didBlurFocusPassword() {
	$.passwordTooltip.hide();
}

function didClickTooltip(e) {
	e.source.hide();
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	if (nextItem && $[nextItem]) {
		!$[nextItem].apiName && $[nextItem].focus ? $[nextItem].focus() : didClickContinue();
	} else {
		didClickContinue();
	}
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function didClickContinue(e) {
	var email = $.emailTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    dob = args.dob;
	if (!email) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValEmail
		});
		return;
	}
	if (!utilities.validateEmail(email)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValEmailInvalid
		});
		return;
	}
	if (!password) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValPassword
		});
		return;
	}
	if (!utilities.validatePassword(password)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValPasswordInvalid
		});
		return;
	}
	
	/**
	 * 	check for mobile number
	 */
	var mobileNumber = "";
	if (args.mobile_number) {
		mobileNumber = "1" + args.mobile_number;
	};

	var isEmailEdited = '0';
	if (args.email_address != email) {
		isEmailEdited = '1';
	};
	optionalValues.is_email_edited = isEmailEdited;
	optionalValues.customer_token = args.customer_token;

	var userCredentials = {
		email : email,
		password : password
	};
	
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
					first_name : (args.first_name),
					last_name : (args.last_name),
					birth_date : moment(dob).format(Alloy.CFG.apiCodes.dob_format),
					gender : "",
					address_line1 : "",
					address_line2 : "",
					city : "",
					state : "",
					zip : "",
					home_phone : "",
					mobile : mobileNumber,
					email_address : email,
					user_type : "FULL",
					optional : optionalValues
				}
			}]

		},
		errorDialogEnabled : false,
		success : didRegister,
		failure: didFailToRegister,
		passthrough : userCredentials
	});
}

function didFailToRegister(result, passthrough){
	if(result.errorCode === apiCodes.invalid_combination_for_signup)
	{
		$.uihelper.showDialog({
			message : result.message,
			buttonNames : [$.strings.dialogBtnPhone, $.strings.dialogBtnOK],
			cancelIndex : 1,
			success : function(){
				var supportPhone = Alloy.Models.appload.get("supportphone");
				if (supportPhone) {
					$.uihelper.openDialer($.utilities.validatePhoneNumber(supportPhone));
				}
			}				
		});
	}
	else{
		$.uihelper.showDialog({
			message : result.message
		});
	}
}

function didRegister(result, passthrough) {
	/**
	 * Set property to display HIPAA during first login flow
	 */
	utilities.setProperty(passthrough.email, "showHIPAA", "string", true);
	utilities.setProperty("familyMemberAddPrescFlow", false, "bool", true);
	$.uihelper.showDialog({
		message : result.message,
		buttonNames : [$.strings.dialogBtnOK],
		success : function() {
			$.app.navigator.open({
				titleid : "titleLogin",
				ctrl : "login",
				ctrlArguments : {
					username : passthrough.email,
					password : passthrough.password
				}
			});
		}
	});
}


function didToggleShowPassword() {
	if (Alloy.CFG.toggle_password_enabled) {
		if ($.passwordTxt.getPasswordMask()) {
			$.passwordTxt.setPasswordMask(false);
			_.extend(rightPwdButtonDict, {
				title : $.strings.strHide,
				width: "25%",
				backgroundColor: 'transparent'
			});
		} else {
			$.passwordTxt.setPasswordMask(true);
			_.extend(rightPwdButtonDict, {
				title : $.strings.strShow,
				width: "25%",
				backgroundColor: 'transparent'
			});
		}
		setRightButton(rightPwdButtonDict.title, rightPwdButtonDict);
	}
}

function setRightButton(iconText, iconDict) {
	$.passwordTxt.setButton(iconText, "right", iconDict);
}

exports.init = init;
exports.focus = focus;
