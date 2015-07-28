var args = arguments[0] || {};


function didEditPrescriptionDet() {
	$.app.navigator.open({
		titleid : "titleTransferType",
		ctrl : "transferType",
		ctrlArguments : {
			edit : true,
			prescription : args.prescription,
		},
		stack : true
	});

}
function didEditPersonalDet(){
	$.app.navigator.open({
		titleid : "titleTransferUserDetails",
		ctrl : "transferUserDetails",
		ctrlArguments : {
			edit : true,
			user : args.user,
		},
		stack : true
	});
}
function didCompleteTransfer() {

}

function focus() {
	console.log(args);
	$.userNameLbl.text = args.user.fname + " " + args.user.lname;
	$.dobLbl.text = args.user.dob;
	$.phoneLbl.text = $.utilities.formatPhoneNumber(args.user.phone);
	$.pharmacyNameLbl.text = $.utilities.ucword(args.stores.store_name);
	$.pharmacyAddress1Lbl.text = args.stores.title;
	$.pharmacyAddress2Lbl.text = args.stores.subtitle;
	$.pharmacyPhoneReplyLbl.text = $.utilities.formatPhoneNumber(args.user.phone);
	$.prescNameLbl.text = args.prescription.name;
	if (args.prescription.rx) {
		$.prescNumberLbl.text = args.prescription.rx;
	}
}

function didClickPhone(e) {
	$.uihelper.getPhone({
		firstName : args.stores.store_name,
		phone : {
			work : $.utilities.formatPhoneNumber(args.user.phone)
		}
	}, args.user.phone);
}

exports.focus = focus;

