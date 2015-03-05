var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    dialog = require("dialog"),
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    DUE_FOR_REFILL_IN_DAYS = Alloy._due_for_refill_in_days,
    msgPickup = Alloy.Globals.strings.msgPickup,
    gettingRefilled,
    inprocessPrescriptions,
    sortPrescriptions,
    readyToRefill,
    otherPrescriptions,
    prescriptions,
    hiddenPrescriptionStatus,
    hiddenPrescriptions,
    allPrescriptions,
    refillButton,
    hideButton,
    currentSwipeView;

function init() {
	http.request({
		method : "PRESCRIPTIONS_LIST",
		success : didSuccess
	});

}

function addRx(str) {
	var strTemp = "Rx# ";
	str = strTemp + str;
	return str;
}

function didSuccess(result) {
	console.log("did success");
	prescriptions = result.data.prescriptions || [];
	var inprocessPrescriptions = _.reject(prescriptions, function(obj) {
		return obj.refill_status != "INPROCESS" && obj.refill_status != "READYFORPICKUP";
	}),

	    readyForRefill = _.where(prescriptions, {
		refill_status : "READYTOREFILL"
	}),
	    otherPrescriptions = _.where(prescriptions, {
		refill_status : "OTHERS"
	});
	if (inprocessPrescriptions.length) {

		$.gettingRefilledSection = uihelper.createTableViewSection($, strings.sectionGettingRefilled);
		for (var i in inprocessPrescriptions) {
			var transform = inprocessPrescriptions[i];
			if (transform.refill_status == "INPROCESS") {
				row = $.UI.create("TableViewRow", {
					apiName : "TableViewRow"
				}),
				contentView = $.UI.create("View", {
					apiName : "View",
					classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
				}),
				title = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-title-lbl", "left"]
				});
				orderProcessedLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-info-lbl", "left"]
				});
				orderProcessedBgImage = $.UI.create("View", {
					apiName : "View",
					classes : ["left", "progressbar-bg"]
				});
				orderProcessedFgImage = $.UI.create("View", {
					apiName : "View",
					classes : ["left", "progressbar-fg"]
				});
				readyByDate1 = moment(transform.latest_refill_promised_date).format("dddd, hA");
				readyByDate2 = moment(transform.latest_refill_promised_date, "YYYY/MM/DD");
				todaysDate = moment();

				ndays = readyByDate2.diff(todaysDate, 'days');
				orderProcessedLbl.text = strings.msgOrderPlacedReadyBy + " " + readyByDate1;

				//get the % for processed image

				curr = moment();
				refillRequestedDate = moment(transform.latest_refill_requested_date, "YYYY/MM/DD");
				promisedDate = moment(transform.latest_refill_promised_date, "YYYY/MM/DD");
				currentDate = moment(curr, "YYYY/MM/DD");

				currentMinusRequested = currentDate.diff(refillRequestedDate, 'seconds');
				promisedMinusRequested = promisedDate.diff(refillRequestedDate, 'seconds');

				remainingDays = Math.floor((currentMinusRequested / promisedMinusRequested ) * 100) + "%";

				orderProcessedFgImage.width = remainingDays;
				contentView.rowId = transform.id;
				//contentView.addEventListener("click", didItemClick);

				title.text = utilities.ucfirst(transform.presc_name);
				contentView.add(title);
				contentView.add(orderProcessedLbl);
				contentView.add(orderProcessedBgImage);
				orderProcessedBgImage.add(orderProcessedFgImage);
				row.add(contentView);
				$.gettingRefilledSection.add(row);
			} else if (transform.refill_status == "READYFORPICKUP") {
				row = $.UI.create("TableViewRow", {
					apiName : "TableViewRow",

				}),
				contentView = $.UI.create("View", {
					apiName : "View",
					classes : ["padding-top", "margin-left", "margin-right", "auto-height", "vgroup"]
				}),
				detail = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-view"]
				}),
				title = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-title-lbl", "left"]
				}),
				orderPickUpLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-info-lbl"]
				}),
				orderPickUpLblIcon = $.UI.create("Label", {
					apiName : "Label",
					classes : ["small-icon", "left", "success-color"],

				}), title.text = utilities.ucfirst(transform.presc_name);
				orderPickUpLbl.text = strings.msgYourOrderIsReady;
				orderPickUpLblIcon.text = Alloy.CFG.icons.filled_success;

				detail.add(orderPickUpLbl);
				detail.add(orderPickUpLblIcon);
				contentView.add(title);
				contentView.add(detail);
				row.add(contentView);
				$.gettingRefilledSection.add(row);
				var styleArgsNormal = $.createStyle({

					classes : ["arrow-left", "tooltip", "padding-right"],
					id : 'pickUpTooltip',

					width : 150,
					height : 80,

				});
				var styleArgsCritical = $.createStyle({

					classes : ["arrow-left", "critical-tooltip", "padding-right"],
					id : 'pickUpTooltip',

					width : 150,
					height : 80,

				});
				//calculate the number of days left for picking up the prescription
				filledDate = moment(transform.latest_filled_date, "YYYY/MM/DD");
				todaysDate = moment();
				ndays = todaysDate.diff(filledDate, 'days');

				restockingPeriod = transform.restockperiod;
				noOfDaysLeftForPickUp = restockingPeriod - ndays;

				if (noOfDaysLeftForPickUp > 3) {

					var styledLbl = Alloy.createWidget("com.mscripts.styledlabel", "widget", $.createStyle({
						classes : ["tooltip-lbl"],
						html : String.format(msgPickup, Math.abs(noOfDaysLeftForPickUp))
					}));

					pickUpTooltipNormal = Alloy.createWidget("com.mscripts.tooltip", "widget", styleArgsNormal);
					pickUpTooltipNormal.setContentView(styledLbl.getView());
					row.add(pickUpTooltipNormal.getView());
					pickUpTooltipNormal.show();

				} else if (noOfDaysLeftForPickUp <= 3) {
					var styledLbl = Alloy.createWidget("com.mscripts.styledlabel", "widget", $.createStyle({
						classes : ["tooltip-lbl"],
						html : String.format(msgPickup, Math.abs(noOfDaysLeftForPickUp))
					}));

					pickUpTooltipCritical = Alloy.createWidget("com.mscripts.tooltip", "widget", styleArgsCritical);
					pickUpTooltipCritical.setContentView(styledLbl.getView());
					row.add(pickUpTooltipCritical.getView());
					pickUpTooltipCritical.show();

				}
			}
		}

	}

	if (readyForRefill.length) {

		$.readyForRefillSection = uihelper.createTableViewSection($, strings.sectionReadyForRefill);
		for (var i in readyForRefill) {

			var transform = readyForRefill[i],
			    anticipatedRefillDate = moment(transform.anticipated_refill_date, "YYYY/MM/DD");
			todaysDate = moment();

			ndays = anticipatedRefillDate.diff(todaysDate, 'days');

			row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow",
				classes : ["height-75d"],

			}),

			content = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view", "vgroup"]
			}),
			refillButton = $.UI.create("Button", {
				apiName : "Button",
				classes : ["positive-option-btn", "lbl-refill","width-40","right","height-75d"]
			}),
