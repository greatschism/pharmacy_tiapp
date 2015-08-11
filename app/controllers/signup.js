var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    userContainerViewFromTop = 0,
    store = {};

function init() {
	$.uihelper.getImage("logo", $.logoImg);
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
	
	if (args.fname) {
		$.fnameTxt.setValue(args.fname);
	}
	if (args.dob) {
		$.dob.setValue(args.dob);
	}
	$.passwordTxt.tooltip = $.strings.msgPasswordTips;
	$.containerView.addEventListener("postlayout", didPostlayoutUserContainerView);
}

function didChangeRx(e) {
	var value = utilities.formatRx(e.value),
	    len = value.length;
	$.rxNoTxt.setValue(value);
	$.rxNoTxt.setSelection(len, len);
}

function focus() {
	/**
	 * if shouldUpdate is true
	 * call api for further store information
	 */
	if (store && store.shouldUpdate) {
		store.shouldUpdate = false;
		$.storeTitleLbl.text = store.title;
	}
}

function didGetStore(result) {
	_.extend(store, result.data.stores);
	_.extend(store, {
		storeName : $.utilities.ucword(store.store_name),
	});
	delete store.shouldUpdate;
	
	$.pharmacyDp.text = store.storeName;
}

function setParentView(view) {
	$.dob.setParentView(view);
}

function didPostlayoutUserContainerView(e) {
	$.containerView.removeEventListener("postlayout", didPostlayoutUserContainerView);
	userContainerViewFromTop = e.source.rect.y;
}

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
}

function didFocusPassword(e) {
	if (_.has($.passwordTooltip, "size")) {
		$.passwordTooltip.applyProperties({
			top : (userContainerViewFromTop + Alloy.TSS.form_txt.height + 6) - $.passwordTooltip.size.height
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
		!$[nextItem].apiName && $[nextItem].focus ? $[nextItem].focus() : didClickCreateAccount();
	} else {
		didClickCreateAccount();
	}
}

function didToggleShowPassword(e) {
	$.passwordTxt.setPasswordMask(!e.value);
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
	    uname = $.unameTxt.getValue(),
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
		if (!email){
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
		if (!uname) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValUname
			});
			return;
		}
		if (!utilities.validateUsername(uname)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValUnameInvalid
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
		if(!rxNo){
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValRxNo
			});
			return;
		}
		if (!$.utilities.validateRx(rxNo)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValRxInvalid
			});
			return;
		}
		if (_.isEmpty(store)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValStore
			});
			return;
		}
		if (moment().diff(dob, "years", true) < 18) { /* todo - stop the user from proceeding if he is < 18 */
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgAgeRestriction,
				buttonNames : [Alloy.Globals.strings.dialogBtnOK],
				cancelIndex : 0,
				success : function() {
					didClickSignup({
						ageValidated : false
					});
				}
			});
			return;
		}
	}
	
	var userCredentials = {
		email : email, 
		password : password
	};
	
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
					rx_number : rxNo.substring(0,7), /*todo - pick only 1st 7 digits for mck */
					store_id : store.id,
					user_type : "FULL",
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
		failure: didFail,
		passthrough : userCredentials
	});
}

function didRegister(result, passthrough) {
	uihelper.showDialog({
		message : result.message
	});
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login",
		ctrlArguments : {
			username : passthrough.email,
			password : passthrough.password,
			showHIPAA : true 
		}
	});
}

function didFail(){
	app.navigator.closeToRoot();
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login"
	});
}

exports.init = init;
exports.setParentView = setParentView;
exports.focus = focus;
