var args = arguments[0] || {},
    moment = require("alloy/moment");

function init() {
	$.titleLbl.text = args.title;
	var lastRefillDate = args.latest_refill_completed_date || args.latest_refill_promised_date || args.latest_refill_requested_date;
	if (lastRefillDate) {
		$.lastRefillBtn.title = moment(lastRefillDate, Alloy.CFG.apiCodes.date_time_format).format(Alloy.CFG.date_format);
	} else {
		$.lastRefillBtn.hide();
	}
	if (args.anticipated_refill_date) {
		$.dueBtn.title = moment(args.anticipated_refill_date, Alloy.CFG.apiCodes.date_format).format(Alloy.CFG.date_format);
	} else {
		$.dueBtn.hide();
	}
	var refillsLeft = parseInt(args.refill_left || 0);
	if (refillsLeft <= Alloy.CFG.prescription_negative_refills_left) {
		$.resetClass($.refillsLeftBtn, ["info-negative-btn"]);
	}
	$.refillsLeftBtn.title = refillsLeft;
	$.prescExp.applyProperties({
		height : $.uihelper.getHeightFromChildren($.prescContentView, true)
	});
	$.instructionExp.applyProperties({
		height : $.uihelper.getHeightFromChildren($.instructionContentView, true)
	});
	if (!_.has(args, "doctor")) {
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
	}
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
	loadDoctor();
}

function loadPresecription() {
	$.instructionAsyncView.hide();
	$.instructionExp.setStopListening(true);
	$.prescInstructionLbl.text = args.dosage_instruction_message;
}

function loadDoctor() {

}

function togglePrescription(e) {

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
