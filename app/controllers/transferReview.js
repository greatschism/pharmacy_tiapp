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
	console.log(args.stores);
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

					image_url : "",

					to_store_id : args.stores.id,

					from_pharmacy_name : args.prescription.storeOriginal.code_display,

					from_pharmacy_phone : args.prescription.phone,

					rx_number :  args.prescription.rx,

					rx_name : args.prescription.name,

					enable_transfer_all_presc_flag : args.transferAllPrescSwtValue,

					enable_txt_msg_flag : args.sendtxtMsgSwtValue

				}

			}]
		},
		keepLoader : true,
		success : didSuccess
	});
}
function didSuccess(result){
	console.log(result);
}
function focus() {
	$.userNameLbl.text = args.user.fname + " " + args.user.lname;
	$.dobLbl.text = args.user.dob;
	$.phoneLbl.text = $.utilities.formatPhoneNumber(args.user.phone);
	$.pharmacyNameLbl.text = $.utilities.ucword(args.stores.store_name);
	$.pharmacyAddress1Lbl.text = args.stores.title;
	$.pharmacyAddress2Lbl.text = args.stores.subtitle;
	getStore();
	$.prescNameLbl.text = args.prescription.name;
	if (args.prescription.rx) {
		$.prescNumberLbl.text = args.prescription.rx;
	}
}
function getStore(){
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
function didGetStore(result){
	$.pharmacyPhoneReplyLbl.text = $.utilities.formatPhoneNumber(result.data.stores.phone);
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

