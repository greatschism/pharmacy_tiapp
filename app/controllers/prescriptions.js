var args = arguments[0] || {},
    DUE_FOR_REFILL_IN_DAYS = Alloy.Globals.config.DUE_FOR_REFILL_IN_DAYS,
    app = require("core"),
    moment = require("alloy/moment"),
    gettingRefilledColl = Alloy.Collections.gettingRefilled,
    prescriptionsColl = Alloy.Collections.prescriptions,
    currentSwipeView;

function init() {
	gettingRefilledColl.reset([{
		id : 1,
		name : "Tramadol HCL, 20mg tab qual 1",
		readyAt : "1416910733"
	}, {
		id : 2,
		name : "Tramadol HCL, 20mg tab qual 2",
		readyAt : "1417434165"
	}]);
	prescriptionsColl.reset([{
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
		dueDate : "1416501081"
	}, {
		id : 6,
		name : "Adderall 6, 100mg tablet",
		rx : "Rx#493030003",
		dueDate : "1417501081"
	}, {
		id : 7,
		name : "Adderall 7, 100mg tablet",
		rx : "Rx#493030003",
		dueDate : "1418501081"
	}, {
		id : 8,
		name : "Adderall 8, 100mg tablet",
		rx : "Rx#493030003",
		dueDate : "1419501081"
	}, {
		id : 9,
		name : "Adderall 9, 100mg tablet",
		rx : "Rx#493030003",
		dueDate : "1419901081"
	}]);
	var functions = [getSectionGettingRefilled, getSectionReadyForRefill, getSectionOthers],
	    sections = [];
	for (var i in functions) {
		var section = functions[i]();
		if (section.rowCount) {
			sections.push(section);
		}
	}
	$.listView.data = sections;
}

function getSectionGettingRefilled() {
	var section = getSection("/images/clock_green.png", Alloy.Globals.strings.sectionGettingRefilled);
	gettingRefilledColl.each(function(model) {
		var transform = transformGettingRefilled(model),
		    row = $.UI.create("TableViewRow", {
			apiName : "TableViewRow",
			classes : ["height-75d"]
		}),
		    content = $.UI.create("View", {
			apiName : "View",
			classes : ["top-10", "bottom-10", "auto-height", "vgroup"]
		}),
		    title = $.UI.create("Label", {
			apiName : "Label",
			classes : ["left-15", "right-15", "auto-height", "h2", "black", "multi-line", "touch-disabled"]
		});
		row.className = transform.template;
		content.rowId = transform.id;
		content.addEventListener("click", didItemClick);
		title.text = transform.name;
		content.add(title);
		if (transform.template == "progress") {
			var info = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left-15", "right-15", "auto-height", "h5", "gray", "multi-line", "touch-disabled"]
			}),
			    progress = $.UI.create("View", {
				apiName : "View",
				classes : ["left", "top-10", "width-1", "height-5d", "bg-malibu", "touch-disabled"]
			});
			info.text = transform.info;
			progress.width = transform.progress;
			content.add(info);
			content.add(progress);
		} else {
			var hbox = $.UI.create("View", {
				apiName : "View",
				classes : ["top-10", "left-15", "right-15", "auto-height", "hgroup", "touch-disabled"]
			}),
			    img = $.UI.create("ImageView", {
				apiName : "ImageView",
				classes : ["left", "icon-success", "touch-disabled"]
			}),
			    pickup = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left-5", "auto-height", "h5", "gray", "multi-line", "text-completed", "touch-disabled"]
			});
			hbox.add(img);
			hbox.add(pickup);
			content.add(hbox);
		}
		row.add(content);
		section.add(row);
	});
	return section;
}

function getSectionReadyForRefill() {
	var section = getSection("/images/refill.png", Alloy.Globals.strings.sectionReadyForRefill);
	prescriptionsColl.each(function(model) {
		if (moment.unix(model.get("dueDate")).diff(moment(), "days") <= DUE_FOR_REFILL_IN_DAYS) {
			var transform = transformPrescription(model),
			    row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow",
				classes : ["height-75d"]
			}),
			    options = $.UI.create("View", {
				apiName : "View",
				classes : ["right", "width-150d"]
			}),
			    opt1 = $.UI.create("Button", {
				apiName : "Button",
				classes : ["left", "width-50", "fill-height", "bg-wildwillow", "white", "no-border", "lbl-refill"]
			}),
			    opt2 = $.UI.create("Button", {
				apiName : "Button",
				classes : ["right", "width-50", "fill-height", "bg-red", "white", "no-border", "lbl-hide"]
			}),
			    content = $.UI.create("View", {
				apiName : "View",
				classes : ["right", "width-100", "bg-white"]
			}),
			    sub = $.UI.create("View", {
				apiName : "View",
				classes : ["top-10", "bottom-10", "auto-height", "vgroup"]
			}),
			    title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left-15", "right-15", "height-30d", "h2", "black", "touch-disabled"]
			}),
			    detail = $.UI.create("View", {
				apiName : "View",
				classes : ["top-10", "left-15", "right-15", "height-15d", "touch-disabled"]
			}),
			    rx = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left", "width-45", "height-15d", "h5", "gray", "touch-disabled"]
			}),
			    due = $.UI.create("Label", {
				apiName : "Label",
				classes : ["right", "width-55", "height-15d", "h5", "text-right", "touch-disabled"]
			});
			row.className = "ready";
			sub.rowId = transform.id;
			sub.addEventListener("click", didItemClick);
			content.addEventListener("swipe", didItemSwipe);
			title.text = transform.name;
			rx.text = transform.rx;
			due.applyProperties({
				text : transform.due,
				color : transform.color
			});
			options.add(opt1);
			options.add(opt2);
			row.add(options);
			sub.add(title);
			detail.add(rx);
			detail.add(due);
			sub.add(detail);
			content.add(sub);
			row.add(content);
			section.add(row);
		}
	});
	return section;
}

