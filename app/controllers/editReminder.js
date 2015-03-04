var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    http = require("requestwrapper"),
    dialog = require("dialog"),
    timeDetails,
    timed,
    reminders,
    appointmentId;

(function() {
	/*if (args.edit) {
	 $.deleteBtn.show();
	 }*/

	var data = [];
	for ( i = 1; i <= 30; i++) {
		data[i - 1] = Ti.UI.createPickerRow({
			title : i.toString()
		});
	}

	$.dayPicker.add(data);
	
	//console.log(reminders);

	newAppointment = args.newAppointment;

	if (newAppointment == 0) {
		console.log("not new app");
		reminders = args.reminders;
		appointmentId = args.appointment_id;
	
		day = _.findWhere(data, {
			title : reminders.remind_before_in_days
		});

		$.dayPicker.setSelectedRow(0, (day.title) - 1, false);

		// cant set constraints to time picker
		/*
		 minDate= new Date();
		 minDate.setHours(7,00,00,00);
		 $.timePicker.setMinDate(minDate);
		 maxDate= new Date();
		 maxDate.setHours(23,00,00,00);
		 $.timePicker.setMaxDate(minDate);
		 */
		if (reminders.reminder_meridiem == "pm" || reminders.reminder_meridiem == "PM")
			newReminderHour = parseInt(reminders.reminder_hour) + 12;
		else
			newReminderHour = reminders.reminder_hour;

		myDate = new Date();
		myDate.setHours(newReminderHour, reminders.reminder_minute);
		$.timePicker.setValue(myDate);
		console.log(myDate);
	}

})();

function didClickSave(e) {
	timeDetails = $.timePicker.getValue();
	
	Alloy.Models.doctor.set({
			reminder_change : {
				"enabled" : "1",
				"no_of_reminders" : "1",
				"remind_before_in_days" : $.dayPicker.getSelectedRow(0).title,
				"reminder_hour" : moment(timeDetails).format("hh"),
				"reminder_minute" : moment(timeDetails).format("mm"),
				"reminder_meridiem" : moment(timeDetails).format("A")
			}
		});

	dialog.show({
		title : Alloy.Globals.strings.titleSuccess,
		message : Alloy.Globals.strings.msgAppointmentReminderSettingsUpdated,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.close();
		}
	});

}
