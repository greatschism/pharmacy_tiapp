var args = arguments[0] || {};

function focus(){
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
	updateInputs();
}
function setParentView(view) {
	$.dobDp.setParentView(view);
}
function updateInputs(){
	if (args.edit) {
		var user = args.user;
		$.firstNameTxt.setValue(user.fname);
		$.lastNameTxt.setValue(user.lname);
		$.dobDp.setValue(user.dob);
		didChangePhone({
			value : user.phone
		});
		
	}
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
	if (args.edit) {
		_.extend(args.user, user);
		$.app.navigator.close();
	}else{
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
}
function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}
exports.focus=focus;
exports.setParentView = setParentView; 