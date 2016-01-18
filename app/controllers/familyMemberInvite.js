var args = arguments[0] || {},
    utilities = require("utilities"),
    authenticator = require("authenticator"),
    email,
    phone,
    mobile,
    moment = require("alloy/moment");

function init() {
	$.uihelper.getImage("adult", $.adultImg);
	$.inviteLbl.text = String.format(Alloy.Globals.strings.familyMemberInviteLbl, args.familyRelationship);
}

function didSendInvite() {
	email = $.emailTxt.getValue();
	phone = $.phoneTxt.getValue();

	if (!email && !phone) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.familyMemberInviteValEmailPhone
		});

		return;
	}

	if (phone && !$.utilities.validatePhoneNumber(phone)) {
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
	mobile = $.utilities.validatePhoneNumber(phone);

	$.http.request({
		method : "patient_family_add",
		params : {
			data : [{
				patient : {
					is_adult : true,
					is_existing_user : false,
					email : email,
					mobile : mobile,
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
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			$.app.navigator.open({
				titleid : "titleFamilyAccounts",
				ctrl : "familyMemberInviteSuccess",
				ctrlArguments : {
					familyRelationship : args.familyRelationship,
				},
				stack : false
			});
		}
	});
}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

function didClickCancel() {
	$.app.navigator.open({
		titleid : "titleAddFamily",
		ctrl : "familyMemberAdd",
		stack : true
	});
}

exports.init = init;
