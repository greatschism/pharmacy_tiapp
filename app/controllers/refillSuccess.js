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
    readyToRefill,
    otherPrescriptions,
    prescriptions,
    addr,
//row,
    allPrescriptions,
    currentSwipeView;

function init() {
	http.request({
		method : "PRESCRIPTIONS_REFILL",
		success : didSuccessRefill
	});

}

function didSignUp(_result, _passthrough) {
	app.navigator.open({
		ctrl : "fullSignup",
		titleid : "",
		stack : true,
		ctrlArguments : _passthrough
	});
}

function didClickDone(_result, _passthrough) {
	app.navigator.open({
		ctrl : "home",
		titleid : "",
		stack : false,
		ctrlArguments : _passthrough
	});
}

function addRx(str) {
	var strTemp = "Rx# ";
	str = strTemp + str;
	return str;
}

function didSuccessRefill(result) {

	prescriptions = result.data.prescriptions || [],
	addr = result.data.stores;
	{
		console.log("prescriptionsdata" + prescriptions); {
			$.addressSection = uihelper.createTableViewSection($, strings.msgRefillPlaced); {

				row = $.UI.create("TableViewRow", {
					apiName : "TableViewRow",
					classes : ["height-25"]
				}),
				content = $.UI.create("View", {
					apiName : "View",
					classes : ["hgroup", "auto-height"]
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

				for (var i in prescriptions) {

					http.request({
						method : "STORES_GET",

						data : {

							client_identifier : "x",
							version : "x",
							session_id : "x",
							filter : [{
								get_type : "store_details"
							}],
							data : [{
								stores : {
									id : prescriptions[i].refill_store_id
								}
							}]

						},

						success : didSuccessStore
					});

					function didSuccessStore(result) {

						// addr = result.data.stores;
						// console.log("get store" + result);
						//
						// rx.text = addr.addressline1;
						// due.text = prescriptions[i].refill_store_id;
						// console.log("address1" + addr.addressline1);
						// row.add(content);
						// title.add(rx);
						// detail.add(due);
						//
						// content.add(title);
						// content.add(detail);
						//
						// row.add(content);
						// console.log("content" + rx);
						//
						//
						// console.log("address1" + addr.addressline1);

						addr = result.data.stores;
						console.log("get store" + result);

						rx.text = addr.addressline1;
						due.text = prescriptions[i].refill_store_id;
						console.log("address1" + addr.addressline1);

						detail.add(rx);
						detail.add(due);

						content.add(title);
						content.add(detail);

						row.add(content);
						console.log("content" + rx.text);

						console.log("address1" + addr.addressline1);

						$.addressSection.add(row);
					}

				}
			}

			$.gettingRefilledSection = uihelper.createTableViewSection($, strings.sectionPrescriptionRefilled); {
				for (var i in prescriptions) {
					row = $.UI.create("TableViewRow", {
						apiName : "TableViewRow",
						classes : ["height-25"]
					}),
					// contentView = $.UI.create("View", {
					// apiName : "View",
					// classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
					// }),
					content = $.UI.create("View", {
						apiName : "View",
						classes : ["list-item-view", "vgroup"]
					}),

					title = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-title-lbl", "left"]
					}),

					detail = $.UI.create("View", {
						apiName : "View",
						classes : ["list-item-info-lbl"]
					}),
					orderPickUpLbl = $.UI.create("Label", {
						apiName : "Label",
						classes : ["list-item-info-lbl"]
					}),
					orderPickUpLblIcon = $.UI.create("Label", {
						apiName : "Label",
						classes : ["small-icon", "left", "success-color", "padding-right"],

					}),
					vseparator = $.UI.create("View", {
						apiName : "View",
						//classes : ["vseparator", "height-90", "touch-disabled"]
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

					rx.text = addRx(prescriptions[i].rx_number_id);
					due.text = prescriptions[i].refill_store_id;
					//row.add(content);
					detail.add(rx);
					//detail.add(vseparator);
					detail.add(due);
					orderPickUpLbl.text = prescriptions[i].refill_inline_message;
					orderPickUpLblIcon.text = Alloy.CFG.icons.confirm;

					detail.add(orderPickUpLblIcon);
					detail.add(orderPickUpLbl);
					content.add(rx);
					//content.add(title);
					content.add(due);
					content.add(detail);

					row.add(content);

					$.gettingRefilledSection.add(row);
				}
				//$.gettingRefilledSection.add(row);
			}
		}
	}
	$.tableView.data = [$.addressSection, $.gettingRefilledSection];

}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didItemClick(e) {
	console.log("jhf");

}

exports.init = init;

