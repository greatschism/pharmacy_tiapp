var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    reminders,
    reminderfrequency,
    dialog,
    dosageReminderTime1,
    dosageReminderTime2,
    dosageReminderTime3;
var optionsArray = ['daily', 'twice daily', 'thrice daily'];

function setTimer(index) {
	var timeDetails = Ti.App.Properties.getString("dosageReminderTime" + index);
	var appointment_hour = moment(timeDetails, "hh:mm A").format("hh");
	var appointment_minute = moment(timeDetails, "hh:mm A").format("mm");
	var appointment_meridiem = moment(timeDetails, "hh:mm A").format("A");
	if (appointment_meridiem == "pm" || appointment_meridiem == "PM")
		var newReminderHour = parseInt(appointment_hour) + 12;
	else
		var newReminderHour = appointment_hour;
	myDate = new Date();
	myDate.setHours(newReminderHour, appointment_minute);
	return myDate;
}

(function() {

	$.dosageRemindersValue.text = Ti.App.Properties.getString("dosageReminderFrequency" + args.row_id);
	switch(args.row_id) {
	case 0:
		$.lblTimeValue.setValue(setTimer(1));
		$.lblTimeValue1.setValue(setTimer(2));
		$.lblTimeValue2.setValue(setTimer(3));
		break;
	case 1:
		$.lblTimeValue.setValue(setTimer(4));
		$.lblTimeValue1.setValue(setTimer(5));
		$.lblTimeValue2.setValue(setTimer(6)); 
		break;
	case 2:
		$.lblTimeValue.setValue(setTimer(7));
		$.lblTimeValue1.setValue(setTimer(8));
		$.lblTimeValue2.setValue(setTimer(9));
		break;
	}
	setHeight(_.indexOf(optionsArray, Ti.App.Properties.getString("dosageReminderFrequency" + args.row_id)));
})();

function didClickSave(e) {
	reminderfrequency = $.dosageRemindersValue.text;
	Ti.App.Properties.setString("dosageReminderFrequency" + args.row_id, reminderfrequency);
	dosageReminderTime1 = moment($.lblTimeValue.getValue()).format("hh:mm A");
	dosageReminderTime2 = moment($.lblTimeValue1.getValue()).format("hh:mm A");
	dosageReminderTime3 = moment($.lblTimeValue2.getValue()).format("hh:mm A");
	Ti.API.info(args.row_id);
	switch(args.row_id) {
	case 0:
		Ti.App.Properties.setString("dosageReminderTime1", dosageReminderTime1);
		Ti.App.Properties.setString("dosageReminderTime2", dosageReminderTime2);
		Ti.App.Properties.setString("dosageReminderTime3", dosageReminderTime3);
		break;
	case 1:
		Ti.App.Properties.setString("dosageReminderTime4", dosageReminderTime1);
		Ti.App.Properties.setString("dosageReminderTime5", dosageReminderTime2);
		Ti.App.Properties.setString("dosageReminderTime6", dosageReminderTime3);
		break;
	case 2:
		Ti.App.Properties.setString("dosageReminderTime7", dosageReminderTime1);
		Ti.App.Properties.setString("dosageReminderTime8", dosageReminderTime2);
		Ti.App.Properties.setString("dosageReminderTime9", dosageReminderTime3);
		break;
	}
	app.navigator.close();
}

function didClickShowTimer() {
	$.lblTimeValue.showPicker();
}

function didClickShowTimer1() {
	$.lblTimeValue1.showPicker();
}

function didClickShowTimer2() {
	$.lblTimeValue2.showPicker();
}

function setParentViews(view) {
	$.lblTimeValue.setParentView(view);
	$.lblTimeValue1.setParentView(view);
	$.lblTimeValue2.setParentView(view);
}

dialog = Titanium.UI.createOptionDialog({
	options : optionsArray
});
dialog.addEventListener('click', function(e) {
	setHeight(e.index);
	$.dosageRemindersValue.text = optionsArray[e.index];
});
function didSelectDosageReminderOptions() {
	dialog.show();
}

function setHeight(index) {
	switch(index) {
	case 0:
		$.tableView.height = 100;
		break;
	case 1:
		$.tableView.height = 150;
		break;
	case 2:
		$.tableView.height = 200;
		break;
	}
}

exports.setParentViews = setParentViews;
