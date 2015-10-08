var args = arguments[0] || {},
    moment = require("alloy/moment"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    prescription = args.prescription,
    isWindowOpen,
    httpClient;

function init() {
	$.titleLbl.text = prescription.title;
	var refillsLeft = parseInt(prescription.refill_left || 0);
	$.addClass($.refillsLeftBtn, [refillsLeft > Alloy.CFG.prescription_refills_left_info_negative ? "info-btn" : "info-negative-btn"], {
		title : refillsLeft
	});
	$.dueBtn.title = prescription.anticipated_refill_date ? moment(prescription.anticipated_refill_date, apiCodes.date_format).format(Alloy.CFG.date_format) : $.strings.strNil;
	$.lastRefillBtn.title = prescription.latest_sold_date ? moment(prescription.latest_sold_date, apiCodes.date_time_format).format(Alloy.CFG.date_format) : $.strings.strNil;
	if (_.has(prescription, "store")) {
		loadPresecription();
		loadDoctor();
		loadStore();
	}
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		if (!_.has(prescription, "store")) {
			httpClient = $.http.request({
				method : "prescriptions_get",
				params : {
					feature_code : "THXXX",
					data : [{
						prescriptions : {
							id : prescription.id,
							sort_order_preferences : Alloy.Models.sortOrderPreferences.get("selected_code_value"),
							prescription_display_status : apiCodes.prescription_display_status_active
						}
					}]
				},
				showLoader : false,
				success : didGetPrescription
			});
		}
	}
}

function didGetPrescription(result, passthrough) {
	_.extend(prescription, result.data.prescriptions);
	/**
	 * all switches will be off
	 * by default
	 */
	//refill reminder
	if (prescription.is_refill_reminder_set === "1") {
		$.reminderRefillSwt.setValue(true);
	}
	//med reminder
	if (prescription.is_dosage_reminder_set === "1") {
		$.reminderMedSwt.setValue(true);
	}
	//dosage instruction
	prescription.dosage_instruction_message = $.utilities.ucfirst(prescription.dosage_instruction_message || $.strings.strNotAvailable);
	loadPresecription();
	/**
	 * docor_id can be null
	 */
	if (prescription.doctor_id) {
		getDoctor();
	} else {
		loadDoctor();
		getStore();
	}
}

function getDoctor() {
	httpClient = $.http.request({
		method : "doctors_get",
		params : {
			feature_code : "THXXX",
			data : [{
				doctors : {
					id : prescription.doctor_id,
				}
			}]
		},
		showLoader : false,
		success : didGetDoctor
	});
}

function didGetDoctor(result, passthrough) {
	prescription.doctor = {};
	var doctor = prescription.doctor;
	_.extend(doctor, result.data.doctors);
	/**
	 * image and defaultImage
	 * is required when user goes
	 * to doctor details from this screen
	 */
	var imageURL = doctor.image_url;
	_.extend(doctor, {
		title : $.strings.strPrefixDoctor.concat($.utilities.ucword(doctor.first_name) + " " + $.utilities.ucword(doctor.last_name)),
		image : imageURL && imageURL != "null" ? imageURL : "",
		defaultImage : $.uihelper.getImage("default_profile").image
	});
	loadDoctor();
	getStore();
}

function getStore() {
	httpClient = $.http.request({
		method : "stores_get",
		params : {
			feature_code : "THXXX",
			data : [{
				stores : {
					id : prescription.original_store_id,
				}
			}]
		},
		showLoader : false,
		success : didGetStore
	});
}

function didGetStore(result, passthrough) {
	httpClient = null;
	prescription.store = {};
	var store = prescription.store;
	_.extend(store, result.data.stores);
	_.extend(store, {
		title : $.utilities.ucword(store.addressline1),
		subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + $.utilities.ucword(store.zip)
	});
	loadStore();
}

function loadPresecription() {
	$.instructionAsyncView.hide();
	$.instructionExp.setStopListening(true);
	$.prescInstructionLbl.text = prescription.dosage_instruction_message;
}

function loadDoctor() {
	$.rxReplyLbl.text = prescription.rx_number;
	$.expiryReplyLbl.text = moment(prescription.expiration_date, apiCodes.date_format).format(Alloy.CFG.date_format);
	$.doctorReplyLbl.text = prescription.doctor ? prescription.doctor.title : $.strings.strNotAvailable;
}

