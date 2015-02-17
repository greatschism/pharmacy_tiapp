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
    msgPickUp = Alloy.Globals.strings.msgPickUp,
    gettingRefilled,
    inprocessPrescriptions,
    readyToRefill,
    otherPrescriptions,
    prescriptions,
    allPrescriptions,
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
	prescriptions = result.data.prescriptions || [];
performSearch();
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
	if (action === "Search") {
		showSearch();
	}
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

function performSearch() {
	
	var searchString = $.searchbar.getValue();
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

				console.log(currentMinusRequested);
				console.log(promisedMinusRequested);
				remainingDays = Math.floor((currentMinusRequested / promisedMinusRequested ) * 100) + "%";
				console.log(remainingDays);
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
			} 
			else if (transform.refill_status == "READYFORPICKUP") {
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
				orderPickUpLblIcon.text = Alloy.CFG.icons.success_filled;

				detail.add(orderPickUpLbl);
				detail.add(orderPickUpLblIcon);
				contentView.add(title);
				contentView.add(detail);
				row.add(contentView);
				$.gettingRefilledSection.add(row);
				var styleArgsNormal = {

					classes : ["text-center"],
					id : 'pickUpTooltip',
					direction : "left",
					height : 70,
					width : 130,
					top : 10,
					right : 20,
					backgroundColor : Alloy.TSS.secondary_color.backgroundColor,
					color : "#FFFFFF"
				};
				var styleArgsCritical = {

					classes : ["text-center"],
					id : 'pickUpTooltip',
					direction : "left",
					height : 70,
					width : 130,
					top : 10,
					right : 20,
					backgroundColor : Alloy.TSS.tooltip_bg_critical_color.backgroundColor,
					color : "#FFFFFF"
				};
				//calculate the number of days left for picking up the prescription
				filledDate = moment(transform.latest_filled_date, "YYYY/MM/DD");
				todaysDate = moment();
				ndays = todaysDate.diff(filledDate, 'days');
				console.log("difference" + ndays);
				restockingPeriod = transform.restockperiod;
				noOfDaysLeftForPickUp = restockingPeriod - ndays;
				console.log("left for pickup" + noOfDaysLeftForPickUp);

				if (noOfDaysLeftForPickUp > 3) {

					pickUpTooltipNormal = Alloy.createWidget("com.mscripts.tooltip", "widget", styleArgsNormal);
					pickUpTooltipNormal.setText(String.format(msgPickUp, noOfDaysLeftForPickUp));
					row.add(pickUpTooltipNormal.getView());
					pickUpTooltipNormal.show();

				} else if (noOfDaysLeftForPickUp <= 3) {

					pickUpTooltipCritical = Alloy.createWidget("com.mscripts.tooltip", "widget", styleArgsCritical);
					pickUpTooltipCritical.setText(String.format(msgPickUp, noOfDaysLeftForPickUp));
					row.add(pickUpTooltipCritical.getView());
					pickUpTooltipCritical.show();

				}
			}
		}

	}

	if (readyForRefill.length) {
		console.log("ready to refill");
		$.readyForRefillSection = uihelper.createTableViewSection($, strings.sectionReadyForRefill);
		for (var i in readyForRefill) {
			console.log('ready for refill' + readyForRefill[i]);
			var transform = readyForRefill[i],
			    anticipatedRefillDate = moment(transform.anticipated_refill_date, "YYYY/MM/DD");
			todaysDate = moment();

			ndays = anticipatedRefillDate.diff(todaysDate, 'days');
			console.log(ndays);
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
					classes : ["list-item-critical-info-lbl", "right"]
				});
				overDueDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				overDueLbl.text = strings.msgOverdueBy;
				overDueDetailLbl.text = ndays;
				detail.add(overDueLbl);
				detail.add(overDueDetailLbl);
			} else if (ndays >= 0) {
				var dueForRefillLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right"]
				});
				dueForRefillDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				dueForRefillLbl.text = strings.msgDueFoRefillIn;
				dueForRefillDetailLbl.text = ndays + "days";
				detail.add(dueForRefillLbl);
				detail.add(dueForRefillDetailLbl);
			} else {

			}

			$.readyForRefillSection.add(row);
		}

	}

	if (otherPrescriptions.length) {
		console.log("others");
		$.otherPrescriptionsSection = uihelper.createTableViewSection($, strings.sectionOtherPrescriptions);
		for (var i in otherPrescriptions) {
			console.log('otherPrescriptions' + otherPrescriptions[i]);
			var transform = otherPrescriptions[i],
			    anticipatedRefillDate = moment(transform.anticipated_refill_date, "YYYY/MM/DD");
			todaysDate = moment();

			ndays = anticipatedRefillDate.diff(todaysDate, 'days');
			console.log(ndays);
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
					classes : ["list-item-critical-info-lbl", "right"]
				});
				overDueDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				overDueLbl.text = strings.msgOverdueBy;
				overDueDetailLbl.text = ndays;
				detail.add(overDueLbl);
				detail.add(overDueDetailLbl);
			} else if (ndays >= 0) {
				var dueForRefillLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right"]
				});
				dueForRefillDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				dueForRefillLbl.text = strings.msgDueFoRefillOn;
				dueForRefillDetailLbl.text = ndays + "days";
				detail.add(dueForRefillLbl);
				detail.add(dueForRefillDetailLbl);
			} else {

			}
			$.otherPrescriptionsSection.add(row);
		}

	}
	$.tableView.data = [$.gettingRefilledSection, $.readyForRefillSection, $.otherPrescriptionsSection];


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
