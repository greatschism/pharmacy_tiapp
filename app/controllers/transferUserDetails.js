var args = arguments[0] || {};

function init(){
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
}
function setParentView(view) {
	$.dobDp.setParentView(view);
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}
function submitUserDet(){
		var firstname = $.firstNameTxt.getValue(),
	    lastname = $.lastNameTxt.getValue(),
	    dob=$.dobDp.getValue(),
	    phone=$.phoneTxt.getValue();
	if (!firstname) {
		$.uihelper.showDialog({
			message : $.strings.transferUserDetValFirstName
		});
		return;
	}
	if (!lastname) {
		$.uihelper.showDialog({
			message : $.strings.transferUserDetValLastName
		});
		return;
	}
	if (!dob) {
		$.uihelper.showDialog({
			message : $.strings.transferUserDetValDob
		});
		return;
	}
	phone = $.phoneTxt.getValue();
	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.transferUserDetValPhone
		});
		return;
	}
	phone = $.utilities.validatePhoneNumber(phone);
	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.transferUserDetValPhoneInvalid
		});
		return;
	}
	var user = {
		fname : firstname,
		lname : lastname,
		dob : dob,
		phone : phone
	};
	$.app.navigator.open({
				titleid : "titleTransferStore",
				ctrl : "stores",
				ctrlArguments : {
					prescription : args.prescription,
					navigation : {
						titleid : "titleTransferOptions",
						ctrl : "transferOptions",
						ctrlArguments : {
							prescription : args.prescription,
							store : {},
							user: user
						},
						stack : true
					},
					selectable : true
				},
				stack : true
			});

}
function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}
exports.init=init;
exports.setParentView = setParentView; 