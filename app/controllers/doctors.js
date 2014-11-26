var args = arguments[0] || {},
    app = require("core"),
    http = require("httpwrapper"),
    dialog = require("dialog");

function init() {
	http.request({
		url : "http://10.10.10.20:9000/services-demo/services/doctor",
		dataTransform : false,
		format : "JSON",
		action : "list",
		data : {
			doctor_details : null
		},
		success : didSuccess
	});
}

function didSuccess(result) {
	Alloy.Collections.upcomingAppointments.reset([{
		image : "/images/profile.png",
		desc : "You have an upcoming appointment with Dr. Doe on",
		time : "May 12th at 4.30 PM."
	}]);
	var doctors = result.data[0].doctors;
	for (var i in doctors) {
		doctors[i].short_name = "Dr. " + doctors[i].last_name;
		doctors[i].long_name = "Dr. " + doctors[i].first_name + " " + doctors[i].last_name;
		doctors[i].thumbnail_url = "/images/profile.png";
	}
	Alloy.Collections.doctors.reset(doctors);
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
		description = transform.short_name + " has prescribed you " + prescriptions[0].prescription_name;
		if (len > 1) {
			//when > 1 and switch case used for defining when it is == 2, ==3 and > 3
			switch(len) {
			case 2:
				description += " and " + prescriptions[1].prescription_name;
				break;
			case 3:
				description += ", " + prescriptions[1].prescription_name + " and " + prescriptions[2].prescription_name;
				break;
			default:
				description += ", " + prescriptions[1].prescription_name + " and [" + (len - 2) + "] more";
			}
		}
	} else {
		//When len is 0
		description = "You have no active prescriptions associated with " + transform.short_name;
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
		var doctors = Alloy.Collections.doctors.where({
			doctor_id : itemId
		});
		if (doctors.length) {
			var doctor = doctors[0].toJSON();
			if (bindId == "profile") {
				$.photoDialog.itemId = itemId;
				$.photoDialog.show();
			} else {
				app.navigator.open({
					stack : true,
					title : doctor.short_name,
					ctrl : "doctorDetails",
					ctrlArguments : {
						itemId : itemId
					}
				});
			}
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
