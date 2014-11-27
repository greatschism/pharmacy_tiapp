var args = arguments[0] || {},
    app = require("core"),
    moment = require("alloy/moment"),
    http = require("httpwrapper"),
    dialog = require("dialog"),
    msgHasPrescribedYou = Alloy.Globals.Strings.msgHasPrescribedYou,
    msgYouHaveNoActiveprescription = Alloy.Globals.Strings.msgYouHaveNoActiveprescription,
    strAnd = Alloy.Globals.Strings.strAnd,
    strMore = Alloy.Globals.Strings.strMore,
    doctors,
    prescriptions,
    appointments;

function init() {
	startTime = moment();
	http.request({
		url : "http://10.10.10.20:9000/services-demo/services/doctors/list",
		keepBlook : true,
		dataTransform : false,
		format : "JSON",
		data : {},
		success : didReceiveDoctors
	});
}

function didReceiveDoctors(result) {
	doctors = result.data[0].doctors;
	startPre = moment();
	http.request({
		url : "http://10.10.10.20:9000/services-demo/services/prescriptions/list",
		keepBlook : true,
		dataTransform : false,
		format : "JSON",
		data : {},
		success : didReceivePrescriptions
	});
}

function didReceivePrescriptions(result) {
	prescriptions = result.data[0].prescriptions;
	startApp = moment();
	http.request({
		url : "http://10.10.10.20:9000/services-demo/services/appointments/get",
		keepBlook : true,
		dataTransform : false,
		format : "JSON",
		data : {},
		success : didReceiveAppointments
	});
}

function didReceiveAppointments(result) {
	appointments = result.data.appointment;
	for (var i in doctors) {
		var doctor = doctors[i];
		doctor.short_name = "Dr. " + doctor.last_name;
		doctor.long_name = "Dr. " + doctor.first_name + " " + doctor.last_name;
		doctor.thumbnail_url = "/images/profile.png";
		var docPrescriptions = _.where(prescriptions, {
			doctor_id : doctor.id
		});
		for (var j in docPrescriptions) {
			docPrescriptions[j].lastRefill = moment(docPrescriptions[j].presc_last_filled_date, "YYYY/MM/DD").format("MM/DD/YYYY");
		}
		doctor.prescriptions = docPrescriptions;
	}
	var msg = Alloy.Globals.Strings.msgYouHaveUpcomingAppointmentWith;
	for (var i in appointments) {
		var appointment = appointments[i];
		var doctor = _.where(doctors, {
		id : appointment.doctor_id
		})[0];
		appointment.thumbnail_url = doctor.thumbnail_url;
		appointment.time = moment(appointment.appointment_time, "YYYY-MM-DD HH:mm").format("MMMM Do [at] h.mm A");
		appointment.desc = String.format(msg, doctor.short_name);
	}
	Alloy.Collections.appointments.reset(appointments);
	Alloy.Collections.doctors.reset(doctors);
	doctos = prescriptions = appointments = null;
	app.navigator.hideLoader();
}

function transformAppointment(model) {
	var transform = model.toJSON();
	if (OS_IOS) {
		var text = transform.desc + " " + transform.time;
		var len = transform.desc.length;
		transform.title = Ti.UI.iOS.createAttributedString({
			text : text,
			attributes : [{
				type : Titanium.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
				value : "#8b8b8b",
				range : [0, len]
			}, {
				type : Titanium.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
				value : "#F79538",
				range : [len + 1, transform.time.length]
			}]
		});
	} else {
		transform.title = transform.desc + " <font color=\"#F79538\">" + transform.time + "</font>";
	}
	return transform;
}

function transformDoctor(model) {
	/**
	 * Description format
	 * 0 drugs You have no active prescriptions associated with Dr. [LASTNAME]
	 * 1 drug Dr.[NAME] has prescribed you [DRUGNAME].
	 * 2 drugs Dr. [LASTNAME] has prescribed you [DRUGNAME] and [DRUGNAME].
	 * 3 drugs Dr. [LASTNAME] has prescribed you [DRUGNAME], [DRUGNAME] and [DRUGNAME].
	 * 4 or more Dr. [LASTNAME] has prescribed you [DRUGNAME], [DRUGNAME], and [X] more.
	 */
	var transform = model.toJSON();
	prescriptions = transform.prescriptions,
	description = "",
	len = prescriptions.length;
	if (len) {
		//When len is > 0
		description = String.format(msgHasPrescribedYou, transform.short_name, prescriptions[0].presc_name);
		if (len > 1) {
			//when > 1 and switch case used for defining when it is == 2, ==3 and > 3
			switch(len) {
			case 2:
				description += " " + strAnd + " " + prescriptions[1].presc_name;
				break;
			case 3:
				description += ", " + prescriptions[1].presc_name + " " + strAnd + " " + prescriptions[2].presc_name;
				break;
			default:
				description += ", " + prescriptions[1].presc_name + " " + strAnd + " [" + (len - 2) + "] " + strMore;
			}
		}
	} else {
		//When len is 0
		description = String.format(msgYouHaveNoActiveprescription, transform.short_name);
	}
	description += ".";
	transform.description = description;
	return transform;
}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e) {
	console.log(e);
}

function didItemClick(e) {
	var itemId = OS_MOBILEWEB ? e.row.rowId : e.itemId;
	var section = OS_MOBILEWEB ? ($[e.row.rowTable]) : e.section;
	if (section == $.appointmentSection) {
		app.navigator.open({
			stack : true,
			titleid : "titleEditReminder",
			ctrl : "chooseTime",
			ctrlArguments : {
				itemId : itemId,
				edit : true
			}
		});
	} else {
		//doctorSection
		var bindId = OS_MOBILEWEB ? e.source.bindId : e.bindId;
		if (bindId == "profile") {
			$.photoDialog.itemId = itemId;
			$.photoDialog.show();
		} else {
			var doctor = Alloy.Collections.doctors.where({
			id: itemId
			})[0].toJSON();
			app.navigator.open({
				stack : true,
				title : doctor.short_name,
				ctrl : "doctorDetails",
				ctrlArguments : {
					doctor : doctor
				}
			});
		}
	}
}

function didClickAddDoctor(e) {
	app.navigator.open({
		stack : true,
		titleid : "titleAddDoctor",
		ctrl : "addDoctor"
	});
}

function didClickOption(e) {
	console.log(e);
}

function openCamera() {

}

function openGallery() {

}

function didClickSetAppointment(e) {
	app.navigator.open({
		stack : true,
		titleid : "titleChooseDoctor",
		ctrl : "chooseDoctor"
	});
}

function terminate() {
	$.destroy();
}

function didAndroidBack() {
	return $.toggleMenu.hide();
}

exports.init = init;
exports.terminate = terminate;
exports.androidback = didAndroidBack;
