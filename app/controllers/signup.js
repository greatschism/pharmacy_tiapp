var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    rxNoLength = Alloy.CFG.rx_length,
    //rxNoFormatters = Alloy.CFG.rx_formatters,
    userContainerViewFromTop = 0,
    modalWindow,
    rxContainerViewFromTop = 0,
    apiCodes = Alloy.CFG.apiCodes,
    store;

/**
 * todo - why do we need rxformatters?
 * 		  why do we need change listeners on sotre?
 * 		  test the store selection feature after the stores are implemented
 * 		  Tool tip
 * 		  after successful regn, take the user to login page with uname and pwd prepoluated
 * 	 	  show tool tip on login page
 */

function init() {
	$.uihelper.getImage("logo", $.logoImg);
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
	
	/*if (!_.has(rxNoFormatters[0], "exp")) {
		for (var i in rxNoFormatters) {
			var formatter = rxNoFormatters[i];
			formatter.exp = new RegExp(formatter.pattern, formatter.modifiters);
			delete formatter.pattern;
			delete formatter.modifiters;
		}
	}*/
	if (args.fname) {
		$.fnameTxt.setValue(args.fname);
	}
	if (args.dob) {
		$.dob.setValue(args.dob);
	}
	$.passwordTxt.tooltip = $.strings.msgPasswordTips;
	$.rxNoTxt.applyProperties({
		maxLength : Alloy.CFG.rx_length
	});
	// Alloy.Models.store.clear();
	// Alloy.Models.store.on("change", didChangeStore);
	$.containerView.addEventListener("postlayout", didPostlayoutUserContainerView);
	// $.rxContainerView.addEventListener("postlayout", didPostlayoutRxContainerView);
}

function focus() {
	/**
	 * if shouldUpdate is true
	 * call api for further store information
	 */
	if (store.shouldUpdate) {
		$.http.request({
			method : "stores_get",
			params : {
				feature_code : "THXXX",
				data : [{
					stores : {
						id : store.id,
					}
				}]
			},
			forceRetry : true,
			success : didGetStore
		});
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

// function didPostlayoutRxContainerView(e) {
	// $.rxContainerView.removeEventListener("postlayout", didPostlayoutRxContainerView);
	// rxContainerViewFromTop = e.source.rect.y;
// }

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
}

function didFocusPassword(e) {
	if (_.has($.passwordTooltip, "size")) {
		$.passwordTooltip.applyProperties({
			top : (userContainerViewFromTop + Alloy.TSS.form_txt.height) - $.passwordTooltip.size.height
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
	    // pharmacyObj = Alloy.Models.store.toJSON();
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
		if (moment().diff(dob, "years", true) < 18) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgAgeRestriction,
				buttonNames : [Alloy.Globals.strings.dialogBtnIAgree, Alloy.Globals.strings.dialogBtnCancel],
				cancelIndex : 1,
				success : function() {
					didClickSignup({
						ageValidated : true
					});
				}
			});
			return;
		}
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
					birth_date : dob,
					gender : "",
					address_line1 : "",
					address_line2 : "",
					city : "",
					state : "",
					zip : "",
					home_phone : "",
					mobile : "",
					email_address : email,
					rx_number : rxNo,
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
		failure: didFail
	});
}

function didRegister(result) {
	app.navigator.closeToRoot();
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login",
		ctrlArguments : {
			username : email,
			password : password 
		}
	});
}

function didFail(){
	uihelper.showDialog({
		message : Alloy.Globals.strings.msgAccountExists
	});
	app.navigator.closeToRoot();
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login",
		ctrlArguments : {
		}
	});
}

function terminate() {
	// Alloy.Models.store.off("change", didChangeStore);
}

exports.init = init;
exports.terminate = terminate;
exports.setParentView = setParentView;
