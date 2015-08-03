var args = arguments[0] || {},
    moment = require("alloy/moment");

function init() {
	$.transferAllPrescLbl.text = String.format($.strings.transferOptsLblTransferAllPresc, args.prescription ? args.prescription.storeOriginal.code_display : $.strings.transferOptsStrStoreNone);
}

function didClickComplete(e) {
	if (args.prescription) {
		transferStore();
	} else {
		var base64Str = Ti.Utils.base64encode(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "transfer.jpg").read()).text;
		/**
		 * TIMOB-9111
		 */
		if (OS_IOS) {
			base64Str = base64Str.replace(/[\r\n]+/g, "");
		}
		$.http.request({
			method : "upload_image",
			params : {
				feature_code : "THXXX",
				data : [{
					patient : {
						EncodedImageString : base64Str
					}
				}]
			},
			keepLoader : true,
			success : didUploadImage
		});
	}
}

function didUploadImage(result, passthrough) {
	transferStore(result.data);
}

function transferStore(imageURL) {
	var data = {
		enable_transfer_all_presc_flag : $.transferAllPrescSwt.getValue(),
		to_store_id : args.store.id
	},
	    user = args.user,
	    prescription = args.prescription;
	if (user) {
		_.extend(data, {
			first_name : user.fname,
			last_name : user.lname,
			birth_date : moment(user.dob).format(Alloy.CFG.apiCodes.date_format),
			mobile : user.phone
		});
	} else {
		/**
		 * check with server team
		 * and add necessary params for
		 * logged in user
		 */
		_.extend(data, {
			first_name : Alloy.Models.patient.get("first_name"),
			last_name : Alloy.Models.patient.get("last_name"),
			birth_date : Alloy.Models.patient.get("birth_date"),
			mobile : Alloy.Models.patient.get("mobile_number"),
			email_address : Alloy.Models.patient.get("email_address")
		});
	}
	if (prescription) {
		_.extend(data, {
			rx_name : prescription.name,
			rx_number : prescription.rx,
			from_pharmacy_phone : prescription.phone,
			from_pharmacy_name : prescription.storeOriginal.code_display
		});
	} else {
		data.image_url = imageURL;
	}
	$.http.request({
		method : "stores_transfer",
		params : {
			feature_code : "THXXX",
			data : [{
				transfer : data
			}]
		},
		success : didSuccess
	});
}

function didSuccess(result, passthrough) {
	/**
	 * analyse api response
	 * for right error / success messages
	 * in success screen
	 */
	console.log(args.store);
	console.log(args.prescription);
	$.app.navigator.open({
		titleid : "titleTransferSuccess",
		ctrl : "transferSuccess",
		ctrlArguments : {
			store : args.store,
			prescription : args.prescription
		}
	});
}

function didClickReview(e) {
	$.app.navigator.open({
		titleid : "titleTransferReview",
		ctrl : "transferReview",
		ctrlArguments : {
			prescription : args.prescription,
			store : args.store,
			user : args.user,
			transferAllPresc : $.transferAllPrescSwt.getValue(),
			sendTxtMsg : ""
		},
		stack : true
	});
}

exports.init = init;
