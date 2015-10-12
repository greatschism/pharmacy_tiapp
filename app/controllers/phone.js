var args = arguments[0] || {},
    childProxyData = [],
    selectedChildProxy,
    authenticator = require("authenticator"),
    accntMgrData,
    parentData,
    allChildData,
    childData,
    currentPatient,
    phone,
    otp,
    utilities = require('utilities'),
    rows = [];
isFamilyAccounts = false;

function init() {
	/**
	 * if it is family accounts flow, show all the child accounts in the table
	 */
	isFamilyAccounts = utilities.getProperty((Alloy.Globals.isLoggedIn ? Alloy.Collections.patients.at(0).get("email_address") + "-familyAccounts" : args.username + "-familyAccounts"), false, "bool", true);
	if (isFamilyAccounts) {

		updateTable();
	}
}

function focus() {
	$.receiveTextLbl.text = String.format($.strings.receiveTextChildLbl, $.strings.strClientName, $.strings.strClientName);
	currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	/**
	 * To populate the phone number in this page, if the mobile number is already verified
	 */
	if (currentPatient.get("mobile_number") !== null) {
		lastPhone = currentPatient.get("mobile_number");
		didChangePhone({
			value : lastPhone
		});
	}
}

function updateTable() {
	$.recieveTextSection = $.uihelper.createTableViewSection($, $.strings.receiveTextChildSectionLbl);
	var subtitleClasses = ["content-subtitle-wrap"],
	    titleClasses = ["content-title-wrap"],
	    selected = true;
	accntMgrData = Alloy.Collections.patients.at(0);
	parentData = Alloy.Collections.patients.at(0).get("parent_proxy");
	allChildData = Alloy.Collections.patients.at(0).get("child_proxy");
	childData = _.where(allChildData, {
		status : '1'
	});
	if (accntMgrData) {
		mgrData = [];
		mgr = {
			title : accntMgrData.get("title") ? accntMgrData.get("title") : accntMgrData.get("email_address"),
			subtitle : accntMgrData.get("relationship"),
			titleClasses : titleClasses,
			subtitleClasses : subtitleClasses,
			selected : selected,
		};
		mgrData.push(mgr);
		var mgrRow = Alloy.createController("itemTemplates/contentViewWithLIcon", mgr);
		$.recieveTextSection.add(mgrRow.getView());
		rows.push(mgrRow);
	}
	if (childData) {
		_.each(childData, function(data) {
			childProxy = {
				title : $.utilities.ucword(data.first_name) || $.utilities.ucword(data.last_name) ? $.utilities.ucword(data.first_name) + " " + $.utilities.ucword(data.last_name) : data.address,
				subtitle : $.strings.familyCareRelatedPrefix + data.related_by,
				titleClasses : titleClasses,
				subtitleClasses : subtitleClasses,
				selected : selected,
				id : data.child_id,

			};
			childProxyData.push(childProxy);
			var childRow = Alloy.createController("itemTemplates/contentViewWithLIcon", childProxy);
			$.recieveTextSection.add(childRow.getView());
			rows.push(childRow);
		});
	}
	$.childTable.setData([$.recieveTextSection]);
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
		if (row) {
			if (row.getParams().selected) {
				row.getParams().selected = false;
				childProxyData.selected = false;
			} else {
				row.getParams().selected = true;
				childProxyData.selected = true;
			}
			rows[e.index] = Alloy.createController("itemTemplates/contentViewWithLIcon", row.getParams());
			$.childTable.updateRow( OS_IOS ? e.index : row.getView(), rows[e.index].getView());
		}
	}
}

function didClickContinue() {
	phone = $.phoneTxt.getValue();
	var childProxy = [],
	    selectedChildProxy = [];
	_.each(rows, function(row) {
		if (row.getParams().selected) {
			if (row.getParams().id) {
				selectedChildProxy.push(row.getParams().id);
			}
		}

	});
	childProxy = _.pluck(selectedChildProxy, "id");
	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.phoneValPhone
		});
		return;
	}
	if ($.utilities.formatPhoneNumber(currentPatient.get("mobile_number")) === phone && currentPatient.get("is_mobile_verified") === "1") {
		$.uihelper.showDialog({
			message : $.strings.receiveTextPhoneExists
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
	if (isFamilyAccounts) {
		if (!childProxy.length) {
			$.uihelper.showDialog({
				message : $.strings.receiveTextPhoneNoChild
			});
			return;
		}
	}
	$.http.request({
		method : "mobile_add",
		params : {
			feature_code : "THXXX",
			data : [{
				add : {
					mobile : "1" + phone,
					old_mobile : "",
					childIds : selectedChildProxy
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
	authenticator.updatePreferences({
		"mobile_number" : phone
	}, {
		success : function() {
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
	});

}

exports.focus = focus;
exports.init = init;