console.log(JSON.stringify(refillButton));
			vseparator = $.UI.create("View", {
				apiName : "View",
				classes : ["option-separator", "touch-disabled"]
			}),
			hideButton = $.UI.create("Button", {
				apiName : "Button",
				classes : ["option-btn", "lbl-hide","width-40","right","height-75d"]
			}),
			sub = $.UI.create("View", {
				apiName : "View",
				//classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
			}),
			title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-title-lbl", "left"]
			}),
			detail = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-info-lbl"]
			}),
			rx = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl", "left"]
			}),
			due = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl"]
			});
			row.className = "readyForRefill";
			sub.rowId = transform.id;
			//sub.addEventListener("click", didItemClick);

			title.text = utilities.ucfirst(transform.presc_name);
			rx.text = addRx(transform.rx_number);

			detail.add(rx);
			detail.add(due);
			content.add(title);
			content.add(detail);
			//content.add(sub);

			row.add(content);

			if (ndays < 0) {
				var overDueLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
				});
				content = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-view"]
				});
				overDueDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				overDueLbl.text = strings.msgOverdueBy;
				overDueDetailLbl.text = Math.abs(ndays) + "days";
				row.add(content);
				content.add(overDueLbl);
				content.add(overDueDetailLbl);

				if (Math.abs(ndays) >= 60) {
					console.log("came here" + ndays);
					hideFromList = $.UI.create("View", {
						apiName : "View",
						classes : ["critical-info-view","width-35","height-40"]
					}),
					hideFromListLabel = $.UI.create("Label", {
						apiName : "Label",
						classes : ["critical-info-lbl"]
					}),
					overDueLblSingleLine = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-critical-info-lbl", "padding-right"]
					});
					hideFromList.addEventListener("click", didHideFromList);
					overDueLblSingleLine.text = strings.msgOverdueBy + Math.abs(ndays) + "days";
					hideFromList.right=10;
					hideFromList.top=5;
					hideFromListLabel.text=strings.lblHideFromList;
					row.add(hideFromList);
					hideFromList.add(hideFromListLabel);
					row.add(overDueLblSingleLine);
					overDueLbl.text = "";
					overDueDetailLbl.text = "";
				}
			} else if (ndays >= 0) {
				var dueForRefillLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
				});
				content = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-view"]
				});
				dueForRefillDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				dueForRefillLbl.text = strings.msgDueFoRefillIn;
				dueForRefillDetailLbl.text = ndays + "days";
				row.add(content);
				content.add(dueForRefillLbl);
				content.add(dueForRefillDetailLbl);
			} else {

			}
			row.addEventListener("swipe", didItemSwipe);
				vseparator.left=192;
			refillButton.right = app.device.width;
			hideButton.right = app.device.width;
		
			row.add(refillButton);
			
			row.add(hideButton);
			row.add(vseparator);
			$.readyForRefillSection.add(row);
		}

	}

	if (otherPrescriptions.length) {

		$.otherPrescriptionsSection = uihelper.createTableViewSection($, strings.sectionOtherPrescriptions);
		for (var i in otherPrescriptions) {

			var transform = otherPrescriptions[i],
			    anticipatedRefillDate = moment(transform.anticipated_refill_date, "YYYY/MM/DD");
			todaysDate = moment();

			ndays = anticipatedRefillDate.diff(todaysDate, 'days');

			row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow",
				classes : ["height-75d"]
			}),
			vseparator = $.UI.create("View", {
				apiName : "View",
				//classes : ["vseparator", "height-70", "touch-disabled"]
			}),
			content = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view", "vgroup"]
			}),
			sub = $.UI.create("View", {
				apiName : "View",
				//classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
			}),
			title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-title-lbl", "left"]
			}),
			detail = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-info-lbl"]
			}),
			rx = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl", "left"]
			}),
			due = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl"]
			});
			row.className = "others";
			content.rowId = transform.id;
			//content.addEventListener("click", didItemClick);
			title.text = utilities.ucfirst(transform.presc_name);
			rx.text = addRx(transform.rx_number);

			detail.add(rx);
			detail.add(due);
			content.add(title);
			content.add(detail);
			row.add(content);
			if (ndays < 0) {
				var overDueLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
				});
				content = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-view"]
				});
				overDueDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				overDueLbl.text = strings.msgOverdueBy;
				overDueDetailLbl.text = ndays;
				row.add(content);
				content.add(overDueLbl);
				content.add(overDueDetailLbl);
			} else if (ndays >= 0) {
				var dueForRefillLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
				});
				content = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-view"]
				});
				dueForRefillDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]

				});
				dueForRefillLbl.text = strings.msgDueFoRefillIn;
				dueForRefillDetailLbl.text = ndays + "days";
				row.add(content);
				content.add(dueForRefillLbl);
				content.add(dueForRefillDetailLbl);
			} else {

			}
			$.otherPrescriptionsSection.add(row);
		}

	}
	$.tableView.data = [$.gettingRefilledSection, $.readyForRefillSection, $.otherPrescriptionsSection];

}

