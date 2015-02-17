var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    logger = require("logger"),
    http = require("requestwrapper"),
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    dialog = require("dialog"),
    uihelper = require("uihelper"),

    orders,
    pickupdetails;

function init() {
	orders = [{
		id : 1,
		name : "Januvia, 100mg tab",
		subtitle : "Should be ready by 10/10/2015",
		icon : Alloy.CFG.icons.success

	},
	{
	id : 2,
	name : "Hydronalin, 20mg",
	subtitle : "You already ordered this prescription",
	icon : Alloy.CFG.icons.success
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
			    name = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-title-lbl", "left"]
			}),

			    subtitle = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left", "h4", "#ffffff", "touch-disabled"],
				id : "addLbl"
			}),

			    icon = $.UI.create("Label", {
				apiName : "Label",
				classes : ["success-filled", "fg-primary", "touch-disabled"],
				id : "addIcon"
			});

			containerView.rowId = transform.id;

			name.text = transform.name;
			subtitle.text = transform.subtitle;
			
			containerView.add(name);
			containerView.add(subtitle);
			containerView.add(icon);
			row.add(containerView);

		}
		$.yourOrderSection = uihelper.createTableViewSection($, strings.msgRefillOrder);

		$.yourOrderSection.add(row);

		data.push($.yourOrderSection);
	}

	$.bundledView.data = [$.yourOrderSection];

}

function didClickDone(e) {

}
exports.init = init;


