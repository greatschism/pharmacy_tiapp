var args = arguments[0] || {},
    moment = require("alloy/moment"),
    moment1 = require("alloy/moment"),
    app = require("core"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    dateDetails,
    timeDetails,
    appointmentDate,
    appointmentTime,
    editFlag = false,
    doctorId,
    appointment,
    shortName,
    reminder;

function init() {

	Alloy.Models.doctor.on("change:reminder_change", didAddReminder);

	doctorId = args.doctorId;
	shortName = args.short_name;

	if (args.edit) {

		editFlag = true;
		appointment = args.appointment;
		$.dateLbl.setValue(new Date(appointment.appointment_date));

		if (appointment.appointment_meridiem == "pm" || appointment.appointment_meridiem == "PM")
			newAppointmentHour = parseInt(appointment.appointment_hour) + 12;
		else
			newAppointmentHour = appointment.appointment_hour;

		myDate = new Date();
		myDate.setHours(newAppointmentHour, appointment.appointment_minute);
		$.timeLbl.setValue(myDate);

		$.deleteLbl.show();

		reminder = {
			enabled : appointment.reminders.enable,
			no_of_reminders : appointment.reminders.no_of_reminders,
			remind_before_in_days : appointment.reminders.remind_before_in_days,
			reminder_hour : appointment.reminders.reminder_hour,
			reminder_minute : appointment.reminders.reminder_minute,
			reminder_meridiem : appointment.reminders.reminder_meridiem
		};

	} else {
		$.deleteLbl.hide();

		reminder = {
			enabled : "1",
			no_of_reminders : "1",
			remind_before_in_days : "1",
			reminder_hour : "07",
			reminder_minute : "00",
			reminder_meridiem : "AM"
		};

	}

	$.dateLbl.setMinDate(new Date());
	$.dateLbl.setMaxDate(new Date("December 31, 2017"));

}

function didItemClick(e) {

}

function setParentViews(view) {
	$.dateLbl.setParentView(view);
	$.timeLbl.setParentView(view);
}

function didClickSave(e) {
	dateDetails = $.dateLbl.getValue();
	appointmentDate = moment(dateDetails).format(Alloy.CFG.apiCodes.DATE_FORMAT);

	timeDetails = $.timeLbl.getValue();
	appointmentTime = moment1(timeDetails).format("hh:mm A");

	if (editFlag) {
		http.request({
			method : "APPOINTMENTS_UPDATE",
			data : {
				filter : [{
					type : ""
				}],
				data : {
					"appointment" : {
						"doctor_id" : doctorId,
						"appointment_id" : appointment.appointment_id,
						"appointment_date" : appointmentDate,
						"appointment_hour" : moment1(timeDetails).format("hh"),
						"appointment_minute" : moment1(timeDetails).format("mm"),
						"appointment_meridiem" : moment1(timeDetails).format("A"),
						"reminders" : {
							"enabled" : reminder.enabled,
							"no_of_reminders" : reminder.no_of_reminders,
							"remind_before_in_days" : reminder.remind_before_in_days,
							"reminder_hour" : reminder.reminder_hour,
							"reminder_minute" : reminder.reminder_minute,
							"reminder_meridiem" : reminder.reminder_meridiem
						}
					}
				}
			},
			success : didEditSuccess
		});

	} else {

		http.request({
			method : "APPOINTMENTS_ADD",
			data : {
				filter : [{
					type : ""
				}],
				data : {
					"appointment" : {
						"doctor_id" : doctorId,
						"appointment_date" : appointmentDate,
						"appointment_hour" : moment(timeDetails).format("hh"),
						"appointment_minute" : moment(timeDetails).format("mm"),
						"appointment_meridiem" : moment(timeDetails).format("A"),
						"reminders" : {
							"enabled" : reminder.enabled,
							"no_of_reminders" : reminder.no_of_reminders,
							"remind_before_in_days" : reminder.remind_before_in_days,
							"reminder_hour" : reminder.reminder_hour,
							"reminder_minute" : reminder.reminder_minute,
							"reminder_meridiem" : reminder.reminder_meridiem
						}
					}
				}
			},
			success : didAddSuccess
		});
	}
}

function didEditSuccess(result) {

	Alloy.Models.doctor.set({
		appointment_update : {
			"doctor_id" : doctorId,
			"appointment_id" : appointment.appointment_id,
			"appointment_date" : appointmentDate,
			"appointment_hour" : moment(timeDetails).format("hh"),
			"appointment_minute" : moment(timeDetails).format("mm"),
			"appointment_meridiem" : moment(timeDetails).format("A"),
			"reminders" : {
				"enabled" : reminder.enabled,
				"no_of_reminders" : reminder.no_of_reminders,
				"remind_before_in_days" : reminder.remind_before_in_days,
				"reminder_hour" : reminder.reminder_hour,
				"reminder_minute" : reminder.reminder_minute,
				"reminder_meridiem" : reminder.reminder_meridiem
			}
		}
	});

	var appointmentDetails = String.format(Alloy.Globals.strings.msgAppointmentReminder, shortName, appointmentDate, appointmentTime);
	uihelper.showDialog({
		title : Alloy.Globals.strings.titleSuccess,
		message : appointmentDetails,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

function didAddSuccess(result) {

	Alloy.Models.doctor.set({
		appointment_add : {
			"doctor_id" : doctorId,
			"appointment_id" : result.appointment_id,
			"appointment_date" : appointmentDate,
			"appointment_hour" : moment(timeDetails).format("hh"),
			"appointment_minute" : moment(timeDetails).format("mm"),
			"appointment_meridiem" : moment(timeDetails).format("A"),
			"reminders" : {
				"enabled" : reminder.enabled,
				"no_of_reminders" : reminder.no_of_reminders,
				"remind_before_in_days" : reminder.remind_before_in_days,
				"reminder_hour" : reminder.reminder_hour,
				"reminder_minute" : reminder.reminder_minute,
				"reminder_meridiem" : reminder.reminder_meridiem
			}
		}
	});

	var appointmentDetails = String.format(Alloy.Globals.strings.msgAppointmentReminder, shortName, appointmentDate, appointmentTime);
	uihelper.showDialog({
		title : Alloy.Globals.strings.titleSuccess,
		message : appointmentDetails,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

function didClickEditButton(e) {

	var appId;

	if (args.edit) {
		newAppointment = 0;
		appId = appointment.appointment_id;
	} else {
		newAppointment = 1;
		appId = "";
	}
	app.navigator.open({
		stack : true,
		titleid : "tittleDoctorReminderSettings",
		ctrl : "editReminder",
		ctrlArguments : {
			reminders : reminder,
			appointment_id : appId,
			newAppointment : newAppointment
		}
	});

}

function didClickDelete(e) {

	http.request({
		method : "APPOINTMENTS_DELETE",
		data : {
			filter : [{
				type : ""
			}],
			"data" : {
				"appointment" : {
					"appointment_id" : appointment.appointment_id
				}
			}
		},
		success : didSuccessDelete
	});
}

function didSuccessDelete(e) {

	Alloy.Models.doctor.set({
		appointment_delete : {
			"index" : args.index
		}
	});

	uihelper.showDialog({
		title : Alloy.Globals.strings.titleSuccess,
		message : Alloy.Globals.strings.msgAppointmentDeleted,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

function terminate() {
	Alloy.Models.doctor.off("change:reminder_change", didAddReminder);
}

function didAddReminder() {

	var newReminder = Alloy.Models.doctor.get("reminder_change");

	reminder = {
		enabled : newReminder.enabled,
		no_of_reminders : newReminder.no_of_reminders,
		remind_before_in_days : newReminder.remind_before_in_days,
		reminder_hour : newReminder.reminder_hour,
		reminder_minute : newReminder.reminder_minute,
		reminder_meridiem : newReminder.reminder_meridiem
	};

}

exports.init = init;
exports.setParentViews = setParentViews;
