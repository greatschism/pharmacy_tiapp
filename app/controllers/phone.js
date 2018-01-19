var args = $.args,
    childProxyData = [],
    selectedChildProxy,
    authenticator = require("authenticator"),
    moment = require("alloy/moment"),
    accntMgrData,
    parentData,
    allChildData,
    childData,
    currentPatient,
    phone,
    lastPhone,
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
function handleEvent(e) {
	$.analyticsHandler.handleEvent($.ctrlShortCode, e);
}
function focus() {
	$.receiveTextLbl.text = String.format($.strings.receiveTextChildLbl, $.strings.strClientName, $.strings.strClientName);
	currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	/**
	 * To populate the phone number in this page, if the mobile number is already verified
	 */
	if (currentPatient.get("mobile_number") != null && currentPatient.get("mobile_number") != 'null') {
		lastPhone = $.utilities.formatPhoneNumber(currentPatient.get("mobile_number"));
		didChangePhone({
			value : lastPhone
		});
	} else {
		lastPhone = $.phoneTxt.getValue();
	}
}

function updateTable() {
	$.recieveTextSection = $.uihelper.createTableViewSection($, $.strings.receiveTextChildSectionLbl);
	var subtitleClasses = ["margin-top-small", "margin-bottom", "margin-left", "inactive-fg-color"],
	    titleClasses = ["margin-top", "margin-left","h4"],
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
	lastPhone = $.utilities.validatePhoneNumber(lastPhone);
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
	
	/**
	 * Check if the person has a minor account linked.
	 * If yes, send his ID as part of the mobile/add API call
	 */
	var minorAccount = 0;
	var linked_data = Alloy.Collections.patients.at(0).get("child_proxy");
	_.each(linked_data, function(child_data){
		var mDob = moment(child_data.birth_date, Alloy.CFG.apiCodes.dob_format);
		minorAccount = moment().diff(mDob, "years", true) >= 18 ? 0 : child_data.child_id;
	});
	
	if(minorAccount){
		selectedChildProxy.push(minorAccount);
	}
	
	$.http.request({
		method : "mobile_add",
		params : {
			data : [{
				add : {
					mobile : "1" + phone,
					old_mobile : "1" + lastPhone,
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
	if (args.origin === "remindersSettings" || args.remindersSettings) {
		remindersSettings = true;
		account = false;
	} else if (args.origin === "account" || args.account) {
		account = true;
		remindersSettings = false;
	} else {
		account = false;
		remindersSettings = false;
	}
	otp = result.data.patient.verification_code;
	authenticator.updatePreferences({
		"mobile_number" : phone
	}, {
		success : function() {
			currentPatient.set("is_mobile_verified", "0"); //set the flag to false because at this stage the mobile no. is not verified
			$.app.navigator.open({
				ctrl : "textMessage",
				stack : true,
				ctrlArguments : {
					"remindersSettings": remindersSettings,
					"account":account,
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
