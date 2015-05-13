var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    DUE_FOR_REFILL_IN_DAYS = Alloy._due_for_refill_in_days,
    msgPickup = Alloy.Globals.strings.msgPickup,
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
	var inprocessPrescriptions = _.reject(prescriptions, function(obj) {
		return obj.refill_status != "INPROCESS" && obj.refill_status != "READYFORPICKUP";
	}),

	    readyForRefill = _.where(prescriptions, {
		refill_status : "READYTOREFILL"
	}),
	    otherPrescriptions = _.where(prescriptions, {
		refill_status : "OTHERS"
	}); {

		$.gettingRefilledSection = uihelper.createTableViewSection($, strings.sectionPrescriptionRefilled);

		for (var i in inprocessPrescriptions) {
			var transform = inprocessPrescriptions[i];
			if (transform.refill_status == "READYFORPICKUP") {
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
				//$.gettingRefilledSection.add(row);

			}
			$.gettingRefilledSection.add(row); {

				$.otherPrescriptionsSection = uihelper.createTableViewSection($, strings.msgRefillPlaced);
				for (var i in otherPrescriptions) {

					var transform = otherPrescriptions[i],
					    anticipatedRefillDate = moment(transform.anticipated_refill_date, "YYYY/MM/DD");
					todaysDate = moment();
					orderPickUpLblIcon.text = Alloy.CFG.icons.success_filled;

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
					orderPickUpLblIcon = $.UI.create("Label", {
						apiName : "Label",
						classes : ["small-icon", "left", "success-color"],

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
					detail.add(orderPickUpLblIcon);
					content.add(title);
					content.add(detail);
					row.add(content);

					$.otherPrescriptionsSection.add(row);
				}

			}
			$.tableView.data = [$.otherPrescriptionsSection, $.gettingRefilledSection];
			//$.gettingRefilledSection.add(row);
		}
		//$.gettingRefilledSection.add(row);

	}

	function didToggle(e) {
		$.toggleMenu.toggle();
	}

	function didItemClick(e) {
		console.log("jhf");

	}

}

exports.init = init;
