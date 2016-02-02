var args = arguments[0] || {};

function focus() {
	var height = $.uihelper.getHeightFromChildren($.nameView);
	$.nameVDividerView.height = height;
	updateInputs();
}

function updateInputs() {
	var user = args.user;
	if (user) {
		$.fnameTxt.setValue(user.fname);
		$.lnameTxt.setValue(user.lname);
		$.dobDp.setValue(user.dob);
		$.phoneTxt.setValue($.utilities.formatPhoneNumber(user.phone));
	}
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didClickSubmit(e) {
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    dob = $.dobDp.getValue(),
	    phone = $.phoneTxt.getValue();
	if (!fname) {
		$.uihelper.showDialog({
			message : $.strings.transferUserDetValFirstName
		});
		return;
	}
	if (!$.utilities.validateName(fname)) {
		$.uihelper.showDialog({
			message : $.strings.transferUserDetValFirstNameInvalid
		});
		return;
	}
	if (!lname) {
		$.uihelper.showDialog({
			message : $.strings.transferUserDetValLastName
		});
		return;
	}
	if (!$.utilities.validateName(lname)) {
		$.uihelper.showDialog({
			message : $.strings.transferUserDetValLastNameInvalid
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
		fname : fname,
		lname : lname,
		dob : dob,
		phone : phone
	};
	if (args.user) {
		_.extend(args.user, user);
		$.app.navigator.close();
	} else {
		$.app.navigator.open({
			titleid : "titleTransferStore",
			ctrl : "stores",
			ctrlArguments : {
				navigation : {
					titleid : "titleTransferOptions",
					ctrl : "transferOptions",
					ctrlArguments : {
						prescription : args.prescription,
						user : user,
						store : {}
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

function didClickLogin(e) {
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login",
		ctrlArguments : {
			navigation : {
				titleid : "titleTransferStore",
				ctrl : "stores",
				ctrlArguments : {
					navigation : {
						titleid : "titleTransferOptions",
						ctrl : "transferOptions",
						ctrlArguments : {
							prescription : args.prescription,
							store : {}
						},
						stack : true
					},
					selectable : true
				}
			}
		},
		stack : true
	});
}

function setParentView(view) {
	$.dobDp.setParentView(view);
}

function hideAllPopups() {
	return $.dobDp.hide();
}

exports.focus = focus;
exports.setParentView = setParentView;
exports.backButtonHandler = hideAllPopups;