function didItemSwipe(e) {
	/**
	 * On swipe left & right is 0 - move the view by 150dp from right, to show the buttons.
	 * On swipe right & right is 150 - move the view back to right = 0, to hide the buttons.
	 * value of right is being checked to avoid animating the view, if it is already at the right place.
	 */
	console.log("refill width" + refillButton.right);
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
	console.log("direction" + vseparator.height);
	if (direction == "left" && refillButton.right == 320) {
		console.log("swiped left");
		refillButton.right = 0;
		hideButton.left = "20%";

		console.log("direction" + vseparator.height);
		currentSwipeView = source;
	} else if (direction == "right" && refillButton.right == 320) {
		console.log("swiped right");
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
	console.log(action);
	if (action === "search") {
		$.tableView.top === 0 ? showSearch() : hideSearch();
	} else if (action === "sort") {
		sort();
	} else if (action == "unhide") {
		unhide();

	} else if (action === "refresh") {
		refreshPrescriptions();
	}
}
function unhide(){

		http.request({
		method : "PRESCRIPTIONS_GET",
		data : {
			filter : null,
			data : [{
				id : "x",
				sort_order_preferences :"x",
				prescription_display_status : "hidden"

			}]

		},
		success : didGetHiddenPrescriptions,

	});
}
function didGetHiddenPrescriptions(result){
	allPrescriptions = result.data.prescriptions || [];
	hiddenPrescriptions = new Array;
	items = [];
	for(i=0;i<allPrescriptions.length;i++){
		if(allPrescriptions[i].prescription_display_status === "hidden"){
			hiddenPrescriptions[i]=allPrescriptions[i];
			 items.push(hiddenPrescriptions[i]);
			
			
		}
	}
	console.log(items);
	var template = [{
		apiName : "View",
		properties : $.createStyle({
			classes : ["top", "auto-height", "vgroup"]
		}),
		children : [{
			items : [{
				apiName : "Label",
				properties : $.createStyle({
					classes : ["left", "list-item-title-lbl"]
				}),
				text : "presc_name"
			}, {
				apiName : "Label",
				properties : $.createStyle({
					classes : ["left", "padding-top", "list-item-subtitle-lbl"]
				}),
				text : "rx_number"
			}]
		}]
	}];

	
	$.unhideMenu.setItems(items,template);
	$.toggleMenu.hide();
	$.unhideMenu.show();
}
function didClickClose(e){
	$.unhideMenu.hide();
}
function didClickSelectAll(e){
	$.unhideMenu.setSelectedItems({},true);
}
function didClickSelectNone(e){
	$.unhideMenu.setSelectedItems({},false);
}
function didClickUnhide(e){
	var unhiddenPrescriptions=_.where(items, {
		selected : true
	});
	$.unhideMenu.hide();
	http.request({
		method : "PRESCRIPTIONS_UNHIDE",
		data : {
			filter : null,
			data : [{
				id : "x",
				sort_order_preferences : "x",
				prescription_display_status : "active"

			}]

		},
		success : didSuccess,

	});
}
function didClickSort(e){
	$.sortMenu.hide();
	var action=e.data.action;
	if(action == "sortIndex0"){
		http.request({
		method : "PRESCRIPTIONS_SORT_NAME",
		data : {
			filter : null,
			data : [{
				id : "x",
				sort_order_preferences : sortPrescriptions[0].code_values,
				prescription_display_status : "active/hidden"

			}]

		},
		success : didSuccess,

	});
	}
	else if(action == "sortIndex1"){
			http.request({
		method : "PRESCRIPTIONS_SORT_NAME",
		data : {
			filter : null,
			data : [{
				id : "x",
				sort_order_preferences : sortPrescriptions[1].code_values,
				prescription_display_status : "active/hidden"

			}]

		},
		success : didSuccess,

	});
	}
	else if(action == "sortIndex2"){
			http.request({
		method : "PRESCRIPTIONS_SORT_NAME",
		data : {
			filter : null,
			data : [{
				id : "x",
				sort_order_preferences : sortPrescriptions[2].code_values,
				prescription_display_status : "active/hidden"

			}]

		},
		success : didSuccess,

	});
	}
}
function sort() {

	http.request({
		method : "CODES_GET",
		data : {
			codes : [{
				code_name : "x"
			}, {
				code_name : "x"
			}]
		},

		success : performSort,

	});

}

function performSort(result) {
	sortPrescriptions = result.data.code_values || [];

	items = [{
		title : "sort " + sortPrescriptions[0].code_values,
		action : "sortIndex0"

	}, {
		title : "sort by " + sortPrescriptions[1].code_values,
		action : "sortIndex1"

	}, {
		title : "sort by " + sortPrescriptions[2].code_values,
		action : "sortIndex2"

	}, {
		title : "close",

	}], $.sortMenu.setItems(items);
	$.toggleMenu.hide();
	$.sortMenu.show();

}

function refreshPrescriptions() {
	http.request({
		method : "PRESCRIPTIONS_GET",
		data : {
			filter : null,
			data : [{
				id : "x",
				sort_order_preferences : "x",
				prescription_display_status : "active/hidden"

			}]

		},
		success : didSuccess,

	});
}

function showSearch() {
	var top = 40;
	var listAnim = Ti.UI.createAnimation({
		top : top,
		duration : 150
	});
	listAnim.addEventListener("complete", function onComplete() {
		listAnim.removeEventListener("complete", onComplete);
		$.tableView.top = top;
		$.searchbarView.animate({
			opacity : 1,
			duration : 150
		}, function(searchbar) {
			$.searchbarView.opacity = 1;
		});
	});
	$.tableView.animate(listAnim);
}

function hideSearch() {
	var top = 0;

	$.searchbarView.animate({
		opacity : 0,
		duration : 150
	}, function(searchbar) {
		$.searchbarView.opacity = 0;
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

function performSearch() {

	allPrescriptions = new Array;
	var searchString = $.searchbar.getValue();
	j = 0;
	i = 0;
	if (prescriptions.length) {
		for ( i = 0; i < prescriptions.length; i++) {
			if (prescriptions[i].presc_name.match(searchString) || prescriptions[i].rx_number.match(searchString)) {

				allPrescriptions[i] = prescriptions[i];

			}
		}

	}

	var inprocessPrescriptions = _.reject(allPrescriptions, function(obj) {
		return obj.refill_status != "INPROCESS" && obj.refill_status != "READYFORPICKUP";
	}),

	    readyForRefill = _.where(allPrescriptions, {
		refill_status : "READYTOREFILL"
	}),
	    otherPrescriptions = _.where(allPrescriptions, {
		refill_status : "OTHERS"
	});

	// console.log("in process");
	// console.log(inprocessPrescriptions);
	// console.log("ready for refill");
	// console.log(readyForRefill);
	// console.log("other presc");
	// console.log(otherPrescriptions);
	if (allPrescriptions.length) {
		if (inprocessPrescriptions.length) {

			$.gettingRefilledSection = uihelper.createTableViewSection($, strings.sectionGettingRefilled);
			for (var i in inprocessPrescriptions) {
				var transform = inprocessPrescriptions[i];
				if (transform.refill_status == "INPROCESS") {
					console.log("in process");
					row = $.UI.create("TableViewRow", {
						apiName : "TableViewRow"
					}),
					contentView = $.UI.create("View", {
						apiName : "View",
						classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
					}),
					title = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-title-lbl", "left"]
					});
					orderProcessedLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-info-lbl", "left"]
					});
					orderProcessedBgImage = $.UI.create("View", {
						apiName : "View",
						classes : ["left", "progressbar-bg"]
					});
					orderProcessedFgImage = $.UI.create("View", {
						apiName : "View",
						classes : ["left", "progressbar-fg"]
					});
					readyByDate1 = moment(transform.latest_refill_promised_date).format("dddd, hA");
					readyByDate2 = moment(transform.latest_refill_promised_date, "YYYY/MM/DD");
					todaysDate = moment();

					ndays = readyByDate2.diff(todaysDate, 'days');
					orderProcessedLbl.text = strings.msgOrderPlacedReadyBy + " " + readyByDate1;

					//get the % for processed image

					curr = moment();
					refillRequestedDate = moment(transform.latest_refill_requested_date, "YYYY/MM/DD");
					promisedDate = moment(transform.latest_refill_promised_date, "YYYY/MM/DD");
					currentDate = moment(curr, "YYYY/MM/DD");

					currentMinusRequested = currentDate.diff(refillRequestedDate, 'seconds');
					promisedMinusRequested = promisedDate.diff(refillRequestedDate, 'seconds');

					remainingDays = Math.floor((currentMinusRequested / promisedMinusRequested ) * 100) + "%";

					orderProcessedFgImage.width = remainingDays;
					contentView.rowId = transform.id;
					//contentView.addEventListener("click", didItemClick);
					title.text = utilities.ucfirst(transform.presc_name);
					contentView.add(title);
					contentView.add(orderProcessedLbl);
					contentView.add(orderProcessedBgImage);
					orderProcessedBgImage.add(orderProcessedFgImage);
					row.add(contentView);
					$.gettingRefilledSection.add(row);
					//$.tableView.data = [$.gettingRefilledSection];

				} else if (transform.refill_status == "READYFORPICKUP") {
					console.log("pick up");
					row = $.UI.create("TableViewRow", {
						apiName : "TableViewRow",

					}),
					contentView = $.UI.create("View", {
						apiName : "View",
						classes : ["padding-top", "margin-left", "margin-right", "auto-height", "vgroup"]
					}),
					detail = $.UI.create("View", {
						apiName : "View",
						classes : ["list-item-view"]
					}),
					title = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-title-lbl", "left"]
					}),
					orderPickUpLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-info-lbl"]
					}),
					orderPickUpLblIcon = $.UI.create("Label", {
						apiName : "Label",
						classes : ["small-icon", "left", "success-color"],

					}), title.text = utilities.ucfirst(transform.presc_name);
					orderPickUpLbl.text = strings.msgYourOrderIsReady;
					orderPickUpLblIcon.text = Alloy.CFG.icons.filled_success;

					detail.add(orderPickUpLbl);
					detail.add(orderPickUpLblIcon);
					contentView.add(title);
					contentView.add(detail);
					row.add(contentView);
					$.gettingRefilledSection.add(row);
					//$.tableView.data = [$.gettingRefilledSection];
					var styleArgsNormal = $.createStyle({

						classes : ["arrow-left", "tooltip"],
						id : 'pickUpTooltip',

						width : 150,
						height : 80,
						left : 200

					});
					var styleArgsCritical = $.createStyle({

						classes : ["arrow-left", "critical-tooltip"],
						id : 'pickUpTooltip',

						width : 150,
						height : 80,
						left : 200

					});
					//calculate the number of days left for picking up the prescription
					filledDate = moment(transform.latest_filled_date, "YYYY/MM/DD");
					todaysDate = moment();
					ndays = todaysDate.diff(filledDate, 'days');

					restockingPeriod = transform.restockperiod;
					noOfDaysLeftForPickUp = restockingPeriod - ndays;

					if (noOfDaysLeftForPickUp > 3) {

						var styledLbl = Alloy.createWidget("com.mscripts.styledlabel", "widget", $.createStyle({
							classes : ["tooltip-lbl"],
							html : String.format(msgPickup, noOfDaysLeftForPickUp)
						}));

						pickUpTooltipNormal = Alloy.createWidget("com.mscripts.tooltip", "widget", styleArgsNormal);
						pickUpTooltipNormal.setContentView(styledLbl.getView());
						row.add(pickUpTooltipNormal.getView());
						pickUpTooltipNormal.show();

					} else if (noOfDaysLeftForPickUp <= 3) {
						var styledLbl = Alloy.createWidget("com.mscripts.styledlabel", "widget", $.createStyle({
							classes : ["tooltip-lbl"],
							html : String.format(msgPickup, noOfDaysLeftForPickUp)
						}));

						pickUpTooltipCritical = Alloy.createWidget("com.mscripts.tooltip", "widget", styleArgsCritical);
						pickUpTooltipCritical.setContentView(styledLbl.getView());
						row.add(pickUpTooltipCritical.getView());
						pickUpTooltipCritical.show();

					}
				}
			}

		}

		if (readyForRefill.length) {

			$.readyForRefillSection = uihelper.createTableViewSection($, strings.sectionReadyForRefill);
			for (var i in readyForRefill) {
				console.log("ready for refill");
				var transform = readyForRefill[i],
				    anticipatedRefillDate = moment(transform.anticipated_refill_date, "YYYY/MM/DD");
				todaysDate = moment();

				ndays = anticipatedRefillDate.diff(todaysDate, 'days');

				row = $.UI.create("TableViewRow", {
					apiName : "TableViewRow",
					classes : ["height-75d"],

				}),

				options = $.UI.create("View", {
					apiName : "View",
					//classes : ["primary-btn-small"]
				}),
				opt1 = $.UI.create("Button", {
					apiName : "Button",
					//classes : ["primary-btn-small"]
				}),
				opt2 = $.UI.create("Button", {
					apiName : "Button",
					classes : ["primary-btn-small"]
				}),
				vseparator = $.UI.create("View", {
					apiName : "View",
					//classes : ["vseparator", "height-90", "touch-disabled"]
				}),
				content = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-view", "vgroup"]
				}),
				sub = $.UI.create("View", {
					apiName : "View",
					//classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
				}),
				title = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-title-lbl", "left"]
				}),
				detail = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-info-lbl"]
				}),
				rx = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-info-lbl", "left"]
				}),
				due = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-info-lbl"]
				});
				row.className = "readyForRefill";
				sub.rowId = transform.id;
				//sub.addEventListener("click", didItemClick);
				//content.addEventListener("swipe", didItemSwipe);
				title.text = utilities.ucfirst(transform.presc_name);
				rx.text = addRx(transform.rx_number);

				//options.add(opt1);
				//options.add(opt2);
				//options.add(vseparator);
				detail.add(rx);
				detail.add(due);
				content.add(title);
				content.add(detail);
				//content.add(sub);
				row.add(options);
				row.add(content);
				if (ndays < 0) {
					var overDueLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
					});
					content = $.UI.create("View", {
						apiName : "View",
						classes : ["list-item-view"]
					});
					overDueDetailLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-critical-detail-lbl", "right"]
					});
					overDueLbl.text = strings.msgOverdueBy;
					overDueDetailLbl.text = Math.abs(ndays) + "days";
					row.add(content);
					content.add(overDueLbl);
					content.add(overDueDetailLbl);
					console.log("came here" + ndays);
					if (ndays >= 60) {

						hideFromList = $.UI.create("Button", {
							apiName : "Button",
							classes : ["primary-btn-small", "lbl-hide"]
						});
						row.add(hideFromList);
					}
				} else if (ndays >= 0) {
					var dueForRefillLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
					});
					content = $.UI.create("View", {
						apiName : "View",
						classes : ["list-item-view"]
					});
					dueForRefillDetailLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-critical-detail-lbl", "right"]
					});
					dueForRefillLbl.text = strings.msgDueFoRefillIn;
					dueForRefillDetailLbl.text = ndays + "days";
					row.add(content);
					content.add(dueForRefillLbl);
					content.add(dueForRefillDetailLbl);
				} else {

				}

				$.readyForRefillSection.add(row);

				//$.tableView.data = [$.readyForRefillSection];

			}

		}

		if (otherPrescriptions.length) {

			$.otherPrescriptionsSection = uihelper.createTableViewSection($, strings.sectionOtherPrescriptions);
			for (var i in otherPrescriptions) {
				console.log("others");
				var transform = otherPrescriptions[i],
				    anticipatedRefillDate = moment(transform.anticipated_refill_date, "YYYY/MM/DD");
				todaysDate = moment();

				ndays = anticipatedRefillDate.diff(todaysDate, 'days');

				row = $.UI.create("TableViewRow", {
					apiName : "TableViewRow",
					classes : ["height-75d"]
				}),
				vseparator = $.UI.create("View", {
					apiName : "View",
					//classes : ["vseparator", "height-70", "touch-disabled"]
				}),
				content = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-view", "vgroup"]
				}),
				sub = $.UI.create("View", {
					apiName : "View",
					//classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
				}),
				title = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-title-lbl", "left"]
				}),
				detail = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-info-lbl"]
				}),
				rx = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-info-lbl", "left"]
				}),
				due = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-info-lbl"]
				});
				row.className = "others";
				content.rowId = transform.id;
				//content.addEventListener("click", didItemClick);
				title.text = utilities.ucfirst(transform.presc_name);
				rx.text = addRx(transform.rx_number);

				detail.add(rx);
				detail.add(due);
				content.add(title);
				content.add(detail);
				row.add(content);
				if (ndays < 0) {
					var overDueLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
					});
					content = $.UI.create("View", {
						apiName : "View",
						classes : ["list-item-view"]
					});
					overDueDetailLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-critical-detail-lbl", "right"]
					});
					overDueLbl.text = strings.msgOverdueBy;
					overDueDetailLbl.text = ndays;
					row.add(content);
					content.add(overDueLbl);
					content.add(overDueDetailLbl);
				} else if (ndays >= 0) {
					var dueForRefillLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
					});
					content = $.UI.create("View", {
						apiName : "View",
						classes : ["list-item-view"]
					});
					dueForRefillDetailLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-critical-detail-lbl", "right"]
					});
					dueForRefillLbl.text = strings.msgDueFoRefillIn;
					dueForRefillDetailLbl.text = ndays + "days";
					row.add(content);
					content.add(dueForRefillLbl);
					content.add(dueForRefillDetailLbl);
				} else {

				}
				$.otherPrescriptionsSection.add(row);

			}
		}
		if (inprocessPrescriptions.length && readyForRefill.length && otherPrescriptions.length) {
			console.log("1");
			$.tableView.data = [$.gettingRefilledSection, $.readyForRefillSection, $.otherPrescriptionsSection];
		} else if (inprocessPrescriptions.length && readyForRefill.length) {
			console.log("2");
			$.tableView.data = [$.gettingRefilledSection, $.readyForRefillSection];
		} else if (inprocessPrescriptions.length && otherPrescriptions.length) {
			console.log("3");
			$.tableView.data = [$.gettingRefilledSection, $.otherPrescriptionsSection];
		} else if (readyForRefill.length && otherPrescriptions.length) {
			console.log("4");
			$.tableView.data = [$.readyForRefillSection, $.otherPrescriptionsSection];
		} else if (otherPrescriptions.length) {
			console.log("5");
			$.tableView.data = [$.otherPrescriptionsSection];
		} else if (readyForRefill.length) {
			console.log("6");
			$.tableView.data = [$.readyForRefillSection];
		} else if (inprocessPrescriptions.length) {
			console.log("7");
			$.tableView.data = [$.gettingRefilledSection];
		}
	} else {
		alert("No prescriptions found. Please enter your search criteria again");
	}
}

