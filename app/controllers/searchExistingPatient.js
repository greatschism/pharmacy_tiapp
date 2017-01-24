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
    rxContainerViewFromTop = 0,
    store = {},
    optionalValues = null;
    
function init() {
	$.searchExistingPatientLbl.text = $.strings.searchExistingPatientLbl;
	$.askInfoLbl.text = $.strings.searchExistingPatientAskInfo;
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
	
}

function focus() {
	
}

function setParentView(view) {
	$.dob.setParentView(view);
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
	var fname = $.fnameTxt.getValue(),
    dob = $.dob.getValue();
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
	if (!dob) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValDob
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
	
	/**
	 * 	check for mobile number
	 */
	var mobileNumber = "";
	if (args.mobile_number) {
		mobileNumber = "1" + args.mobile_number;
	};

	var patient_info = {
		fname : fname,
		dob : dob,
		mobile_number : args.mobile_number,
		multiple_records : true
	};
	
	$.http.request({
		method : "patient_search",
		params : {
			data : [{
				patient : {
					mobile : mobileNumber,
					first_name : fname,
  					birth_date: moment(dob).format(Alloy.CFG.apiCodes.dob_format)
				}
			}]

		},
		success : didSuccess,
		failure : didFailed,
		passthrough : patient_info
	});

}

function didFailed(result, passthrough){
	
}

function didSuccess(result, passthrough) {
	var searchResult = result.data.patients,
	record_count = parseInt(searchResult.record_count);
	_.extend(searchResult, passthrough);
	
	if (record_count === 0) {
		$.app.navigator.open({
			ctrl : "signup",
			titleid : "titleCreateAccount",
			ctrlArguments : searchResult,
			stack : false
		});
	} else if(record_count === 1) {
		isMigratedUser(searchResult);
	}
}

function isMigratedUser(e){
	if (parseInt(e.is_migrated_user) === 1 && parseInt(e.dispensing_account_exists) === 1) {
		$.app.navigator.open({
			ctrl : "signupExistingUser",
			titleid : "titleCreateAccount",
			ctrlArguments : e,
			stack : false
		});
	} else if (parseInt(e.is_migrated_user) === 1 && parseInt(e.dispensing_account_exists) === 0){
		$.app.navigator.open({
			ctrl : "signupStoreUser",
			titleid : "titleCreateAccount",
			ctrlArguments : e,
			stack : false
		});
	} else if (parseInt(e.is_migrated_user) === 0){
		isStoreUser(e);
	}
}

function isStoreUser (e){
	if (parseInt(e.is_store_user) === 1) {
		$.app.navigator.open({
			ctrl : "signupStoreUser",
			titleid : "titleCreateAccount",
			ctrlArguments : e,
			stack : false
		});
	} else{
		$.app.navigator.open({
			titleid : "titleLogin",
			ctrl : "login",
		});
	};
}

exports.init = init;
exports.setParentView = setParentView;
exports.focus = focus;
