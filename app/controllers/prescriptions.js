var args = arguments[0] || {},
    app = require("core"),
    moment = require("alloy/moment"),
    utilities = require("utilities"),
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    gettingRefilled,
    prescriptions,
    currentSwipeView,
    DUE_FOR_REFILL_IN_DAYS = Alloy._due_for_refill_in_days;

function init() {
	gettingRefilled = [{
		id : 1,
		name : "Tramadol HCL, 20mg tab qual 1",
		placed_at : "1418652026",
		ready_at : "1418911226"
	}, {
		id : 2,
		name : "Tramadol HCL, 20mg tab qual 2",
		placed_at : "1418904575",
		ready_at : "1419246022"
	}];
	prescriptions = [{
		id : 1,
		name : "Advil 1, 100mg tablet",
		rx : "Rx#493030003",
		due_date : "1414737560"
	}, {
		id : 2,
		name : "Adderall 2, 100mg tablet",
		rx : "Rx#493030003",
		due_date : "1414823960"
	}, {
		id : 3,
		name : "Advil 3, 100mg tablet",
		rx : "Rx#493030003",
		due_date : "1415687960"
	}, {
		id : 4,
		name : "Adderall 4, 100mg tablet",
		rx : "Rx#493030003",
		due_date : "1415860760"
	}, {
		id : 5,
		name : "Adderall 5, 100mg tablet",
		rx : "Rx#493030003",
		due_date : "1416501081"
	}, {
		id : 6,
		name : "Adderall 6, 100mg tablet",
		rx : "Rx#493030003",
		due_date : "1417501081"
	}, {
		id : 7,
		name : "Adderall 7, 100mg tablet",
		rx : "Rx#493030003",
		due_date : "1418501081"
	}, {
		id : 8,
		name : "Adderall 8, 100mg tablet",
		rx : "Rx#493030003",
		due_date : "1419501081"
	}, {
		id : 9,
		name : "Adderall 9, 100mg tablet",
		rx : "Rx#493030003",
		due_date : "1419901081"
	}];
	var readyForRefill = [],
	    otherPrescriptions = [],
	    data = [];
	//transform data
	for (var i in prescriptions) {
		var transform = prescriptions[i],
		    dueDate = moment.unix(transform.due_date);
		transform.diff_in_days = dueDate.diff(moment(), "days");
		if (transform.diff_in_days <= DUE_FOR_REFILL_IN_DAYS) {
			if (transform.diff_in_days >= 0) {
				transform.due = strings.msgDueFoRefillIn.concat(" " + transform.diff_in_days + " " + (transform.diff_in_days > 1 ? strings.strDays : strings.strDay));
				transform.color = Alloy._fg_tertiary;
			} else {
				transform.diff_in_days = Math.abs(transform.diff_in_days);
				transform.due = strings.msgOverdueBy.concat(" " + transform.diff_in_days + " " + (transform.diff_in_days > 1 ? strings.strDays : strings.strDay));
				transform.color = Alloy._error_color;
			}
			readyForRefill.push(transform);
		} else {
			transform.due = strings.msgDueFoRefillOn.concat(" " + dueDate.format("MM/DD/YY"));
			transform.color = Alloy._fg_quaternary;
			otherPrescriptions.push(transform);
		}
	}
	//Getting refilled
	if (gettingRefilled.length) {
		$.gettingRefilledSection = utilities.createTableViewSection({
			title : strings.sectionGettingRefilled,
			icon : icons.clock,
			color : Alloy._success_color
		});
		for (var i in gettingRefilled) {
			var transform = gettingRefilled[i],
			    placeAt = moment.unix(transform.placed_at),
			    readyAt = moment.unix(transform.ready_at),
			    ndays = readyAt.diff(placeAt, "days", true),
			    expired = moment().diff(placeAt, "days", true),
			    row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),
			    contentView = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view", "vgroup"]
			}),
			    title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["h2", "fg-secondary", "multi-line", "touch-disabled"]
			});
			contentView.rowId = transform.id;
			contentView.addEventListener("click", didItemClick);
			title.text = transform.name;
			contentView.add(title);
			if (expired < ndays) {
				var info = $.UI.create("Label", {
					apiName : "Label",
					classes : ["left", "h5", "padding-top", "fg-quaternary", "multi-line", "touch-disabled"]
				}),
				    progress = $.UI.create("View", {
					apiName : "View",
					classes : ["left", "padding-top", "width-1", "height-5d", "bg-progress", "touch-disabled"]
				});
				info.text = strings.msgOrderPlacedReadyBy.concat(" " + readyAt.format("dddd hA"));
				progress.width = Math.floor(((expired > 0.1 ? expired : 0.1) / ndays) * 100) + "%";
				contentView.add(info);
				contentView.add(progress);
				row.className = "refillInProgress";
			} else {
				var hgroup = $.UI.create("View", {
					apiName : "View",
					classes : ["padding-top", "auto-height", "hgroup", "no-hwrap"]
				}),
				    successIcon = $.UI.create("Label", {
					apiName : "Label",
					classes : ["success-icon", "left", "font-icon", "fg-success", "touch-disabled"]
				}),
				    successLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["padding-left", "auto-height", "h5", "fg-quaternary", "multi-line", "touch-disabled"]
				});
				successLbl.text = strings.msgYourOrderIsReady;
				hgroup.add(successIcon);
				hgroup.add(successLbl);
				contentView.add(hgroup);
				row.className = "refillCompleted";
			}
			row.add(contentView);
			$.gettingRefilledSection.add(row);
		}
		data.push($.gettingRefilledSection);
	}
	//Ready for refill
	if (readyForRefill.length) {
		$.readyForRefillSection = utilities.createTableViewSection({
			title : strings.sectionReadyForRefill,
			icon : icons.thick_prescriptions,
			color : Alloy._error_color
		});
		for (var i in readyForRefill) {
			var transform = readyForRefill[i],
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
				classes : ["left", "width-50", "fill-height", "bg-quaternary", "h4", "fg-primary", "no-border", "btn-refill"]
			}),
			    opt2 = $.UI.create("Button", {
				apiName : "Button",
				classes : ["right", "width-50", "fill-height", "bg-quaternary", "h4", "fg-primary", "no-border", "btn-hide"]
			}),
			    vseparator = $.UI.create("View", {
				apiName : "View",
				classes : ["vseparator", "height-90", "bg-senary", "touch-disabled"]
			}),
			    content = $.UI.create("View", {
				apiName : "View",
				classes : ["right", "width-100", "bg-senary"]
			}),
			    sub = $.UI.create("View", {
				apiName : "View",
				classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
			}),
			    title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left", "h2-fixed", "fg-secondary", "touch-disabled"]
			}),
			    detail = $.UI.create("View", {
				apiName : "View",
				classes : ["auto-height", "touch-disabled"]
			}),
			    rx = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left", "width-45", "h5-fixed", "fg-quaternary", "touch-disabled"]
			}),
			    due = $.UI.create("Label", {
				apiName : "Label",
				classes : ["right", "width-55", "h5-fixed", "text-right", "fg-quaternary", "touch-disabled"]
			});
			row.className = "readyForRefill";
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
			options.add(vseparator);
			detail.add(rx);
			detail.add(due);
			sub.add(title);
			sub.add(detail);
			content.add(sub);
			row.add(options);
			row.add(content);
			$.readyForRefillSection.add(row);
		}
		data.push($.readyForRefillSection);
	}
	//Other prescriptions
	if (otherPrescriptions.length) {
		$.otherPrescriptionsSection = utilities.createTableViewSection({
			title : strings.sectionOtherPrescriptions,
			icon : icons.pill,
			color : Alloy._fg_tertiary
		});
		for (var i in otherPrescriptions) {

		}
		data.push($.otherPrescriptionsSection);
	}
	$.tableView.data = data;
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
		$.tableView.top === 0 ? showSearch() : hideSearch();
	}
}

function showSearch() {
	var top = Alloy._content_height + Alloy._m_top + Alloy._m_bottom;
	var listAnim = Ti.UI.createAnimation({
		top : top,
		duration : 150
	});
	listAnim.addEventListener("complete", function onComplete() {
		listAnim.removeEventListener("complete", onComplete);
		$.tableView.top = top;
		$.searchbar.animate({
			opacity : 1,
			duration : 150
		}, function(searchbar) {
			searchbar.opacity = 1;
		});
	});
	$.tableView.animate(listAnim);
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
			$.tableView.top = top;
		});
		$.tableView.animate(listAnim);
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
