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
    orders,
    pickupdetails;

function init() {
	prescription = args.prescription || {};

	orders = [{
		id : 1,
		name : "Januvia, 100mg tab"

	}];
	data = [];

	//Your order
	if (orders.length) {
		for (var i in orders) {
			var transform = orders[i],
			    name = moment.unix(transform.name),

			    row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),

			    containerView = $.UI.create("View", {
				apiName : "View",
				classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]

			}),
			    title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-title-lbl", "left"]
			}),

			    footerView = $.UI.create("View", {
				apiName : "View",
				classes : ["footer-view-break", "auto-height"]
			}),
			    contentView = $.UI.create("View", {
				apiName : "View",
				classes : ["auto", "hgroup", "touch-disabled", "#4094fc"]
			}),

			    addIcon = $.UI.create("Label", {
				apiName : "Label",
				classes : ["success-filled", "fg-primary", "touch-disabled"],
				id : "addIcon"
			}),
			    addLbl = $.UI.create("Label", {
				apiName : "Label",
				text : " + Add more prescription",
				classes : ["padding-left", "h4", "#ffffff", "touch-disabled"],
				id : "addLbl"
			});

			containerView.rowId = transform.id;

			title.text = transform.name;
			containerView.add(title);

			row.add(containerView);

			footerView.height = Alloy._content_height;
			contentView.add(addIcon);
			contentView.add(addLbl);
			footerView.add(contentView);
			footerView.addEventListener("click", didClickAddAnotherPrescription);
		}
		$.yourOrderSection = uihelper.createTableViewSection($, strings.sectionYourOrder, footerView);

		$.yourOrderSection.add(row);

		data.push($.yourOrderSection);
	}

	$.pickupDetailsSection = uihelper.createTableViewSection($, strings.sectionPickupDetails);

	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),

	//  picker = Alloy.createWidget("com.mscripts.dropdown", {
	//	apiName : "widget",

	//	classes : ["form-dropdown", "padding-top"]

	//}),

	    picker = Ti.UI.createPicker({
		backgroundColor : "#aab7b7",
		width : Ti.UI.FILL,
		classes : ["height-50", "fill-width", "left"]
	}),

	    items = [];
	items[0] = Ti.UI.createPickerRow({
		title : 'In store pickup'
	});
	items[1] = Ti.UI.createPickerRow({
		title : 'Mail order'
	});

	picker.add(items);
	picker.setSelectedIndex = 0;
	picker.selectionIndicator = true;

	row.add(picker);
	$.pickupDetailsSection.add(row);

	row.addEventListener("click", function(e) {
		if (selectedIndex == 0) {
			row2 = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),

			containerView = $.UI.create("View", {
				apiName : "View",
				classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]

			}),

			addressLine1 = $.UI.create("Label", {
				apiName : "Label",
				text : "1 Sanstome St.",
				classes : ["list-item-info-lbl", "left"]
			}),
			addressLine2 = $.UI.create("Label", {
				apiName : "Label",
				text : "San Franscisco,CA, 94103",
				classes : ["list-item-info-lbl", "left"]
			}),
			rightBtn = $.UI.create("Label", {
				apiName : "Label",
				text : "change",
				classes : ["right", "width-45", "h5", "#4094fc"]
			});

			containerView.rowId = transform.id;

			containerView.add(addressLine1);
			containerView.add(addressLine2);

			containerView.add(rightBtn);
			rightBtn.addEventListener("click", didClickStoreChange);

			row2.add(containerView);
			$.pickupDetailsSection.add(row2);
		} else {
			row2 = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),

			containerView = $.UI.create("View", {
				apiName : "View",
				classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]

			}),

			mailTo = $.UI.create("Label", {

				apiName : "Label",
				text : "Mail to:",
				classes : ["list-item-lbl", "left", "hide"]
			}),

			addressLine1 = $.UI.create("Label", {
				apiName : "Label",
				text : "1 Sanstome St.",
				classes : ["list-item-info-lbl", "left"]
			}),
			addressLine2 = $.UI.create("Label", {
				apiName : "Label",
				text : "San Franscisco,CA, 94103",
				classes : ["list-item-info-lbl", "left"]
			}),

			wrongAddressLbl = $.UI.create("Label", {
				apiName : "Label",
				text : "Wrong address? Call your pharmacy to update",
				classes : ["list-item-lbl", "hide"]
			});

			containerView.rowId = transform.id;
			containerView.add(mailTo);
			containerView.add(addressLine1);
			containerView.add(addressLine2);

			containerView.add(wrongAddressLbl);
			wrongAddressLbl.addEventListener("click", didClickStoreChange);

			row2.add(containerView);
			$.pickupDetailsSection.add(row2);
		}
	});

	data.push($.pickupDetailsSection);

	$.tableView.data = [$.yourOrderSection, $.pickupDetailsSection];

}

function didToggle(e) {
	$.toggleMenu.toggle();
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
				}]
			}]
		},

		keepBlook : true,
		success : didSuccess
	});
}

function didSuccess() {

	app.navigator.open({
		stack : true,
		titleid : "titleYourRefillIsOrdered",
		ctrl : "refillSuccess",
		ctrlArguments : {

		}
	});
}

function didClickPickUpOptions(event) {

	if (selectedIndex == 1) {

	}

	Ti.API.info("user selected   : " + event.selectedValue);

};

function didClickAddAnotherPrescription(e) {

	app.navigator.open({
		stack : true,
		titleid : "titleAddPrescriptions",
		ctrl : "addPrescription"
	});
}

function didClickStoreChange(e) {
	app.navigator.open({
		stack : true,
		titleid : "titleStoreDetails",
		ctrl : "stores"
	});
	alert("Stores under construction");
}

function setParentViews(_view) {

}

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

