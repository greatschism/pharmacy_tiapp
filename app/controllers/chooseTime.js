var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    http = require("requestwrapper"),
    dialog = require("dialog"),
    dateDetails,
    timeDetails;

(function() {
	if (args.edit) {
		console.log("edit there");
		$.deleteBtn.show();
	}else{
		$.deleteBtn.hide();
	}
	
	$.dateLbl.setMinDate(new Date());
	$.dateLbl.setMaxDate(new Date("December 31, 2015"));
	//$.dateLbl.text = moment().format("MMM Do, YYYY");
	//$.timeLbl.text = moment().format("h A");
})();

function didItemClick(e) {

}

function setParentViews(view) {
	$.dateLbl.setParentView(view);
}

function getTime(e)
{
	timeDetails=e.value.toLocaleString();
}

function didClickSave(e) {
	dateDetails=$.dateLbl.getValue();
	http.request({
		method : "ADD_APPOINTMENT",
		data : {
			filter : [{
				type : ""
			}],
			data : {
				"appointment" : {
					"doctor_id" : "x",
					"appointment_date" : dateDetails,
					"appointment_hour" : "x",
					"appointment_minute" : "x",
					"appointment_meridiem" : "AM/PM",
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
		success : didSuccess
	});
}
function didSuccess(_result){
	var appointmentDetails= String.format(Alloy.Globals.strings.msgAppointmentReminder,args.short_name,dateDetails,timeDetails);
	dialog.show({
			title: Alloy.Globals.strings.titleSuccess,
			message :appointmentDetails,
			buttonNames : [Alloy.Globals.strings.strOK],
			success : function() {
			app.navigator.closeToRoot();
		}

		});
	}

function didClickEdit(e) {
	app.navigator.open({
		stack : true,
		titleid : "tittleDoctorReminderSettings",
		ctrl : "editReminder"
	});

}

function didClickDelete(e) {

}

exports.setParentViews = setParentViews; 