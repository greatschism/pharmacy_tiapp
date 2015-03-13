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
    prescriptionList,
    orders,
    row2,
    row3,
    pickupdetails,
    picker = Alloy.createWidget("com.mscripts.dropdown", "widget", $.createStyle({
	classes : ["form-dropdown"]
}));

function init() {
	prescription = args.prescription || {};
	console.log("resut presc name is " + prescription.presc_name);

	orders = [{
		id : 1,
		name : "Lomotil, 200mg tab"

	}];
	data = [];

	$.yourOrderSection = uihelper.createTableViewSection($, strings.sectionYourOrder);
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
				classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]

			}),
			    title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-title-lbl", "left"]
			});

			containerView.rowId = transform.id;
			title.text = transform.name;
			containerView.add(title);

			row.add(containerView);
			$.yourOrderSection.add(row);
		}

		// add more prescriptions
		var row = $.UI.create("TableViewRow", {
			apiName : "TableViewRow"
		}),

		    footerView = $.UI.create("View", {
			apiName : "View",
			horizontalWrap : "false",
			classes : ["hgroup", "auto-height", "padding-top", "padding-bottom", "margin-left", "margin-right"]
		});

		addIcon = $.UI.create("Label", {
			apiName : "Label",
			height : 32,
			left : 10,
			width : 32,
			font : {
				fontSize : 20
			},
			text : Alloy.CFG.icons.plus_with_circle,
			color : "#599DFF",
			classes : ["paddingLeft", "paddingTop", "paddingBottom", "additionIcon", "small-icon"]

		}),
		addLbl = $.UI.create("Label", {
			apiName : "Label",
			text : " Add more prescription",
			color : "#000000",
			classes : ["width-90", "paddingLeft", "auto-height"]

		});

		footerView.add(addIcon);
		footerView.add(addLbl);
		footerView.addEventListener("click", didClickAddAnotherPrescription);
		row.add(footerView);
		$.yourOrderSection.add(row);

		data.push($.yourOrderSection);
	}
	// pickup details section
	$.pickupDetailsSection = uihelper.createTableViewSection($, strings.sectionPickupDetails);

	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),

	    view = $.UI.create("View", {
		apiName : "View",
		classes : ["list-item-view", "auto-height"]
	}),

	    pickerOptions = [{
		title : "In store pickup"
	}, {
		title : "Mail order"
	}];

	picker.setChoices(pickerOptions);

	picker.setSelectedIndex(0);
	console.log("checked");

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
		classes : ["list-item-info-lbl", "left"]
	}),
	    addressLine2 = $.UI.create("Label", {
		apiName : "Label",
		top : 30,

		text : "San Franscisco,CA, 94103",
		classes : ["list-item-info-lbl", "left"]
	}),
	    rightBtn = $.UI.create("Label", {
		apiName : "Label",
		text : "change",
		right : 10,

		color : " #599DFF",
		classes : ["right", "padding-right", "width-30", "h1"]
	});

	containerView.rowId = transform.id;

	containerView.add(addressLine1);
	containerView.add(addressLine2);

	containerView.add(rightBtn);
	rightBtn.addEventListener("click", didClickStoreChange);

	row2.add(containerView);
	$.pickupDetailsSection.add(row2);

	console.log("row 2 added");

	//if picker choosen is mail order add another view

	var row3 = $.UI.create("TableViewRow", {
		apiName : "TableViewRow",
		top : 10
	}),

	    containerView = $.UI.create("View", {
		apiName : "View",
		classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "vgroup"]

	}),

	//    mailTo = $.UI.create("Label", {
	//	apiName : "Label",
	//	text : "Mail to:",
	//	classes : ["list-item-info-lbl", "left"]
	//	}),

	    addressLine1 = $.UI.create("Label", {
		apiName : "Label",
		color : "#BDBDBD",
		font : {
			fontSize : 14
		},
		text : Alloy.Globals.strings.msgMailOrder,
		classes : ["multi-line", "left"]
	});
	//   addressLine2 = $.UI.create("Label", {
	//	apiName : "Label",
	//	text : "San Franscisco,CA, 94103",
	//	top : 5,
	//	classes : ["list-item-info-lbl", "left"]
	//}),

	//    wrongAddressLbl = $.UI.create("Label", {
	//	apiName : "Label",
	//	top : 5,
	//	color : "#599DFF",
	//	text : Alloy.Globals.strings.lblWrongAddress,
	//	classes : ["list-item-info-lbl", "left"]
	//});

	containerView.rowId = transform.id;
	//containerView.add(mailTo);
	containerView.add(addressLine1);
	//containerView.add(addressLine2);
	//containerView.add(wrongAddressLbl);
	//	wrongAddressLbl.addEventListener("click", didClickCallPharmacy);

	row3.add(containerView);

	console.log("row 3 added");

	$.tableView.data = [$.yourOrderSection, $.pickupDetailsSection];

	picker.on("return", function(e) {

		Ti.API.info("you selected  " + picker.getSelectedItem().title);
		if (picker.getSelectedItem().title == "In store pickup") {

			$.tableView.appendRow(row2);
			$.tableView.deleteRow(row3);
			console.log("store view added ");

		} else if (picker.getSelectedItem().title == "Mail order") {

			$.tableView.deleteRow(row2);
			$.tableView.appendRow(row3);
			console.log("mail order added");

		}

	});

}

function didClickDone(e) {
	if (e.getSelectemItem() = "Mail order") {
		//	$.pickupDetailsSection.add(row3);

	}

}

function setParentViews(view) {
	picker.setParentView(view);
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

		keepBlook : true,
		success : didSuccess
	});
}

function didSuccess(result) {

	var abc = result.data.prescriptions || [];
	console.log("pratibha" + abc);

	app.navigator.open({
		stack : true,
		titleid : "titleYourRefillIsOrdered",
		ctrl : "orderSuccess",
		ctrlArguments : {
			prescription : prescription.rx_number
		}
	});

}

function didClickAddAnotherPrescription(e) {

	app.navigator.open({
		stack : true,
		titleid : "Add prescriptions",
		ctrl : "addPrescription"
	});
}

function didClickStoreChange(e) {
	//app.navigator.open({
	//	stack : true,
	//	titleid : "titleStoreDetails",
	//	ctrl : "stores"
	//});
	alert("Stores under construction");
}

function didClickCallPharmacy(e) {
	var number = "6172837737";
	Ti.platform.openURL('tel:' + number);
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
exports.setParentViews = setParentViews;

