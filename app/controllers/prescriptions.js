var args = arguments[0] || {}, app = require("core");

function init() {
	Alloy.Collections.gettingRefilled.reset([{

		desc : "Tramadol HCL, 20mg tab qual",
		time : "Order placed; should be ready by Tuesday 2PM."
	}]);

	Alloy.Collections.readytoRefill.reset([{
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

	Alloy.Collections.otherPrescriptions.reset([{

		id : 1,
		prescname : "Tramadol HCL, 20mg tab",
		rxnumber : "Rx848484",
		duedate : "Due for refill on 05/14/14"

	}]);

}

function transformGettingRefilled(model) {
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

function transformReadyToRefill(model) {
	var transform = model.toJSON();

	transform.name = transform.prescname;

	var description = "";

	description = transform.rxnumber + "        " + transform.duedate;

	//	description += ".";
	transform.description = description;
	return transform;
}

function transformOtherPrescriptions(model) {
	var transform = model.toJSON();

	transform.name = transform.prescname;
	var description = "";

	description = transform.rxnumber + "        " + transform.duedate;

	//description += ".";
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
	if (section == $.gettingRefilledSection) {
		app.navigator.open({
			stack : true,
			titleid : "titleEditReminder",
			ctrl : "prescriptionDetails",
			ctrlArguments : {
				itemId : itemId,
				edit : true
			}
		});
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
