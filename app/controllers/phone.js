var args = arguments[0] || {},
    childProxyData = [],
    child_proxy = [],
    selectedChildProxy,
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
	isFamilyAccounts = utilities.getProperty((Alloy.Globals.isLoggedIn ? Alloy.Collections.patients.at(0).get("email_address") + "-familyAccounts" : args.username + "-familyAccounts"), false, "bool", true);
	//if (isFamilyAccounts) {

	updateTable();
	//}
}

function updateTable() {
	$.receiveTextSection = $.uihelper.createTableViewSection($, $.strings.receiveTextChildSectionLbl);
	var subtitleClasses = ["content-subtitle-wrap"],
	    titleClasses = ["content-title-wrap"],
	    selected = false;

	var cPatient = Alloy.Collections.patients.where({
		is_adult : false
	});
	if (cPatient.length) {
		_.each(cPatient, function(child_proxy) {
			child_proxy = {
				title : child_proxy.get("title"),
				subtitle : child_proxy.get("relationship"),
				titleClasses : titleClasses,
				subtitleClasses : subtitleClasses,
				selected : selected,
				id : child_proxy.get("child_id")
			};

			childProxyData.push(child_proxy);
			var row = Alloy.createController("itemTemplates/contentViewWithLIcon", child_proxy);
			$.receiveTextSection.add(row.getView());
			rows.push(row);
		});

	}
	$.childTable.setData([$.receiveTextSection]);
}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

function didClickTableView(e) {
	//if (isFamilyAccounts) {
	var row = rows[e.index];

	var params = row.getParams();
	if (params.selected) {
		params.selected = false;
	} else {
		params.selected = true;
	}
	rows[e.index] = Alloy.createController("itemTemplates/contentViewWithLIcon", params);
	$.childTable.updateRow( OS_IOS ? e.index : row.getView(), rows[e.index].getView());
	selectedChildProxy = _.reject(childProxyData, function(selected) {
		return childProxyData.selected === 0;
	});
	//}
}

function didClickContinue() {
	phone = $.phoneTxt.getValue();
console.log(selectedChildProxy);
	var childProxy = _.pluck(selectedChildProxy, "id");
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
					old_mobile : "",
					childIds : childProxy
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