function getSectionOthers() {
	var section = getSection("/images/pill.png", Alloy.Globals.strings.sectionOtherPrescriptions);
	prescriptionsColl.each(function(model) {
		if (moment.unix(model.get("dueDate")).diff(moment(), "days") > DUE_FOR_REFILL_IN_DAYS) {
			var transform = transformPrescription(model),
			    row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow",
				classes : ["height-75d"]
			}),
			    content = $.UI.create("View", {
				apiName : "View",
				classes : ["auto-height", "vgroup", "top-10", "bottom-10"]
			}),
			    title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left-15", "right-15", "height-30d", "h2", "black", "touch-disabled"]
			}),
			    detail = $.UI.create("View", {
				apiName : "View",
				classes : ["top-10", "left-15", "right-15", "height-15d", "touch-disabled"]
			}),
			    rx = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left", "width-45", "height-15d", "h5", "gray", "touch-disabled"]
			}),
			    due = $.UI.create("Label", {
				apiName : "Label",
				classes : ["right", "width-55", "height-15d", "h5", "text-right", "touch-disabled"]
			});
			row.className = "others";
			content.rowId = transform.id;
			content.addEventListener("click", didItemClick);
			title.text = transform.name;
			rx.text = transform.rx;
			due.applyProperties({
				text : transform.due,
				color : transform.color
			});
			content.add(title);
			detail.add(rx);
			detail.add(due);
			content.add(detail);
			row.add(content);
			section.add(row);
		}
	});
	return section;
}

function transformGettingRefilled(model) {
	var transform = model.toJSON();
	var availableDate = moment.unix(transform.readyAt);
	var diff = availableDate.diff(moment(), "days", true);
	if (diff > 1) {
		transform.progress = Math.floor(100 / diff) + "%";
		transform.template = "progress";
	} else {
		transform.template = "refilled";
	}
	transform.info = Alloy.Globals.strings.msgOrderPlacedReadyBy.concat(" " + availableDate.format("dddd hA"));
	return transform;
}

function transformPrescription(model) {
	var transform = model.toJSON();
	var dueDate = moment.unix(transform.dueDate);
	var fromToday = dueDate.diff(moment(), "days");
	if (fromToday <= DUE_FOR_REFILL_IN_DAYS) {
		if (fromToday >= 0) {
			transform.due = Alloy.Globals.strings.msgDueFoRefillIn.concat(" " + fromToday + " " + (fromToday > 1 ? Alloy.Globals.strings.strDays : Alloy.Globals.strings.strDay));
			transform.color = "#F79538";
		} else {
			fromToday = Math.abs(fromToday);
			transform.due = Alloy.Globals.strings.msgOverdueBy.concat(" " + fromToday + " " + (fromToday > 1 ? Alloy.Globals.strings.strDays : Alloy.Globals.strings.strDay));
			transform.color = "#ae331f";
		}
	} else {
		transform.due = Alloy.Globals.strings.msgDueFoRefillOn.concat(" " + dueDate.format("MM/DD/YY"));
		transform.color = "#8b8b8b";
	}
	return transform;
}

function getSection(image, title) {
	var view = $.UI.create("View", {
		apiName : "View",
		classes : ["height-30d", "bg-armadillo"]
	});
	var imgView = $.UI.create("ImageView", {
		apiName : "ImageView",
		classes : ["left-5", "height-15d"]
	});
	imgView.image = image;
	var lbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["cloudy", "left-25"]
	});
	lbl.text = title;
	view.add(imgView);
	view.add(lbl);
	return Ti.UI.createTableViewSection({
		headerView : view
	});
}

function didItemClick(e) {
	if (currentSwipeView) {
		didItemSwipe(e);
		return;
	}
	var rowId = e.source.rowId;
	if (rowId) {
		app.navigator.open({
			stack : true,
			titleid : "titleDetails",
			ctrl : "prescriptionDetails",
			ctrlArguments : {
				itemId : e.source.rowId
			}
		});
	}
}

function didItemSwipe(e) {
	/**
	 * On swipe left & right is 0 - move the view by 150dp from right, to show the buttons.
	 * On swipe right & right is 150 - move the view back to right = 0, to hide the buttons.
	 * value of right is being checked to avoid animating the view, if it is already at the right place.
	 */
	var source,
	    direction,
	    right = false;

	if (currentSwipeView) {
		source = currentSwipeView;
		direction = "right";
	} else {
		source = e.source.getParent();
		direction = e.direction;
	}

	if (direction == "left" && source.right == 0) {
		right = 150;
		currentSwipeView = source;
	} else if (direction == "right" && source.right == 150) {
		right = 0;
	}
	if (right !== false) {
		var animation = Ti.UI.createAnimation({
			right : right,
			duration : Alloy.CFG.ANIMATION_DURATION
		});
		animation.addEventListener("complete", function onComplete() {
			if (right == 0) {
				currentSwipeView = false;
			}
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
