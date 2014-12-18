var args = arguments[0] || {},
    doctor = args.doctor,
    utilities = require("utilities"),
    moment = require("alloy/moment"),
    http = require("httpwrapper"),
    PRESCRIPTION_COUNT = 4;

function init() {
	$.profileImg.image = doctor.thumbnail_url;
	$.nameLbl.text = doctor.long_name;
	http.request({
		path : "doctors/get",
		keepBlook : true,
		dataTransform : false,
		format : "JSON",
		data : {},
		success : didSuccess
	});
}

function didSuccess(result) {
	_.extend(doctor, result.data[0].doctors);
	$.phoneLbl.text = doctor.phone;
	$.faxLbl.text = doctor.fax;
	$.orgLbl.text = doctor.org_name;
	$.addressLbl.text = doctor.addressline1;
	$.zipLbl.text = doctor.city + ", " + doctor.state + ", " + doctor.zip;
	$.notesTxta.setValue(doctor.notes);
	var len = doctor.prescriptions.length,
	    prescriptions;
	if (len > PRESCRIPTION_COUNT) {
		var footerView = $.UI.create("View", {
			apiName : "View",
			classes : ["bg-quinary"]
		}),
		    containerView = $.UI.create("View", {
			apiName : "View",
			classes : ["auto", "hgroup", "touch-disabled"]
		}),
		    moreIcon = $.UI.create("Label", {
			apiName : "Label",
			classes : ["font-icon-tiny", "color-secondary", "touch-disabled"],
			id : "moreIcon"
		}),
		    moreLbl = $.UI.create("Label", {
			apiName : "Label",
			classes : ["padding-left", "h4", "color-secondary", "touch-disabled"],
			id : "moreLbl"
		});
		footerView.height = 30;
		containerView.add(moreIcon);
		containerView.add(moreLbl);
		footerView.add(containerView);
		footerView.addEventListener("click", didClickMore);
		$.tableView.footerView = footerView;
	}
	if (len == 0) {
		prescriptions = [{
			title : Alloy.Globals.strings.msgNoActiveprescription
		}];
	} else {
		prescriptions = _.first(doctor.prescriptions, PRESCRIPTION_COUNT);
	}
	loadPrescriptions(prescriptions);
	$.tableView.data = $.tableView.data;
}

function didClickMore(e) {
	loadPrescriptions(_.last(doctor.prescriptions, doctor.prescriptions.length - PRESCRIPTION_COUNT));
	$.tableView.footerView = $.UI.create("View", {
		classes : ["auto"]
	});
}

function loadPrescriptions(prescriptions) {
	if (!$.prescriptionsSection) {
		$.prescriptionsSection = utilities.createTableViewSection(Alloy.Globals.strings.strPrescriptions);
		for (var i in prescriptions) {
			$.prescriptionsSection.add(getRow(prescriptions[i]));
		}
		$.tableView.data = [$.prescriptionsSection];
	} else {
		for (var i in prescriptions) {
			$.tableView.appendRow(getRow(prescriptions[i]));
		}
	}
}

function getRow(prescription) {
	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),
	    view = $.UI.create("View", {
		apiName : "View",
		classes : ["list-item-view"]
	}),
	    leftLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["left", "width-45", "h5", "color-secondary"]
	}),
	    rightLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["right", "width-45", "h5", "text-right", "color-secondary"]
	});
	leftLbl.text = prescription.prescription_name;
	rightLbl.text = prescription.last_refill ? Alloy.Globals.strings.lblLastRefilled.concat(": " + moment(prescription.last_refill, "YYYY-MM-DD HH:mm").format("D/M/YY")) : Alloy.Globals.strings.msgNotFilledYet;
	view.add(leftLbl);
	view.add(rightLbl);
	row.add(view);
	return row;
}

function didClickProfileImg(e) {
	$.photoDialog.show();
}

function didClickHideDoctor(e) {

}

function didClickOption(e) {
	console.log(e);
}

function didClickEdit(e) {

}

exports.init = init;
