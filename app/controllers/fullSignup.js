var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment");

function init() {
	if (args.fname) {
		$.fnameTxt.setValue(args.fname);
	}
	if (args.dob) {
		$.dob.setValue(args.dob);
	}
	uihelper.getImage($.logoImg);
	Alloy.Models.store.clear();
	Alloy.Models.store.on("change", didChangeStore);
	$.userContainerView.addEventListener("postlayout", didPostLayoutUserContainerView);
	$.rxContainerView.addEventListener("postlayout", didPostLayoutRxContainerView);
}

function didPostLayoutUserContainerView(e) {
	$.userContainerView.removeEventListener("postlayout", didPostLayoutUserContainerView);
	var fromTop = e.source.rect.y;
	$.usernameTooltip.applyProperties({
		top : fromTop - Alloy.CFG.fullSignup.usernameTooltip.top
	});
	$.passwordTooltip.applyProperties({
		top : fromTop - Alloy.CFG.fullSignup.passwordTooltip.top
	});
}

function didPostLayoutRxContainerView(e) {
	$.rxContainerView.removeEventListener("postlayout", didPostLayoutRxContainerView);
	var fromTop = e.source.rect.y;
	$.rxNoTooltip.applyProperties({
		top : fromTop - Alloy.CFG.fullSignup.rxNoTooltip.top
	});
}

function setParentViews(_view) {
	$.dob.setParentView(_view);
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	if (nextItem && $[nextItem]) {
		if ($[nextItem].focus) {
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

function didClickCreateAccount(e) {
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    dob = $.dob.getValue(),
	    email = $.emailTxt.getValue(),
	    uname = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    rxNo = $.rxNoTxt.getValue(),
	    pharmacyObj = Alloy.Models.store.toJSON();
	if (!fname) {
		dialog.show({
			message : Alloy.Globals.strings.valFirstNameRequired
		});
		return;
	}
	if (!lname) {
		dialog.show({
			message : Alloy.Globals.strings.valLastNameRequired
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
	if (!rxNo) {
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
					birth_date : moment(dob).format("DD-MM-YYYY"),
					email_address : email,
					user_name : uname,
					password : password,
					rx_nummber : rxNo,
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