function didItemClick(e) {
	var prescriptions = {
		"id" : "1",
		"rx_number" : "2345678",
		"presc_name" : "Lovastin, 200 mg",
		"is_overdue" : "1",
		"prefill" : "x",
		"doctor_id" : "x",
		"anticipated_refill_date" : "2015/12/15",
		"expiration_date" : "2015/12/15",
		"refill_remaining_preferences" : "x",
		"refill_started_date" : "x",
		"latest_refill_requested_date" : "2015-02-11",
		"latest_refill_promised_date" : "2015-02-13",
		"latest_filled_date" : "2015-02-16",
		"restockperiod" : "10",
		"presc_last_filled_date" : "x",
		"latest_sold_date" : "x",
		"latest_refill_completed_date" : "x",
		"refill_status" : "OTHERS"
	};
	app.navigator.open({
		ctrl : "prescriptionDetails",
		title : prescriptions.presc_name,
		ctrlArguments : {
			prescription : prescriptions
		},
		stack : true
	});
}

function terminate() {
	$.destroy();
}

function didAndroidBack() {
	return $.toggleMenu.hide();
}

function didHidePrescriptions(result) {
	hiddenPrescriptionStatus = result.status || [];
	
	alert(result.message);
	if (hiddenPrescriptionStatus === "Success") {
		http.request({
			method : "PRESCRIPTIONS_GET",
			data : {
				filter : null,
				data : [{
					id : "x",
					sort_order_preferences : "x",
					prescription_display_status : "active/hidden"

				}]

			},
			success : didSuccess,

		});
	}
	$.tableView.addEventListener("click", didItemClick);
}

function didHideFromList() {
	$.tableView.removeEventListener("click", didItemClick);
	http.request({
		method : "PRESCRIPTIONS_HIDE",
		data : {
			filter : null,
			data : [{
				prescriptions : [{
					id : "2"
				}]
			}]
		},
		success : didHidePrescriptions,

	});
}

exports.init = init;
exports.terminate = terminate;
exports.androidback = didAndroidBack;
