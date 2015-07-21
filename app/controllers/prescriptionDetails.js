var args = arguments[0] || {},
    moment = require("alloy/moment"),
    prescription = args.prescription,
    httpClient;

function init() {
	$.titleLbl.text = prescription.title;
	var refillsLeft = parseInt(prescription.refill_left || 0);
	$.addClass($.refillsLeftBtn, [refillsLeft > Alloy.CFG.prescription_refills_left_info_negative ? "info-btn" : "info-negative-btn"], {
		title : refillsLeft
	});
	$.dueBtn.title = prescription.anticipated_refill_date ? moment(prescription.anticipated_refill_date, Alloy.CFG.apiCodes.date_format).format(Alloy.CFG.date_format) : $.strings.strNil;
	$.lastRefillBtn.title = prescription.latest_sold_date ? moment(prescription.latest_sold_date, Alloy.CFG.apiCodes.date_time_format).format(Alloy.CFG.date_format) : $.strings.strNil;
	if (!_.has(prescription, "store")) {
		httpClient = $.http.request({
			method : "prescriptions_get",
			params : {
				feature_code : "THXXX",
				data : [{
					prescriptions : {
						id : prescription.id,
						sort_order_preferences : Alloy.Models.sortOrderPreferences.get("selected_code_value"),
						prescription_display_status : Alloy.CFG.apiCodes.prescription_display_status_active
					}
				}]
			},
			showLoader : false,
			success : didGetPrescription
		});
	} else {
		loadPresecription();
		loadDoctor();
		loadStore();
	}
	/**
	 * height has to be calculated and applied for expanable views only once the page is rendered
	 * this may cause jerk on screen, avoid it by showing a loader on init
	 */
	setTimeout(hideLoader, 1000);
}

function hideLoader() {
	$.loader.hide();
}

function didGetPrescription(result, passthrough) {
	_.extend(prescription, result.data.prescriptions);
	prescription.dosage_instruction_message = $.utilities.ucfirst(prescription.dosage_instruction_message || $.strings.strNotAvailable);
	loadPresecription();
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
	_.extend(prescription.doctor, result.data.doctors);
	prescription.doctor.title = $.strings.strPrefixDoctor.concat($.utilities.ucword(prescription.doctor.first_name) + " " + $.utilities.ucword(prescription.doctor.last_name));
	loadDoctor();
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
	_.extend(prescription.store, result.data.stores);
	_.extend(prescription.store, {
		title : $.utilities.ucword(prescription.store.addressline1),
		subtitle : $.utilities.ucword(prescription.store.city) + ", " + prescription.store.state + ", " + $.utilities.ucword(prescription.store.zip)
	});
	loadStore();
}

function loadPresecription() {
	$.instructionAsyncView.hide();
	$.instructionExp.setStopListening(true);
	$.prescInstructionLbl.text = prescription.dosage_instruction_message;
}

function loadDoctor() {
	$.noReplyLbl.text = prescription.rx_number;
	$.expiryReplyLbl.text = moment(prescription.expiration_date, Alloy.CFG.apiCodes.date_format).format(Alloy.CFG.date_format);
	$.doctorReplyLbl.text = prescription.doctor.title;
}

function loadStore() {
	$.prescAsyncView.hide();
	$.prescExp.setStopListening(true);
	$.storeReplyLbl.text = prescription.store.title + "\n" + prescription.store.subtitle;
}

function didClickStore(e) {
	$.app.navigator.open({
		titleid : "titleStoreDetails",
		ctrl : "storeDetails",
		ctrlArguments : {
			store : prescription.store
		},
		stack : true
	});
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
		success : function() {
			httpClient = null;
			//triggers a reload when prescription list is focused
			prescription.shouldUpdate = true;
			$.app.navigator.close();
		}
	});
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
exports.terminate = terminate;
