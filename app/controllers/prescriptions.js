var args = arguments[0] || {},
    DUE_FOR_REFILL_IN_DAYS = Alloy.CFG.DUE_FOR_REFILL_IN_DAYS,
    app = require("core"),
    moment = require("alloy/moment");

function init() {
	Alloy.Collections.gettingRefilled.reset([{
		id : 1,
		name : "Tramadol HCL, 20mg tab qual 1",
		readyAt : "1417174965"
	}, {
		id : 2,
		name : "Tramadol HCL, 20mg tab qual 2",
		readyAt : "1417434165"
	}]);
	Alloy.Collections.prescriptions.reset([{
		id : 1,
		name : "Advil 1, 100mg tablet",
		rx : "Rx#493030003",
		dueDate : "1414737560"
	}, {
		id : 2,
		name : "Adderall 2, 100mg tablet",
		rx : "Rx#493030003",
		dueDate : "1414823960"
	}, {
		id : 3,
		name : "Advil 3, 100mg tablet",
		rx : "Rx#493030003",
		dueDate : "1415687960"
	}, {
		id : 4,
		name : "Adderall 4, 100mg tablet",
		rx : "Rx#493030003",
		dueDate : "1415860760"
	}, {
		id : 5,
		name : "Adderall 5, 100mg tablet",
		rx : "Rx#493030003",
		dueDate : "1416561726"
	}]);
}

function filterReadyForRefill(collection) {
	return collection.reject(function(model) {
		return moment.unix(model.get("dueDate")).diff(moment(), "days") > DUE_FOR_REFILL_IN_DAYS;
	});
}

function filterOtherPrescription(collection) {
	return collection.reject(function(model) {
		return moment.unix(model.get("dueDate")).diff(moment(), "days") <= DUE_FOR_REFILL_IN_DAYS;
	});
}

function transformGettingRefilled(model) {
	var transform = model.toJSON();
	var availableDate = moment.unix(transform.readyAt);
	var diff = availableDate.diff(moment(), "days", true);
	if (diff > 1) {
		transform.progress = Math.floor(100 / diff) + "%";
		if (OS_MOBILEWEB) {
			transform.gettingRefilled = true;
			transform.refilled = false;
			transform.gettingRefilledHeight = Ti.UI.SIZE;
			transform.refilledHeight = 0;
		} else {
			transform.template = "gettingRefilled";
		}
	} else {
		if (OS_MOBILEWEB) {
			transform.refilled = true;
			transform.gettingRefilled = false;
			transform.gettingRefilledHeight = 0;
			transform.refilledHeight = Ti.UI.SIZE;
		} else {
			transform.template = "refilled";
		}
	}
	transform.info = Alloy.Globals.Strings.msgOrderPlacedReadyBy.concat(" " + availableDate.format("dddd hA"));
	return transform;
}

function transformPrescription(model) {
	var transform = model.toJSON();
	var dueDate = moment.unix(transform.dueDate);
	var fromToday = dueDate.diff(moment(), "days");
	if (fromToday <= DUE_FOR_REFILL_IN_DAYS) {
		if (fromToday >= 0) {
			transform.due = Alloy.Globals.Strings.msgDueFoRefillIn.concat(" " + fromToday + " " + (fromToday > 1 ? Alloy.Globals.Strings.strDays : Alloy.Globals.Strings.strDay));
			transform.color = "#F79538";
		} else {
			fromToday = Math.abs(fromToday);
			transform.due = Alloy.Globals.Strings.msgOverdueBy.concat(" " + fromToday + " " + (fromToday > 1 ? Alloy.Globals.Strings.strDays : Alloy.Globals.Strings.strDay));
			transform.color = "#ae331f";
		}
	} else {
		transform.due = Alloy.Globals.Strings.msgDueFoRefillOn.concat(" " + dueDate.format("MM/DD/YY"));
		transform.color = "#8b8b8b";
	}
	return transform;
}

function didItemClick(e) {
	var itemId = Number( OS_MOBILEWEB ? e.row.rowId : e.itemId);
	var section = OS_MOBILEWEB ? ($[e.row.rowTable]) : e.section;
	if (section == $.gettingRefilledSection) {
		app.navigator.open({
			stack : true,
			titleid : "titleDetails",
			ctrl : "prescriptionDetails",
			ctrlArguments : {
				itemId : itemId,
				edit : true
			}
		});
	} else if (section == $.otherPrescriptionsSection) {

	}
}

function didClickOverduePrescription(e) {
	console.log(e);
}

function didSwipeOverduePrescription(e) {
	/**
	 * On swipe left & right is 0 - move the view by 150dp from right, to show the buttons.
	 * On swipe right & right is 150 - move the view back to right = 0, to hide the buttons.
	 * value of right is being checked to avoid animating the view, if it is already at the right place.
	 */
	var source = e.source,
	    direction = e.direction,
	    right = false;
	if (direction == "left" && source.right == 0) {
		right = 150;
	} else if (direction == "right" && source.right == 150) {
		right = 0;
	}
	if (right !== false) {
		var animation = Ti.UI.createAnimation({
			right : right,
			duration : Alloy.CFG.ANIMATION_DURATION
		});
		animation.addEventListener("complete", function onComplete() {
			source.right = right;
		});
		source.animate(animation);
	}
}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e) {
	var action = e.data.action;
	if (action === "search") {
		$.listView.top === 0 ? showSearch() : hideSearch();
	}
}

function showSearch() {
	var top = 60;
	var listAnim = Ti.UI.createAnimation({
		top : top,
		duration : 150
	});
	listAnim.addEventListener("complete", function onComplete() {
		listAnim.removeEventListener("complete", onComplete);
		$.listView.top = top;
		$.searchbar.animate({
			opacity : 1,
			duration : 150
		}, function(searchbar) {
			searchbar.opacity = 1;
		});
	});
	$.listView.animate(listAnim);
}

function hideSearch() {
	var top = 0;
	$.searchbar.animate({
		opacity : 0,
		duration : 150
	}, function(searchbar) {
		searchbar.opacity = 0;
		var listAnim = Ti.UI.createAnimation({
			top : top,
			duration : 150
		});
		listAnim.addEventListener("complete", function onComplete() {
			listAnim.removeEventListener("complete", onComplete);
			$.listView.top = top;
		});
		$.listView.animate(listAnim);
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
