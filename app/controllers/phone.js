var args = arguments[0] || {},
    childProxies,
    childProxy,
    phone,
    otp,
    utilities = require('utilities'),
    rows = [];
isFamilyAccounts = false;
function init() {
	var lastPhone = $.utilities.getProperty(Alloy.CFG.latest_phone_verified);
	
	/**
	 * To populate the phone number in this page, if the mobile number is already verified
	 */
	if (!args.signup) {
		didChangePhone({
			value : lastPhone
		});
	}
	/**
	 * if it is family accounts flow, show all the child accounts in the table
	 */
	isFamilyAccounts = utilities.getProperty((Alloy.Globals.isLoggedIn ? Alloy.Models.patient.get("email_address") + "-familyAccounts" : args.username + "-familyAccounts"), false, "bool", true);
	if (isFamilyAccounts) {
		updateTable();
	}
}

function updateTable() {
	var data = [];

	childProxies = [{
		title : "Bobby James",
		subtitle : "My son"
	}, {
		title : "Daphie James",
		subtitle : "My daughter"
	}, {
		title : "Kerry James",
		subtitle : "My daughter"
	}, {
		title : "Kathy James",
		subtitle : "My daughter"
	}, {
		title : "Mathew James",
		subtitle : "My son"
	}];
	$.receiveTextSection = $.uihelper.createTableViewSection($, $.strings.receiveTextChildSectionLbl);
	var subtitleClasses = ["content-subtitle-wrap"],
	    titleClasses = ["content-title-wrap"],
	    selected = false;
	_.each(childProxies, function(childProxy) {
		_.extend(childProxy, {
			titleClasses : titleClasses,
			subtitleClasses : subtitleClasses,
			selected : selected
		});
		var row = Alloy.createController("itemTemplates/contentViewWithLIcon", childProxy);
		$.receiveTextSection.add(row.getView());
		rows.push(row);

	});
	$.childTable.setData([$.receiveTextSection]);
}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

function didClickTableView(e) {
	if (isFamilyAccounts) {
		var row = rows[e.index];

		var params = row.getParams();
		if (params.selected) {
			params.selected = false;
		} else {
			params.selected = true;
		}
		rows[e.index] = Alloy.createController("itemTemplates/contentViewWithLIcon", params);
		$.childTable.updateRow( OS_IOS ? e.index : row.getView(), rows[e.index].getView());

	}
}

function didClickContinue() {
	phone = $.phoneTxt.getValue();
	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.phoneValPhone
		});
		return;
	}
	phone = $.utilities.validatePhoneNumber(phone);
	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.phoneValPhoneInvalid
		});
		return;
	}
	$.http.request({
		method : "mobile_add",
		params : {
			feature_code : "THXXX",
			data : [{
				add : {
					mobile : "1" + phone,
					old_mobile : ""
				}
			}]

		},
		success : didCheckMobileNumber,
		failure : didFail
	});
}

function didFail() {

}

function didCheckMobileNumber(result) {
	otp = result.data.patient.verification_code;
	$.app.navigator.open({
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"otp" : otp,
			"phone" : phone,
			"txtCode" : true,
			"txtMsgTitle" : true,
			"txtMsgLbl" : true,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : true,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : false,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : true,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle" : false,
			"txtNotReceiveLbl" : false,
			"txtNotReceiveBtn" : false,
			"skipTxtNotReceiveAttr" : false,
			"txtSuccessImg" : true,
			"txtFailImg" : false

		}
	});
}

exports.init = init;
