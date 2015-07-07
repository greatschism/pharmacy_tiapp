var args = arguments[0] || {},
    moment = require("alloy/moment");

function init() {
	$.titleLbl.text = args.title;
	var refillsLeft = parseInt(args.refill_left || 0);
	$.addClass($.refillsLeftBtn, [refillsLeft > Alloy.CFG.prescription_negative_refills_left ? "info-btn" : "info-negative-btn"], {
		title : refillsLeft
	});
	$.dueBtn.title = args.anticipated_refill_date ? moment(args.anticipated_refill_date, Alloy.CFG.apiCodes.date_format).format(Alloy.CFG.date_format) : Alloy.Globals.strings.strNil;
	$.lastRefillBtn.title = args.latest_sold_date ? moment(args.latest_sold_date, Alloy.CFG.apiCodes.date_time_format).format(Alloy.CFG.date_format) : Alloy.Globals.strings.strNil;
	if (!_.has(args, "store")) {
		$.http.request({
			method : "prescriptions_get",
			params : {
				feature_code : "THXXX",
				data : [{
					prescriptions : {
						id : args.id,
						sort_order_preferences : Alloy.Models.sortOrderPreferences.get("selected_code_value"),
						prescription_display_status : Alloy.CFG.apiCodes.prescription_display_status_active
					}
				}]
			},
			showLoader : false,
			errorDialogEnabled : false,
			success : didGetPrescription
		});
	} else {
		loadPresecription();
		loadDoctor();
		loadStore();
	}
	setTimeout(hideLoader, 1000);
}

function hideLoader() {
	$.loader.hide();
}

function didGetPrescription(result, passthrough) {
	_.extend(args, result.data.prescriptions[0]);
	args.dosage_instruction_message = $.utilities.ucfirst(args.dosage_instruction_message || Alloy.Globals.strings.strNotAvailable);
	loadPresecription();
	$.http.request({
		method : "doctors_get",
		params : {
			feature_code : "THXXX",
			data : [{
				doctors : {
					id : args.doctor_id,
				}
			}]
		},
		showLoader : false,
		errorDialogEnabled : false,
		success : didGetDoctor
	});
}

function didGetDoctor(result, passthrough) {
	args.doctor = {};
	_.extend(args.doctor, result.data.doctors);
	args.doctor.title = Alloy.Globals.strings.strDoctorPrefix.concat($.utilities.ucword(args.doctor.first_name) + " " + $.utilities.ucword(args.doctor.last_name));
	loadDoctor();
	$.http.request({
		method : "stores_get",
		params : {
			feature_code : "THXXX",
			data : [{
				stores : {
					id : args.original_store_id,
				}
			}]
		},
		showLoader : false,
		errorDialogEnabled : false,
		success : didGetStore
	});
}

function didGetStore(result, passthrough) {
	args.store = {};
	_.extend(args.store, result.data.stores);
	_.extend(args.store, {
		title : $.utilities.ucword(args.store.addressline1),
		subtitle : $.utilities.ucword(args.store.city) + ", " + args.store.state + ", " + $.utilities.ucword(args.store.zip)
	});
	loadStore();
}

function loadPresecription() {
	$.instructionAsyncView.hide();
	$.instructionExp.setStopListening(true);
	$.prescInstructionLbl.text = args.dosage_instruction_message;
}

function loadDoctor() {
	$.noReplyLbl.text = args.rx_number;
	$.expiryReplyLbl.text = moment(args.expiration_date, Alloy.CFG.apiCodes.date_format).format(Alloy.CFG.date_format);
	$.doctorReplyLbl.text = args.doctor.title;
}

function loadStore() {
	$.prescAsyncView.hide();
	$.prescExp.setStopListening(true);
	$.storeReplyLbl.text = args.store.title + "\n" + args.store.subtitle;
}

function didClickStore(e) {
	$.uihelper.getDirection({
		latitude : args.store.latitude,
		longitude : args.store.longitude
	});
}

function togglePrescription(e) {
	var title,
	    result;
	if ($.prescExp.isExpanded()) {
		title = "btnShowMore";
		result = $.prescExp.collapse();
	} else {
		title = "btnShowLess";
		result = $.prescExp.expand();
	}
	if (result) {
		$.toggleBtn.title = Alloy.Globals.strings[title];
	}
}

function toggleInstruction(e) {
	var classes,
	    result;
	if ($.instructionExp.isExpanded()) {
		classes = ["content-down-icon"];
		result = $.instructionExp.collapse();
	} else {
		classes = ["content-up-icon"];
		result = $.instructionExp.expand();
	}
	if (result) {
		$.resetClass($.arrowLbl, classes);
	}
}

function didClickRefill(e) {
	$.app.navigator.open({
		titleid : "titleOrderDetails",
		ctrl : "orderDetails",
		ctrlArguments : {
			prescriptions : [args]
		},
		stack : true
	});
}

function didClickHide(e) {
	$.http.request({
		method : "prescriptions_hide",
		params : {
			feature_code : "THXXX",
			data : [{
				prescriptions : [{
					id : args.id
				}]
			}]
		},
		success : function() {
			//triggers a reload when prescription list is focused
			args.hidden = true;
			$.app.navigator.close();
		}
	});
}

exports.init = init;
