var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    prescription,
    patientName,
    doctor,
    doctorId,
    clicks = 0,
    dosageInstructionClicks = 0,
    contentView,
    presriptionView,
    expirationView,
    doctorView,
    pharmacyView,
    prescriptionNoLbl,
    prescriptionNoDetails,
    expirationDateLbl,
    expirationDateDetails,
    doctorNameLbl,
    doctorNameDetails,
    pharmacyLbl,
    pharmacyDetails,
    detailsView;

function init() {
	prescription = args.prescription || {};
	patientName = args.patientName || "";
	doctorId = args.doctorId || "";
	console.log(doctorId);
	http.request({
		method : "DOCTORS_GET",
		data : {
			data : [{
				doctors : {
					id : doctorId,
				}
			}]
		},
		success : didGetDoctor
	});
}

function didGetDoctor(_result) {
	doctor = _.isEmpty(_result) ? require("data/stubs").DOCTORS_LIST.data.doctors[0] : _result.data.doctors;
	$.prescriptionNameLbl.text = prescription.presc_name;
	$.refillLeftInfoLbl.text = prescription.refill_remaining_preferences || 1;
	$.dueForRefillInfoLbl.text = prescription.anticipated_refill_date ? moment(prescription.anticipated_refill_date, Alloy.CFG.apiCodes.DATE_FORMAT).format(Alloy.CFG.DATE_FORMAT) : moment().add(30, "days").format(Alloy.CFG.DATE_FORMAT);
	$.lastRefillInfoLbl.text = moment(prescription.latest_refill_completed_date || "03-21-2015 11:30 AM", Alloy.CFG.apiCodes.DATE_TIME_FORMAT).format(Alloy.CFG.DATE_FORMAT);
	$.autoRefillSwt.setValue(true);
	$.remindMeToRefillSwt.setValue(true);
	$.setTimeSwt.setValue(true);
	createDetailsView();
}

function didClickRefillHistory() {
	app.navigator.open({
		ctrl : "refillHistory",
		titleid : "titleRefillHistory",
		ctrlArguments : {
			prescription : prescription.presc_name
		},
		stack : true
	});
}

function didClickRefillPrescription() {
	app.navigator.open({
		ctrl : "orderDetails",
		titleid : "titleOrderDetails",
		ctrlArguments : {
			prescription : prescription,
			patientName : patientName
		},
		stack : true
	});

}

function didClickExpand() {

	if (clicks % 2 == 0) {

		createDetailsView();
		$.detailsView.add(contentView);
		clicks++;
	} else {

		clicks++;
		$.detailsView.remove(contentView);
	}

}


function createDetailsView() {
	contentView = $.UI.create("View", {
		apiName : "View",
		classes : ["auto-height", "paddingTop", "vgroup", "padding-left", "#000"]
	}),
	presriptionView = $.UI.create("View", {
		apiName : "View",
		classes : ["auto-height", "hgroup"]
	}),
	expirationView = $.UI.create("View", {
		apiName : "View",
		classes : ["auto-height", "hgroup", "padding-top"]
	}),
	doctorView = $.UI.create("View", {
		apiName : "View",
		classes : ["auto-height", "hgroup", "padding-top"]
	}),
	pharmacyView = $.UI.create("View", {
		apiName : "View",
		classes : ["auto-height", "hgroup", "padding-top", "padding-bottom"]
	}),
	prescriptionNoLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["s3", "left"],
		text : strings.lblPrescriptionNumber
	}),
	expirationDateLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["s3", "left"],
		text : strings.lblExpirationDate
	}),
	doctorNameLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["s3", "left"],
		text : strings.lblDoctor
	}),
	pharmacyLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["s3", "left"],
		text : strings.lblPharmacy
	}),
	prescriptionNoDetails = $.UI.create("Label", {
		apiName : "Label",
		classes : ["s7"]
	}),
	expirationDateDetails = $.UI.create("Label", {
		apiName : "Label",
		classes : ["s7"]
	}),
	doctorNameDetails = $.UI.create("Label", {
		apiName : "Label",
		classes : ["s7"]
	}),
	pharmacyDetails = $.UI.create("Label", {
		apiName : "Label",
		classes : ["s13"]
	});

	prescriptionNoDetails.text = prescription.rx_number;
	expirationDateDetails.text = (prescription.expiration_date ? moment(prescription.expiration_date, Alloy.CFG.apiCodes.DATE_FORMAT) : moment().add(100, "days")).format(Alloy.CFG.DATE_FORMAT);
	doctorNameDetails.text = "Dr. " + (doctor.last_name || "Hareesh");
	pharmacyDetails.text = "Walmart Pharmacy #3030";

	presriptionView.add(prescriptionNoLbl);
	presriptionView.add(prescriptionNoDetails);

	expirationView.add(expirationDateLbl);
	expirationView.add(expirationDateDetails);

	doctorView.add(doctorNameLbl);
	doctorView.add(doctorNameDetails);

	pharmacyView.add(pharmacyLbl);
	pharmacyView.add(pharmacyDetails);

	contentView.add(presriptionView);
	contentView.add(expirationView);
	contentView.add(doctorView);
	contentView.add(pharmacyView);

}

function didClickHidePrescription() {
	http.request({
		method : "PRESCRIPTIONS_HIDE",
		data : {
			data : [{
				prescriptions : [prescription]
			}]
		},
		success : function() {
			Ti.App.fireEvent("reload");
			app.navigator.close();
		},
	});
}

exports.init = init;
