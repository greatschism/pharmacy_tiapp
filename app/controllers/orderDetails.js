var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    logger = require("logger"),
    http = require("requestwrapper"),
    icons = Alloy.CFG.icons,
      resources = require("resources"),
    strings = Alloy.Globals.strings,
    dialog = require("dialog"),
    uihelper = require("uihelper"),

 colls = [{
	
	key : "templates",
	selectedItem : {}
}],


    orders,
    pickupdetails;

function init() {
	//http.request({
	//	method : "ORDER_LIST",
	//	keepBlook : true,
	//	success : didSuccess
	//});

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
				classes : ["footer-view-break"]
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

	    pickupOptions = Alloy.createWidget("com.mscripts.dropdown", {
		apiName : "widget",

		classes : ["form-dropdown", "padding-top"]

	}),
	
	
	


	
	
	
	
	
	
	
	
	
	row2 = $.UI.create("TableViewRow",{
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
		classes : ["list-item-info-lbl", "right", "width-45", "h5", "#4094fc"]
	});




	row.add(pickupOptions.getView());
	
	for (var i in colls) {
		var key = colls[i].key,
		    items = resources.get(key),
		    selectedIndex = -1,
		    choices = [];
		items.forEach(function(obj, index) {
			var item = _.pick(obj, ["titleid", "id", "selected", "version"]);
			if (_.has(obj, "styles") || _.has(obj, "data") || _.has(obj, "strings")) {
				if (_.has(item, "titleid")) {
					item.title = lngStrs[item.titleid];
				} else {
					item.title = item.id;
				}
				if (item.selected) {
					selectedIndex = index;
				}
				choices.push(item);
			}
		});
		colls[i].selectedItem = items[selectedIndex] || {};
		$[key + "Dp"].setChoices(choices);
		$[key + "Dp"].setSelectedIndex(selectedIndex);
	}
	
	
	
	row.addEventListener("click", didClickPickUpOptions);

	containerView.rowId = transform.id;

	containerView.add(addressLine1);
	containerView.add(addressLine2);

	containerView.add(rightBtn);
	rightBtn.addEventListener("click", didClickStoreChange);

	row2.add(containerView);

	$.pickupDetailsSection.add(row);
	$.pickupDetailsSection.add(row2);

	data.push($.pickupDetailsSection);

	$.tableView.data = [$.yourOrderSection, $.pickupDetailsSection];

}

function didSuccess(result) {
	// orders = result.data.orders;
	// http.request({
	// method : "ORDERS_GET",
	// keepBlook : true,
	// success : didReceiveOrders
	// });
}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickOrderRefill(e) {
	app.navigator.open({
		stack : true,
		titleid : "titleYourRefillIsOrdered",
		ctrl : "refillSuccess"
	});
}

function didClickPickUpOptions()
{
	
}


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
}

function setParentViews(view) {
	//$.pickupdetails.setParentView(view);
}

function didItemClick(e) {

}

function moveToNext(e) {

	//	$.pickupdetails.showPicker();
}

function didClickNext() {

	app.navigator.open({
		ctrl : "signup",
		titleid : "",
		stack : true
	});
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;

//exports.setParentViews = setParentViews;

