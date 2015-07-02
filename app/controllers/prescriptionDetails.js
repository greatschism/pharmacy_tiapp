var args = arguments[0] || {};

function init() {
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
		loadData();
	}
}

function didGetPrescription(result, passthrough) {
	_.extend(args, result.data.prescriptions[0]);
	args.dosage_instruction_message = $.utilities.ucfirst(args.dosage_instruction_message || Alloy.Globals.strings.strNotAvailable);
	loadData();
	/*$.http.request({
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
	 });*/
}

function didGetDoctor(result, passthrough) {
	args.doctor = {};
	_.extend(args.doctor, result.data.doctors);
	loadData();
}

function loadData() {
	$.instructionAsyncView.hide();
	$.instructionExp.setStopListening(true);
	$.prescInstructionLbl.text = args.dosage_instruction_message;
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

function toggleInstruction(e) {
	var icon,
	    result;
	if ($.instructionExp.isExpanded()) {
		icon = Alloy.CFG.icons.arrow_down;
		result = $.instructionExp.collapse();
	} else {
		icon = Alloy.CFG.icons.arrow_up;
		result = $.instructionExp.expand();
	}
	if (result) {
		$.arrowLbl.text = icon;
	}
}

exports.init = init;
