var args = arguments[0] || {},
    utilities = require("utilities"),
    moment = require("alloy/moment");

function init() {
	$.inviteLbl.text = String.format(Alloy.Globals.strings.familyMemberInviteLbl, args.familyRelationship);
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didSendInvite() {
	var email = $.emailTxt.getValue(),
	    phone = $.phoneTxt.getValue();

	if (!email && !phone) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.familyMemberInviteValEmailPhone
		});

		return;
	}

	if (phone &&  !$.utilities.validatePhoneNumber(phone)) {
		$.uihelper.showDialog({
			message : $.strings.phoneValPhoneInvalid
		});
		return;
	}
	
	if (email && !$.utilities.validateEmail(email)) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.familyMemberInviteValEmailInvalid
		});
		return;
	}

	$.http.request({
		method : "patient_family_add",
		params : {
			feature_code : "THXXX",
			data : [{
				patient : {
					is_adult : true,
					is_existing_user : false,
					email : email,
					mobile : phone,
					related_by : args.familyRelationship,
					user_name : "",
					password : "",
					first_name : "",
					last_name : "",
					birth_date : moment(args.dob).format(Alloy.CFG.apiCodes.dob_format),
					rx_number : "",
					store_id : ""
				}
			}]
		},
		success : didAddChild
	});

}

function didAddChild() {
	$.app.navigator.open({
		titleid : "titleFamilyAccounts",
		ctrl : "familyMemberInviteSuccess",
		ctrlArguments : {
			familyRelationship : args.familyRelationship
		},
		stack : false
	});
}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

exports.init = init;
