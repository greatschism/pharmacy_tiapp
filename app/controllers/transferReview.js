var args = $.args,
    moment = require("alloy/moment");

function init() {
	$.tableView.bottom = $.tableView.bottom + $.transferBtn.height + $.transferBtn.bottom;
}

function handleEvent(e) {
	$.analyticsHandler.handleEvent($.ctrlShortCode, e);
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
		enable_transfer_all_presc_flag : args.transferAllPresc === true ? "1" : "0",
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

		var currentPatient = Alloy.Collections.patients.findWhere({
			selected : true
		});

		_.extend(data, {
			first_name : currentPatient.get("first_name"),
			last_name : currentPatient.get("last_name"),
			birth_date : moment(currentPatient.get("birth_date")).format(Alloy.CFG.apiCodes.date_format),
			mobile : currentPatient.get("mobile_number"),
			email_address : currentPatient.get("email_address")
		});
	}
	if (prescription) {
		_.extend(data, {
			rx_name : prescription.name,
			rx_number : prescription.rx,
			from_pharmacy_phone : prescription.phone,
			from_pharmacy_name : prescription.storeOther ? prescription.storeOther : prescription.storeOriginal.code_display
		});
	} else {
		data.image_url = imageURL;
	}
	$.http.request({
		method : "stores_transfer",
		params : {
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
	$.app.navigator.open({ 
		titleid : "titleTransferSuccess",
		ctrl : "transferSuccess",
		ctrlArguments : {
			store : args.store,
			prescription : args.prescription
		}
	});
}

function didClickEditUser(e) {
	$.app.navigator.open({
		titleid : "titleTransferUserDetails",
		ctrl : "transferUserDetails",
		ctrlArguments : {
			user : args.user
		},
		stack : true
	});
}

function didClickEditStore() {
	$.app.navigator.open({
		titleid : "titleTransferStore",
		ctrl : "stores",
		ctrlArguments : {
			store : args.store,
			selectable : true
		},
		stack : true
	});
}

function didClickEditPrec(e) {
	var prescription = args.prescription;
	if (prescription) {
		$.app.navigator.open({
			titleid : "titleTransferType",
			ctrl : "transferType",
			ctrlArguments : {
				prescription : prescription
			},
			stack : true
		});
	} else {
		$.uihelper.getPhoto(true, didGetPhoto, $.window);
	}
}

function didGetPhoto(blob) {
	/**
	 * android may show the image from cache
	 * so send the blob
	 */
	
	var smallBlob;
	var maxDimension = 550;
	if (blob.getHeight() > maxDimension || blob.getWidth() > maxDimension) {
		var img_aspect_ratio = blob.getHeight()/blob.getWidth();
		var scaledHeight, scaledWidth;
		if (img_aspect_ratio > 1) {
			scaledHeight = maxDimension;
			scaledWidth = scaledHeight / img_aspect_ratio;
		} else {
			scaledWidth = maxDimension;
			scaledHeight = scaledWidth * img_aspect_ratio;
		}
		var tempBlob = blob.imageAsResized(scaledWidth, scaledHeight);
		smallBlob = tempBlob.imageAsCompressed(0.7);
		var imgFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "transfer.jpg");
		$.utilities.writeFile(imgFile, smallBlob, false);
		$.prescImg.image = smallBlob;
		tempBlob = null;
	} else {
		var imgFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "transfer.jpg");
		$.utilities.writeFile(imgFile, blob, false);
		$.prescImg.image = blob;
	} 
	
	blob = imgFile = smallBlob = null;
}

function focus() {
	var user = args.user;
	if (user) {
		$.userNameLbl.text = user.fname + " " + user.lname;
		$.dobLbl.text = String.format($.strings.transferReviewLblDob, moment(user.dob).format(Alloy.CFG.date_format));
		$.phoneLbl.text = $.utilities.formatPhoneNumber(user.phone);
	}
	var prescription = args.prescription;
	if (prescription) {
		$.prescNameLbl.text = prescription.name;
		if (prescription.rx) {
			$.rxLbl.text = prescription.rx;
		} else {
			/**
			 *  to avoid the empty space
			 * left for
			 */
			$.rxLbl.applyProperties({
				top : 0,
				height : 0
			});
		}
	} else {
		/**
		 * image path is used throughout this module
		 * should not be changed
		 */
		$.prescImg.image = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "transfer.jpg").read();
	}
	/**
	 * if phone_formatted is undefined
	 * or if shouldUpdate is true
	 * call api for further store information
	 */
	var store = args.store;
	if (store.shouldUpdate || !store.phone_formatted) {
		$.http.request({
			method : "stores_get",
			params : {
				data : [{
					stores : {
						id : store.id,
					}
				}]
			},
			forceRetry : true,
			success : didGetStore
		});
	} else {
		updateStore();
	}
}

function didGetStore(result, passthrough) {
	var store = args.store;
	_.extend(store, result.data.stores);
	_.extend(store, {
		storeName : $.utilities.ucword(store.store_name),
		phone_formatted : $.utilities.formatPhoneNumber(store.phone)
	});
	delete store.shouldUpdate;
	updateStore();
}

function updateStore() {
	var store = args.store;
	$.storeNameLbl.text = store.storeName;
	$.storeTitleLbl.text = store.title;
	$.storeSubtitleLbl.text = store.subtitle;
	$.storePhoneAttr.setHtml(String.format($.strings.attrPhone, store.phone_formatted));
}

function didClickPhone(e) {
	if (!Titanium.Contacts.hasContactsPermissions()) {
		Titanium.Contacts.requestContactsPermissions(function(result) {
			if (result.success) {
				contactsHandler();
			} else {
				$.analyticsHandler.trackEvent("TransferRx-TransferReview", "click", "DeniedContactsPermission");
			}
		});
	} else {
		contactsHandler();
	}
}

function contactsHandler() {
	var store = args.store;
	$.uihelper.getPhone({
		firstName : store.title,
		phone : {
			work : [store.phone_formatted]
		}
	}, store.phone);
}

exports.init = init;
exports.focus = focus;
