var args = $.args,
    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    rightButtonDict = $.createStyle({
	classes : ["margin-right-large", "i5", "active-fg-color", "bg-color-disabled", "touch-enabled", "rx-hintext"],
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
    rxContainerViewFromTop = 0,
    store = {},
    optionalValues = null;

function init() {
	/**
	 * PHA-1425 : Add the help image 
	 * inside the rx number textfield.
	 */
	setRightButtonForRx(rightButtonTitle.text, rightButtonDict);
	/**
	 * Set the right button "show/hide"
	 * with right parameters.
	 */
	if (Alloy.CFG.toggle_password_enabled) {
		setRightButton(rightPwdButtonDict.title, rightPwdButtonDict);
	}
	$.uihelper.getImage("logo", $.logoImg);
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);

	if (args.fname) {
		$.fnameTxt.setValue(args.fname);
	}
	if (args.dob) {
		$.dob.setValue(args.dob);
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
	$.rxNoTxt.tooltip = $.strings.msgRxNumberTips;
	$.rxNoTxt.tooltip = $.strings.msgRxNumberTips;

	$.passwordTooltip.updateArrow($.createStyle({
		classes : ["direction-down"]
	}).direction, $.createStyle({
		classes : ["i5", "inactive-fg-color", "icon-tooltip-arrow-down"]
	}));
	
	$.rxTooltip.updateArrow($.createStyle({
		classes : ["direction-down"]
	}).direction, $.createStyle({
		classes : ["i5", "inactive-fg-color", "icon-tooltip-arrow-down"]
	}));
	
	$.containerView.addEventListener("postlayout", didPostlayoutPasswordContainerView);
	$.rxContainer.addEventListener("postlayout", didPostlayoutRxContainerView);
}

function setRightButtonForRx(iconText, iconDict) {
	$.rxNoTxt.setIcon(iconText, "right", iconDict);
	// $.rxNoTxt.accessibilityLabel = "Rx help";
}

function didChangeRx(e) {
	var value = rx.format(e.value),
	    len = value.length;
	$.rxNoTxt.setValue(value);
	$.rxNoTxt.setSelection(len, len);
}

function focus() {
	/**
	 * if shouldUpdate is true
	 * fetch the store details from the 'store' variable passed by reference
	 */
	if (store && store.shouldUpdate) {
		store.shouldUpdate = false;
		$.storeTitleLbl.text = store.title;
	}
}

function setParentView(view) {
	$.dob.setParentView(view);
}

function didPostlayoutRxContainerView(e) {
	$.containerView.removeEventListener("postlayout", didPostlayoutRxContainerView);
	rxContainerViewFromTop = e.source.rect.y;
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

function didFocusRx(e) {
	$.rxTooltip.updateArrow($.createStyle({
			classes : ["direction-down"]
		}).direction, $.createStyle({
			classes : ["i5", "inactive-fg-color", "icon-filled-arrow-down"]
		}));
	
	if (_.has($.rxTooltip, "size")) {
		$.rxTooltip.applyProperties({
			top : (rxContainerViewFromTop - $.rxContainer.top * 2) 
		});
		delete $.rxTooltip.size;
	}
	$.rxTooltip.show();
}

function didBlurFocusPassword() {
	$.passwordTooltip.hide();
}

function didBlurFocusRx() {
	$.rxTooltip.hide();
	if (Ti.App.keyboardVisible) {
		Ti.App.hideKeyboard();
	}
}

function didClickTooltip(e) {
	e.source.hide();
}

function didClickPharmacy(e) {
	$.app.navigator.open({
		titleid : "titleStores",
		ctrl : "stores",
		ctrlArguments : {
			store : store,
			selectable : true
		},
		stack : true
	});
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	if (nextItem && $[nextItem]) {
		!$[nextItem].apiName && $[nextItem].focus ? $[nextItem].focus() : didClickSignup();
	} else {
		didClickSignup();
	}
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function didClickAgreement(e) {
	app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : true,
		ctrlArguments : {
			registrationFlow : true
		}
	});
}

function didClickSignup(e) {
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    dob = $.dob.getValue(),
	    email = $.emailTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    rxNo = $.rxNoTxt.getValue();
	if (!e.ageValidated) {
		if (!fname) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValFirstName
			});
			return;
		}
		if (!utilities.validateName(fname)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValFirstNameInvalid
			});
			return;
		}
		if (!lname) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValLastName
			});
			return;
		}
		if (!utilities.validateName(lname)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValLastNameInvalid
			});
			return;
		}
		if (!dob) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValDob
			});
			return;
		}
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
		if (!rxNo) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValRxNo
			});
			return;
		}
		if (!rx.validate(rxNo)) {
			uihelper.showDialog({
				message : String.format(Alloy.Globals.strings.registerValRxInvalid,Alloy.CFG.rx_length)
			});
			return;
		}
		if (_.isEmpty(store)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValStore
			});
			return;
		}
		/**
		 * If the user is <18, stop him from registration. He shall contact the support for assistance
		 */
		if (moment().diff(dob, "years", true) < 18) {
			uihelper.showDialog({
				message : String.format(Alloy.Globals.strings.msgAgeRestriction, Alloy.Models.appload.get("supportphone")),
			});
			return;
		}
	}
	
	/**
	 * 	check for mobile number
	 */
	var mobileNumber = "";
	if (args.mobile_number) {
		mobileNumber = "1" + args.mobile_number;
	};

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
					mobile : mobileNumber,
					email_address : email,
					rx_number : rxNo.substring(Alloy.CFG.rx_start_index, Alloy.CFG.rx_end_index),
					store_id : store.id,
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

function didClickHelp(e) {
	$.app.navigator.open({
		titleid : "titleRxSample",
		ctrl : "rxSample",
		stack : true
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
exports.setParentView = setParentView;
exports.focus = focus;
