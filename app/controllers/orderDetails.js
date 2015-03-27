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
    dialog = require("dialog"),
    uihelper = require("uihelper"),
    prescription,
    addedPrescriptions,
    patientName,
    addIcon,
    orders,
    row2,
    row3,
    pickupdetails,
    picker;

function init() {
	prescription = args.prescription || {};
	patientName = args.patientName;
	addedPrescriptions = args.addedPrescriptions || {};

	picker = Alloy.createWidget("com.mscripts.dropdown", "widget", $.createStyle({
		classes : ["form-dropdown"]
	}));

	orders = [{
		id : 1,
		name : "Lovastin, 200mg tab"

	}];
	data = [];

	addIcon = $.UI.create("Label", {
		apiName : "Label",
		height : 32,
		width : 32,
		classes : ["additionIcon", "small-icon", "padding-right"]
	});
	addIcon.addEventListener("click", didClickAddAnotherPrescription);

	$.yourOrderSection = uihelper.createTableViewSection($, strings.sectionYourOrder, $, addIcon);
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
				classes : ["list-item-title-lbl", "left","h1"]
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
			containerView.add(deleteIcon);
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

	}),

	    addressLine1 = $.UI.create("Label", {
		apiName : "Label",
		text : "1 Sanstome St.",
		font : {
			fontSize : 18,
			bold : true
		},
		top : 0,
		classes : ["list-item-info-lbl", "left","h1"]
	}),
	    addressLine2 = $.UI.create("Label", {
		apiName : "Label",
		top : 30,

		text : "San Franscisco,CA, 94103",
		classes : ["list-item-info-lbl", "left","h2"]
	}),
	    editIcon = $.UI.create("Label", {
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
		classes : ["padding-top", "padding-bottom", "margin-left", "margin-right","auto-height"]

	}),
		 mailTo = $.UI.create("Label", {
		apiName : "Label",
		text : Alloy.Globals.strings.msgMailOrder,
		classes : ["left","h3"]
	});

	containerView.rowId = transform.id;
	containerView.add(mailTo);

	row3.add(containerView);

	$.tableView.data = [$.yourOrderSection, $.pickupDetailsSection];

	picker.on("return", function(e) {

		Ti.API.info("you selected  " + picker.getSelectedItem().title);
		if (picker.getSelectedItem().title == "In store pickup") {

			$.tableView.updateRow(2,row2);

		} else if (picker.getSelectedItem().title == "Mail order") {

			$.tableView.updateRow(2,row3);
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
		method : "PRESCRIPTIONS_REFILL",
		data : {
			filter : null,
			data : [{
				prescriptions : [{
					id : "x",
					rx_number : "x",
					store_id : "x",
					mobile_number : "x",
					pickup_time_group : "x",
					pickup_mode : "instore/mailorder",
					barcode_data : "x",
					barcode_format : "x"
				}, {
					id : "x",
					rx_number : "x",
					store_id : "x",
					mobile_number : "x",
					pickup_time_group : "x",
					pickup_mode : "instore/mailorder",
					barcode_data : "x",
					barcode_format : "x"
				}]
			}]
		},

		success : didSuccess
	});
}

function didSuccess(result) {

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
	//app.navigator.open({
	//	stack : true,
	//	titleid : "titleStoreDetails",
	//	ctrl : "stores"
	//});
	alert("Stores under construction");
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

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews;

