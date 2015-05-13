var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    rxNoLength = Alloy.CFG.RX_NUMBER.length,
    rxNoValidator = new RegExp(Alloy.CFG.RX_NUMBER.validator),
    rxNoFormatters = Alloy.CFG.RX_NUMBER.formatters,
    userContainerViewFromTop = 0,
    modalWindow,
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
		!$[nextItem].apiName && $[nextItem].focus ? $[nextItem].focus() : _.isEmpty(Alloy.Models.store.toJSON()) ? $[nextItem].fireEvent("click") : didClickCreateAccount();
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
			uihelper.showDialog({
				message : Alloy.Globals.strings.valFirstNameRequired
			});
			return;
		}
		if (!utilities.validateName(fname)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgFirstNameTips
			});
			return;
		}
		if (!lname) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.valLastNameRequired
			});
			return;
		}
		if (!utilities.validateName(lname)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgLastNameTips
			});
			return;
		}
		if (!dob) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.valDOBRequired
			});
			return;
		}
		if (!utilities.validateEmail(email)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.valEmailRequired
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
		if (!rxNoValidator.test(rxNo)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.valRxNoRequired
			});
			return;
		}
		if (_.isEmpty(pharmacyObj)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.valPharmacyRequired
			});
			return;
		}
		if (moment().diff(dob, "years", true) < 18) {
			uihelper.showDialog({
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
					birth_date : moment(dob).format(Alloy.CFG.apiCodes.DATE_FORMAT),
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
	uihelper.showDialog({
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

function didShowPickerPopOver(v) {

	modalWindow = Ti.UI.createWindow();

	modalWindow.open({
		title : 'Select A Date',

	});

	// default date
	var dateValue = new Date();
	dateValue.setFullYear(2015);
	dateValue.setMonth(0);
	dateValue.setDate(1);

	// lets create a date picker
	var picker = Ti.UI.createPicker({
		type : Ti.UI.PICKER_TYPE_DATE,
		value : dateValue,
		accessibilityLabel : dateValue,
		backgroundColor : 'grey'

	});
	picker.setLocale(Titanium.Platform.locale);
	picker.selectionIndicator = true;
	modalWindow.add(picker);
	var label = Ti.UI.createLabel({
		text : 'Done',
		top : 160,
		width : 'auto',
		height : 'auto',
		textAlign : 'right',
		right : 20,
		color : 'black',

	});
	modalWindow.add(label);

	picker.addEventListener('change', function(e) {
		usePickerDate = true;
		var pickerdate = e.value;

		var day = pickerdate.getDate();
		day = day.toString();

		if (day.length < 2) {
			day = '0' + day;

		}

		var month = pickerdate.getMonth();
		month = month + 1;
		month = month.toString();

		if (month.length < 2) {
			month = '0' + month;
		}

		var year = pickerdate.getFullYear();
		searchDate = year + "-" + month + "-" + day;
		$.dobTxt.setValue(searchDate);
		// alert(searchDate);
	});

	label.addEventListener('click', function(e) {

		modalWindow.close();

	});
	modalWindow.addEventListener('close', close);

};

function close() {

	uihelper.requestViewFocus($.dobTxt);
}

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews;
