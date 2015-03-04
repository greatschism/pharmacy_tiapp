var args = arguments[0] || {},
    moment = require("alloy/moment"),
    moment1 = require("alloy/moment"),
    app = require("core"),
    http = require("requestwrapper"),
    dialog = require("dialog"),
    dateDetails,
    timeDetails,
    appointmentDate,
    appointmentTime,
    editFlag = false,
    doctorId,
    appointment,
    shortName;

(function() {
	doctorId = args.doctorId;
	shortName = args.short_name;

	if (args.edit) {
		console.log("edit there");
		editFlag = true;
		appointment = args.appointment;
		$.dateLbl.setValue(new Date(appointment.appointment_date));
		
		
		if(appointment.appointment_meridiem=="pm" || appointment.appointment_meridiem=="PM")
		newAppointmentHour=parseInt(appointment.appointment_hour)+12;
		else
		newAppointmentHour=appointment.appointment_hour;
		
		myDate= new Date();
		myDate.setHours(newAppointmentHour,appointment.appointment_minute);
		$.timePicker.setValue(myDate);
		console.log(myDate);
		
		$.deleteLbl.show();
	} else {
		$.deleteLbl.hide();
	}

	$.dateLbl.setMinDate(new Date());
	$.dateLbl.setMaxDate(new Date("December 31, 2017"));
	
})();

function didItemClick(e) {

}

function setParentViews(view) {
	$.dateLbl.setParentView(view);
}


function didClickSave(e) {
	dateDetails = $.dateLbl.getValue();
	appointmentDate=moment(dateDetails).format("YYYY-MM-DD");
	
	timeDetails=  $.timePicker.getValue();
	appointmentTime=moment1(timeDetails).format("hh:mm A");
	
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
						"appointment_date" : appointmentDate,
						"appointment_hour" : moment1(timeDetails).format("hh"),
						"appointment_minute" : moment1(timeDetails).format("mm"),
						"appointment_meridiem" : moment1(timeDetails).format("A"),
						"reminders" : {
							"enabled" : "0/1",
							"no_of_reminders" : "x",
							"remind_before_in_days" : "x",
							"reminder_hour" : "x",
							"reminder_minute" : "x",
							"reminder_meridiem" : "AM/PM"
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
							"enabled" : "0/1",
							"no_of_reminders" : "x",
							"remind_before_in_days" : "x",
							"reminder_hour" : "x",
							"reminder_minute" : "x",
							"reminder_meridiem" : "AM/PM"
						}
					}
				}
			},
			success : didAddSuccess
		});
	}
}

function didEditSuccess(_result) {
	//alert("edit success");
	var appointmentDetails = String.format(Alloy.Globals.strings.msgAppointmentReminder, shortName, appointmentDate, appointmentTime);
	dialog.show({
		title : Alloy.Globals.strings.titleSuccess,
		message : appointmentDetails,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

function didAddSuccess(_result) {
	var appointmentDetails = String.format(Alloy.Globals.strings.msgAppointmentReminder, shortName, appointmentDate, appointmentTime);
	dialog.show({
		title : Alloy.Globals.strings.titleSuccess,
		message : appointmentDetails,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}


function didClickEditButton(e) {
	app.navigator.open({
		stack : true,
		titleid : "tittleDoctorReminderSettings",
		ctrl : "editReminder",
			ctrlArguments : {
					reminders: appointment.reminders
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

function didSuccessDelete(e)
{
	dialog.show({
		title : Alloy.Globals.strings.titleSuccess,
		message : Alloy.Globals.strings.msgAppointmentDeleted,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

exports.setParentViews = setParentViews;