function loadStore() {
	$.prescAsyncView.hide();
	$.prescExp.setStopListening(true);
	$.storeReplyLbl.text = prescription.store.title + "\n" + prescription.store.subtitle;
	/**
	 * Keep the expandable view opened
	 * by default (PHA-1086)
	 *
	 * &&
	 *
	 * height has to be calculated and applied for expanable views only once the page is rendered
	 * this may cause jerk on screen, avoid it by showing a loader on init
	 */
	setTimeout(didUpdateUI, 1000);
}

function didUpdateUI() {
	/**
	 * PHA-1086 - keep it expanded
	 * incase to revert:
	 * 1. Update the toggle
	 * (show more / less) title in xml
	 * 2. remove $.prescExp.expand();
	 * 3. keep only $.loader.hide();
	 * 4. move this setTimeout(didUpdateUI, 1000);
	 * to init
	 */
	$.prescExp.expand();
	$.loader.hide();
}

function didClickStore(e) {
	/**
	 * location has to be shared with store details
	 * this should be a parameter as based on the
	 * direction flag only the direction button will be visible
	 */
	$.uihelper.getLocation(didGetLocation, false, false);
}

function didGetLocation(userLocation) {
	$.app.navigator.open({
		titleid : "titleStoreDetails",
		ctrl : "storeDetails",
		ctrlArguments : {
			store : prescription.store,
			currentLocation : userLocation,
			direction : !_.isEmpty(userLocation)
		},
		stack : true
	});
}

function didClickDoctor(e) {
	/**
	 *  list of prescriptions should be available
	 *  as the only way for prescription details screen
	 *  is prescription list
	 */
	if (prescription.doctor) {
		var doctor = _.clone(prescription.doctor);
		doctor.prescriptions = [];
		Alloy.Collections.prescriptions.each(function(model) {
			if (model.get("doctor_id") == doctor.id) {
				doctor.prescriptions.push(model.toJSON());
			}
		});
		$.app.navigator.open({
			titleid : "titleDoctorDetails",
			ctrl : "doctorDetails",
			ctrlArguments : {
				doctor : doctor
			},
			stack : true
		});
	}
}

function togglePrescription(e) {
	var title,
	    result;
	if ($.prescExp.isExpanded()) {
		title = "prescDetExpand";
		result = $.prescExp.collapse();
	} else {
		title = "prescDetCollapse";
		result = $.prescExp.expand();
	}
	if (result) {
		$.toggleBtn.title = $.strings[title];
	}
}

function toggleInstruction(e) {
	var classes,
	    result;
	if ($.instructionExp.isExpanded()) {
		classes = ["icon-thin-arrow-down"];
		result = $.instructionExp.collapse();
	} else {
		classes = ["icon-thin-arrow-up"];
		result = $.instructionExp.expand();
	}
	if (result) {
		$.arrowLbl.applyProperties($.createStyle({
			classes : classes
		}));
	}
}

function didClickRefill(e) {
	rx.canRefill(prescription, didConfirmRefill);
}

function didConfirmRefill() {
	$.app.navigator.open({
		titleid : "titleOrderDetails",
		ctrl : "orderDetails",
		ctrlArguments : {
			prescriptions : [prescription]
		},
		stack : true
	});
}

function didClickHide(e) {
	$.uihelper.showDialog({
		message : String.format($.strings.prescDetMsgHideConfirm, prescription.title),
		buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
		cancelIndex : 1,
		success : didConfirmHide
	});
}

function didConfirmHide() {
	httpClient = $.http.request({
		method : "prescriptions_hide",
		params : {
			feature_code : "THXXX",
			data : [{
				prescriptions : [{
					id : prescription.id
				}]
			}]
		},
		success : didHidePrescription
	});
}

function didHidePrescription(result, passthrough) {
	httpClient = null;
	//triggers a reload when prescription list is focused
	prescription.shouldUpdate = true;
	$.app.navigator.close();
}

function showHistory(e) {
	$.app.navigator.open({
		titleid : "titleRefillHistory",
		ctrl : "refillHistory",
		ctrlArguments : {
			prescription : prescription
		},
		stack : true
	});
}

function terminate() {
	if (httpClient) {
		httpClient.abort();
	}
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
