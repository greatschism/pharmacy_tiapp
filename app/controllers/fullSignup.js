var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    rxNoLength = Alloy.CFG.RX_NUMBER.length,
    rxNoValidator = new RegExp(Alloy.CFG.RX_NUMBER.validator),
    rxNoFormatters = Alloy.CFG.RX_NUMBER.formatters,
    userContainerViewFromTop = 0,
    rxContainerViewFromTop = 0;

function init() {
	uihelper.getImage($.logoImg);
	if (!_.has(rxNoFormatters[0], "exp")) {
		for (var i in rxNoFormatters) {
			var formatter = rxNoFormatters[i];
			formatter.exp = new RegExp(formatter.pattern, formatter.modifiters);
			delete formatter.pattern;
			delete formatter.modifiters;
		}
	}
	if (args.fname) {
		$.fnameTxt.setValue(args.fname);
	}
	if (args.dob) {
		$.dob.setValue(args.dob);
	}
	$.unameTxt.tooltip = "usernameTooltip";
	$.passwordTxt.tooltip = "passwordTooltip";
	$.rxNoTxt.tooltip = "rxNoTooltip";
	$.rxNoTxt.applyProperties({
		maxLength : Alloy.CFG.RX_NUMBER.length,
		hintText : Alloy.Globals.strings.hintRxNo.concat(Alloy.CFG.RX_NUMBER.format),
	});
	Alloy.Models.store.clear();
	Alloy.Models.store.on("change", didChangeStore);
	$.userContainerView.addEventListener("postlayout", didPostlayoutUserContainerView);
	$.rxContainerView.addEventListener("postlayout", didPostlayoutRxContainerView);
}

function setParentViews(_view) {
	$.dob.setParentView(_view);
}

function didPostlayoutUserContainerView(e) {
	$.userContainerView.removeEventListener("postlayout", didPostlayoutUserContainerView);
	userContainerViewFromTop = e.source.rect.y;
}

function didPostlayoutRxContainerView(e) {
	$.rxContainerView.removeEventListener("postlayout", didPostlayoutRxContainerView);
	rxContainerViewFromTop = e.source.rect.y;
}

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
}

function didFocusUsername(e) {;
	if (_.has($.usernameTooltip, "size")) {
		$.usernameTooltip.applyProperties({
			top : (userContainerViewFromTop + $.usernameTooltip.ARROW_PADDING) - $.usernameTooltip.size.height
		});
		delete $.usernameTooltip.size;
	}
	$.usernameTooltip.show();
}

function didFocusPassword(e) {
	if (_.has($.passwordTooltip, "size")) {
		$.passwordTooltip.applyProperties({
			top : (userContainerViewFromTop + $.passwordTooltip.ARROW_PADDING + Alloy.TSS.form_txt.height) - $.passwordTooltip.size.height
		});
		delete $.passwordTooltip.size;
	}
	$.passwordTooltip.show();
}

function didFocusRxNo(e) {
	if (_.has($.rxNoTooltip, "size")) {
		$.rxNoTooltip.applyProperties({
			top : (rxContainerViewFromTop + $.rxNoTooltip.ARROW_PADDING) - $.rxNoTooltip.size.height
		});
		delete $.rxNoTooltip.size;
	}
	$.rxNoTooltip.show();
}

function didBlurTxt(e) {
	$[e.source.tooltip].hide();
}

function didClickTooltip(e) {
	e.source.hide();
}

function didChangeRxNo(e) {
	var value = e.value,
	    len;
	for (var i in rxNoFormatters) {
		value = value.replace(rxNoFormatters[i].exp, rxNoFormatters[i].value);
	}
	value = value.slice(0, rxNoLength);
	len = value.length;
	$.rxNoTxt.setValue(value);
	$.rxNoTxt.setSelection(len, len);
}

function didClickPharmacy(e) {
	app.navigator.open({
		ctrl : "stores",
		titleid : "titleStores",
		stack : true,
		ctrlArguments : {
			orgin : $.__controllerPath
		}
	});
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	if (nextItem && $[nextItem]) {
		if (!$[nextItem].apiName && $[nextItem].focus) {
			$[nextItem].focus();
		} else if ($[nextItem].showPicker) {
			$[nextItem].showPicker();
		} else {
			_.isEmpty(Alloy.Models.store.toJSON()) ? $[nextItem].fireEvent("click") : didClickCreateAccount();
		}
	} else {
		didClickCreateAccount();
	}
}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(!e.value);
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function didChangeStore() {

}

function didClickAgreement(e) {
	app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : true
	});
}

function didClickCreateAccount(e) {
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    dob = $.dob.getValue(),
	    email = $.emailTxt.getValue(),
	    uname = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    rxNo = $.rxNoTxt.getValue(),
	    pharmacyObj = Alloy.Models.store.toJSON();
	if (!e.ageValidated) {
		if (!fname) {
			dialog.show({
				message : Alloy.Globals.strings.valFirstNameRequired
			});
			return;
		}
		if (!utilities.validateName(fname)) {
			dialog.show({
				message : Alloy.Globals.strings.msgFirstNameTips
			});
			return;
		}
		if (!lname) {
			dialog.show({
				message : Alloy.Globals.strings.valLastNameRequired
			});
			return;
		}
		if (!utilities.validateName(lname)) {
			dialog.show({
				message : Alloy.Globals.strings.msgLastNameTips
			});
			return;
		}
		if (!dob) {
			dialog.show({
				message : Alloy.Globals.strings.valDOBRequired
			});
			return;
		}
		if (!utilities.validateEmail(email)) {
			dialog.show({
				message : Alloy.Globals.strings.valEmailRequired
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
		if (!rxNoValidator.test(rxNo)) {
			dialog.show({
				message : Alloy.Globals.strings.valRxNoRequired
			});
			return;
		}
		if (_.isEmpty(pharmacyObj)) {
			dialog.show({
				message : Alloy.Globals.strings.valPharmacyRequired
			});
			return;
		}
		if (moment().diff(dob, "years", true) < 18) {
			dialog.show({
				message : Alloy.Globals.strings.msgAgeRestriction,
				buttonNames : [Alloy.Globals.strings.btnIAgree, Alloy.Globals.strings.strCancel],
				cancelIndex : 1,
				success : function() {
					didClickCreateAccount({
						ageValidated : true
					});
				}
			});
			return;
		}
	}
	http.request({
		method : "PATIENTS_REGISTER",
		data : {
			filter : [{
				type : "mobile_otp"
			}],
			data : [{
				patient : {
					first_name : fname,
					last_name : lname,
					birth_date : moment(dob).format("MM-DD-YYYY"),
					email_address : email,
					user_name : uname,
					password : password,
					rx_number : rxNo.replace(/\D+/g, ""),
					store_id : pharmacyObj.store_id || null,
					mobile : args.mobileNumber || null
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

function terminate() {
	Alloy.Models.store.off("change", didChangeStore);
}

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews;
