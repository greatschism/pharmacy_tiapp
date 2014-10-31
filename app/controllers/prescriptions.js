var args = arguments[0] || {},
    app = require("core");

function init() {
	Alloy.Collections.upcomingAppointments.reset([{
	
		desc : "Tramadol HCL, 20mg tab qual",
		time : "Order placed; should be ready by Tuesday 2PM."
	}]);
	Alloy.Collections.doctors.reset([{
		id : 1,
		image : "",
		fname : "Advil 100mg tablet",
		lname : "Rx83484848",
		phone : "Overdue by 17 days ",
		fax : "(415) 111-3291",
		hospital : "Smith Hospital",
		street : "12 Pequod St.",
		city : "Nantuket",
		state : "MA",
		zip : "02554",
		prescriptions : [{
			name : "Omeprazole"
		}, {
			name : "Omeprazole 500mg"
		}, {
			name : "Omeprazole 500mg"
		}, {
			name : "Omeprazole 500mg"
		}, {
			name : "Omeprazole 500mg"
		}]
	}, {
		id : 2,
		image : "",
		fname : "Aderrall",
		lname : "Rx7373737",
		phone : "Due for refill in 6 days",
		fax : "(415) 111-3291",
		hospital : "Smith Hospital",
		street : "12 Pequod St.",
		city : "Nantuket",
		state : "MA",
		zip : "02554",
		prescriptions : [{
			name : "Omeprazole"
		}]
	}, {
		id : 3,
		image : "",
		fname : "Prednisone, 20mg tab qual",
		lname : "Rx523533636",
		phone : "Due for refill in 5 days",
		fax : "(415) 111-3291",
		hospital : "Smith Hospital",
		street : "12 Pequod St.",
		city : "Nantuket",
		state : "MA",
		zip : "02554",
		prescriptions : []
	}]);
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
	var transform = model.toJSON();
	if (!transform.image) {
		transform.image = "/images/add_photo.png";
	}
	transform.name = "Dr. " + transform.fname + " " + transform.lname;
	var prescriptions = transform.prescriptions;
	var description = "";
	var len = prescriptions.length;
	if (len) {
		description = "Dr. " + transform.lname + " has prescribed you " + prescriptions[0].name;
		if (len > 1) {
			switch(len) {
			case 2:
				description += " and " + prescriptions[1].name;
				break;
			case 3:
				description += ", " + prescriptions[1].name + " and " + prescriptions[2].name;
				break;
			default:
				description += ", " + prescriptions[1].name + " and [" + (len - 2) + "] more";
			}
		}
	} else {
		description = "You have no active prescriptions associated with Dr. " + transform.lname;
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
	var itemId = Number( OS_MOBILEWEB ? e.row.rowId : e.itemId);
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
			id : itemId
		});
		if (doctors.length) {
			var doctor = doctors[0].toJSON();
			if (bindId == "profile") {
				if (!doctor.image) {
					$.photoDialog.itemId = itemId;
					$.photoDialog.show();
				}
			} else {
				app.navigator.open({
					stack : true,
					title : "Dr. " + doctor.lname,
					ctrl : "doctorDetails",
					ctrlArguments : {
						itemId : itemId
					}
				});
			}
		}
	}
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
