var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    image;

function didEditPrescriptionDet() {
	if (args.prescription) {
		$.app.navigator.open({
			titleid : "titleTransferType",
			ctrl : "transferType",
			ctrlArguments : {
				edit : true,
				prescription : args.prescription,
			},
			stack : true
		});
	} else {
		$.uihelper.getPhoto(didGetPhoto, $.window);
	}
}

function didGetPhoto(blob) {
	/**
	 * keeping this blob in memory around the process
	 * is not a good idea, let's keep it in a file until
	 * we need this back
	 */
	$.utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "transfer.jpg"), blob, false);
	blob = null;
}

function didEditPersonalDet() {
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

function didEditStoreDet() {
	$.app.navigator.open({
		titleid : "titleTransferStore",
		ctrl : "stores",
		ctrlArguments : {
			edit : true,
			stores : args.stores,
		},
		stack : true
	});
}

function didCompleteTransfer() {
	$.http.request({
		method : "stores_transfer",
		params : {
			feature_code : "THXXX",
			data : [{
				transfer : {
					first_name : args.user.fname,
					last_name : args.user.lname,
					birth_date : args.user.dob,
					mobile : args.user.phone,
					email_address : "x",
					image_url : image ? image : "",
					to_store_id : args.stores.id,
					from_pharmacy_name : args.prescription ? args.prescription.storeOriginal.code_display : "",
					from_pharmacy_phone : args.prescription ? args.prescription.phone : "",
					rx_number : args.prescription ? args.prescription.rx : "",
					rx_name : args.prescription ? args.prescription.name : "",
					enable_transfer_all_presc_flag : args.transferAllPrescSwtValue,
					enable_txt_msg_flag : args.sendtxtMsgSwtValue
				}
			}]
		},
		success : didTransferStores
	});
}

function didTransferStores(result) {
	console.log(result);
	$.uihelper.showDialog({
		message : result.message
	});
	$.app.navigator.open({
		ctrl : "transferSuccess",
		ctrlArguments : {
			stores : args.stores,
			prescription : args.prescription
		},
		stack : false
	});
}

function focus() {
	var clientDateFormat = Alloy.CFG.date_format;
	console.log(args.user.dob);
	console.log(moment(args.user.dob).format(clientDateFormat));
	$.userNameLbl.text = args.user.fname + " " + args.user.lname;
	$.dobLbl.text = args.user.dob;
	$.phoneLbl.text = $.utilities.formatPhoneNumber(args.user.phone);
	$.pharmacyNameLbl.text = $.utilities.ucword(args.stores.store_name);
	$.pharmacyAddress1Lbl.text = args.stores.title;
	$.pharmacyAddress2Lbl.text = args.stores.subtitle;
	getStore();

	if (args.prescription) {
		$.prescNameLbl.text = args.prescription.name;
		if (args.prescription.rx)
			$.prescNumberLbl.text = args.prescription.rx;
	} else {
		image = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "transfer.jpg");
		$.prescImg.image = image;
	}
}

function getStore() {
	$.http.request({
		method : "stores_get",
		params : {
			feature_code : "THXXX",
			data : [{
				stores : {
					id : args.stores.id,
				}
			}]
		},
		success : didGetStore
	});
}

function didGetStore(result) {
	pharmacyPhone = result.data.stores.phone;
	$.pharmacyPhoneReplyLbl.text = $.utilities.formatPhoneNumber(pharmacyPhone);
}

function didClickPhone(e) {
	$.uihelper.getPhone({
		firstName : args.stores.store_name,
		phone : {
			work : $.utilities.formatPhoneNumber(pharmacyPhone)
		}
	}, pharmacyPhone);
}

exports.focus = focus;

