var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    http = require("requestwrapper"),
    dialog = require("dialog"),
    timeDetails,
    timed,
    reminders;

(function() {
	/*if (args.edit) {
	 $.deleteBtn.show();
	 }*/
	
	reminders=args.reminders;
	appointment=args.appointment;
	console.log(reminders);
	
	var data = [];
	for(i=1;i<=30;i++){
		data[i-1] = Ti.UI.createPickerRow({
		title : i.toString()
	});
	}
	$.dayPicker.add(data);
	
	day = _.findWhere(data, {
				title : reminders.remind_before_in_days
			});
			
	$.dayPicker.setSelectedRow(0,(day.title)-1,false);		

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

	myDate= new Date();
	myDate.setHours(newReminderHour,reminders.reminder_minute);
	$.timePicker.setValue(myDate);
	console.log(myDate);

	
})();

function didClickSave(e) {
	timeDetails = $.timePicker.getValue();

	http.request({
		method : "APPOINTMENTS_REMINDERS_UPDATE",
		data : {
			filter : [{
				type : ""
			}],
			"data" : {
				"appointment" : {
					"reminders" : {
						"enabled" : "0/1",
						"no_of_reminders" : "",
						"remind_before_in_days" : $.dayPicker.getSelectedRow(0).title,
						"reminder_hour" : moment(timeDetails).format("hh"),
						"reminder_minute" : moment(timeDetails).format("mm"),
						"reminder_meridiem" : moment(timeDetails).format("A")
					}
				}
			}
		},
		success : didSaveSuccess
	});

}

function didSaveSuccess(_result) {
	dialog.show({
		title : Alloy.Globals.strings.titleSuccess,
		message : Alloy.Globals.strings.msgAppointmentReminderSettingsUpdated,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.close();
		}
	});
}

