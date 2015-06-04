var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    logger = require("logger"),
    http = require("requestwrapper"),
    icons = Alloy.CFG.icons,
    resources = require("resources"),
    config = require("config"),
    utilities = require("utilities"),
    strings = Alloy.Globals.strings,
    uihelper = require("uihelper"),
    prescription,
    addedPrescriptions,
    patientName,
    addIcon,
    orders,
    row2,
    row3,
    pickupdetails,
    picker,
    storeId = 2109,
    addressLine1,
    addressLine2;

function init() {
	Alloy.Models.store.on("change", didChangeStore);
	prescription = args.prescription || {};
	patientName = args.patientName;
	addedPrescriptions = args.addedPrescriptions || {};

	picker = Alloy.createWidget("ti.dropdown", "widget", $.createStyle({
		classes : ["form-dropdown"]
	}));

	orders = [{
		id : 1,
		name : prescription.presc_name

	}];
	data = [];

	addIcon = $.UI.create("Label", {
		apiName : "Label",
		height : 32,
		width : 32,
		classes : ["additionIcon", "small-icon", "padding-right"]
	});
	addIcon.addEventListener("click", didClickAddAnotherPrescription);

	$.yourOrderSection = uihelper.createTableViewSection($, strings.sectionYourOrder, $);
	//Your orders
	if (orders.length) {
		for (var i in orders) {
			var transform = orders[i],
			    name = moment.unix(transform.name),

			    row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),

			    containerView = $.UI.create("View", {
				apiName : "View",
				classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height"]

			}),
			    title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-title-lbl", "left", "h1"]
			}),
			    deleteIcon = $.UI.create("Label", {
				apiName : "Label",
				height : 32,
				width : 32,
				classes : ["deleteIcon", "small-icon", "right"]
			});

			containerView.rowId = transform.id;
			title.text = transform.name;
			containerView.add(title);
			//containerView.add(deleteIcon);
			row.add(containerView);
			$.yourOrderSection.add(row);
		}//end of orders loop

	}
	// pickup details section

	$.pickupDetailsSection = uihelper.createTableViewSection($, strings.sectionPickupDetails, false);

	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),

	    view = $.UI.create("View", {
		apiName : "View",
		classes : ["list-item-view", "padding-top", "padding-bottom", "auto-height"]
	}),

	    pickerOptions = [{
		title : "In store pickup"
	}, {
		title : "Mail order"
	}];

	picker.setChoices(pickerOptions);

	picker.setSelectedIndex(0);

	view.add(picker.getView());
	row.add(view);
	$.pickupDetailsSection.add(row);

	var row2 = $.UI.create("TableViewRow", {

		apiName : "TableViewRow"
	}),

	    containerView = $.UI.create("View", {
		apiName : "View",
		classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height"]

	});

	addressLine1 = $.UI.create("Label", {
		apiName : "Label",
		text : "2130 Ruf Snow Drive",
		font : {
			fontSize : 18,
			bold : true
		},
		top : 0,
		classes : ["list-item-info-lbl", "left", "h1"]
	}),
	addressLine2 = $.UI.create("Label", {
		apiName : "Label",
		top : 30,

		text : "Keller, TX, 76248",
		classes : ["list-item-info-lbl", "left", "h2"]
	});
	var editIcon = $.UI.create("Label", {
		apiName : "Label",
		height : 32,
		width : 32,
		classes : ["editIcon", "small-icon", "right"]
	});

	containerView.rowId = transform.id;

	containerView.add(addressLine1);
	containerView.add(addressLine2);

	containerView.add(editIcon);
	editIcon.addEventListener("click", didClickStoreChange);

	row2.add(containerView);
	$.pickupDetailsSection.add(row2);

	var row3 = $.UI.create("TableViewRow", {
		apiName : "TableViewRow",
	}),

	    containerView = $.UI.create("View", {
		apiName : "View",
		classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height"]

	}),
	    mailTo = $.UI.create("Label", {
		apiName : "Label",
		text : Alloy.Globals.strings.msgMailOrder,
		classes : ["left", "h3"]
	});

	containerView.rowId = transform.id;
	containerView.add(mailTo);

	row3.add(containerView);

	$.tableView.data = [$.yourOrderSection, $.pickupDetailsSection];

	picker.on("return", function(e) {

		Ti.API.info("you selected  " + picker.getSelectedItem().title);
		if (picker.getSelectedItem().title == "In store pickup") {

			$.tableView.updateRow(2, row2);

		} else if (picker.getSelectedItem().title == "Mail order") {

			$.tableView.updateRow(2, row3);
		}

	});

}

function didClickDone(e) {

}

function setParentViews(view) {
	picker.setParentView(view);
}

function didClickOrderRefill(e) {
	http.request({
		method : "prescriptions_refill",
		data : {
			data : [{
				prescriptions : {
					id : prescription.id,
					rx_number : prescription.rx_number,
					store_id : storeId,
					mobile_number : "",
					pickup_time_group : "pickupAsap",
					pickup_mode : "instore",
					barcode_data : "x",
					barcode_format : "x"
				}
			}]
		},
		success : didSuccess
	});
}

function didSuccess(result) {

	uihelper.showDialog({
		message : "Your refill has been placed successfully. It will be ready by May 1st at 8:00 AM. Call 425-555-1212 with any questions.",
		success : function() {
			app.navigator.closeToRoot();
			Ti.App.fireEvent("reload");
		}
	});
	return;

	//var abc = result.data.prescriptions || [];

	app.navigator.open({
		stack : true,
		titleid : "titleYourRefillIsOrdered",
		ctrl : "orderSuccess",
		ctrlArguments : {
			//	prescription : prescription.rx_number
		}
	});

}

function didClickAddAnotherPrescription(e) {

	app.navigator.open({
		stack : true,
		titleid : "titleAddPrescriptions",
		ctrl : "addPrescription",
		ctrlArguments : {
			patientName : patientName
		}
	});
	//alert("under construction");
}

function didClickStoreChange(e) {
	app.navigator.open({
		stack : true,
		titleid : "titleStores",
		ctrl : "stores",
		ctrlArguments : {
			orgin : "orderDetails"
		}
	});
}

// function didClickCallPharmacy(e) {
// var number = "6172837737";
// Ti.platform.openURL('tel:' + number);
// }

function didItemClick(e) {

}

function moveToNext(e) {

}

function didClickNext() {

}

function didChangeStore(e) {
	storeId = Alloy.Models.store.get("storeid");
	addressLine1.text = Alloy.Models.store.get("addressline1");
	addressLine2.text = Alloy.Models.store.get("city") + ", " + Alloy.Models.store.get("state") + ", " + Alloy.Models.store.get("zip");
}

function terminate() {
	Alloy.Models.store.off("change", didChangeStore);
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews;

