var args = arguments[0] || {}, app = require("core");

function init() {
	Alloy.Collections.upcomingAppointments.reset([{

		desc : "Tramadol HCL, 20mg tab qual",
		time : "Order placed; should be ready by Tuesday 2PM."
	}]);
	
	
	Alloy.Collections.doctors.reset([{
		id : 1,
		
		prescname : "Advil, 100mg tablet",
        rxnumber : "Rx7327373783",
       duedate : "Overdue by 17 days"

	}, {
		id : 2,
	
		prescname : "Adderrall, 100mg tablet",
		rxnumber : "Rx7327373783",
		duedate : "Overdue by 14 days"
	
	}, {
		id : 3,
		
		prescname : "Atorvastatin, 10mg tab",
        rxnumber : "Rx7327373783",
	   duedate : "Due for refill in 6 days"
		
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
	
	transform.name = transform.prescname ;
//	var prescriptions = transform.prescriptions;
	var description = "";

		 description = rxnumber + "        " + duedate;
		
				 description += transform.rxnumber + "     " + transform.duedate;
				
				 description += transform.rxnumber + "     " + transform.duedate;
				
				 description += transform.rxnumber + "     " + transform.duedate;
			
	
		
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
		ctrl : "prescriptionDetails"
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
