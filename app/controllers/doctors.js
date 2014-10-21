var args = arguments[0] || {},
    App = require("core");

function init() {
	Alloy.Collections.upcomingAppointments.reset([{
		image : "/images/profile.png",
		desc : "You have an upcoming appointment with Dr. Doe on",
		time : "May 12th at 4.30 PM."
	}]);
	Alloy.Collections.doctors.reset([{
		id : 1,
		image : "",
		fname : "Jane",
		lname : "Doe",
		phone : "(415) 193-3291",
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
		image : "/images/profile.png",
		fname : "Herman",
		lname : "Melville",
		phone : "(415) 193-3291",
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
		image : "/images/profile.png",
		fname : "Hareesh",
		lname : "Khurana",
		phone : "(415) 193-3291",
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

}

function didClickOption(e) {
	console.log(e);
}

function didClickProfileImg(e) {
	var itemId = Number( OS_MOBILEWEB ? e.source.itemId : e.itemId);
	if (itemId) {
		var doctor = Alloy.Collections.doctors.where({
		id: itemId
		})[0].toJSON();
		if (!doctor.image) {
			$.photoDialog.itemId = itemId;
			$.photoDialog.show();
		}
	}
}

function openCamera() {

}

function openGallery() {

}

function didClickAddDoctor(e) {
	App.Navigator.open({
		stack : true,
		title : Alloy.Globals.Strings.titleAddDoctor,
		ctrl : "addDoctor"
	});
}

function didClickDoctor(e) {
	var itemId = Number( OS_MOBILEWEB ? e.source.itemId : e.itemId);
	if (itemId) {
		var doctor = Alloy.Collections.doctors.where({
		id: itemId
		})[0].toJSON();
		App.Navigator.open({
			stack : true,
			title : "Dr. " + doctor.lname,
			ctrl : "doctorDetails",
			ctrlArguments : {
				itemId : itemId
			}
		});
	}
}

function didClickSetAppointment(e) {
	App.Navigator.open({
		stack : true,
		title : Alloy.Globals.Strings.titleChooseDoctor,
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
