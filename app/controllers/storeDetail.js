var args = arguments[0] || {},
    app = require("core"),
    icons = Alloy.CFG.icons,
    dialog = require("dialog"),
    utilities = require("utilities"),
    moment = require("alloy/moment"),
    store = {};

function init() {

	store = Alloy.Collections.stores.where({
	storeid: args.storeId
	})[0].toJSON();

	$.titleLbl.text = store.addressline1;
	$.subtitleLbl.text = store.subtitle;
	if (Alloy.Globals.loggedIn) {
		$.favoriteLbl.text = store.bookmarked ? icons.favorite : icon.nonfavorite;
	}
	$.distanceLbl.text = store.distance;
	$.callBtn.title = Alloy.Globals.strings.strCall + " (" + store.mobileareacode + ") " + store.mobileprefix + " - " + store.mobilenumber;
	$.homeBtn.color = Alloy._fg_quaternary;
	if (_.isEmpty(Alloy.Globals.currentLocation)) {
		$.distanceView.visible = false;
		$.directionBtn.visible = false;
	}

	var dates = store.hours.date || [],
	    services = store.storeservices.storespecial || [],
	    data = [],
	    date;

	dates = _.sortBy(dates, function(obj) {
		return moment().day(obj.day, "dddd").day();
	});
	date = _.findWhere(dates, {
		day : moment().format("dddd")
	});

	if (dates.length) {
		var datesSection = utilities.createTableViewSection(Alloy.Globals.strings.sectionStoreHours);
		for (var i in dates) {
			var row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),
			    view = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view"]
			}),
			    leftLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left", "width-45", "h5", "color-secondary"]
			}),
			    rightLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["right", "width-45", "h5", "text-right", "color-secondary"]
			});
			leftLbl.text = dates[i].day;
			rightLbl.text = dates[i].storehours;
			view.add(leftLbl);
			view.add(rightLbl);
			row.add(view);
			datesSection.add(row);
		}
		data.push(datesSection);
	}

	if (services.length) {
		var servicesSection = utilities.createTableViewSection(Alloy.Globals.strings.sectionStoreServices);
		for (var i in services) {
			var row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),
			    titleLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["margin-left", "margin-right", "padding-top", "padding-bottom", "auto-height", "h5", "text-left", "color-secondary", "multi-line"]
			});
			titleLbl.text = services[i].service;
			row.add(titleLbl);
			servicesSection.add(row);
		}
		data.push(servicesSection);
	}

	if (date) {
		var storehour = String(date.storehours),
		    till = "",
		    toClose = false,
		    subIndex = storehour.indexOf("-");
		if (subIndex >= 0) {
			from = storehour.substring(0, subIndex - 1);
			till = storehour.substring(subIndex + 1, storehour.length);
			toOpen = moment(from, "h:mm A").diff(moment(), "minutes");
			toClose = moment(till, "h:mm A").diff(moment(), "minutes");
		}
		if (toOpen < 0 && toClose > 0) {
			$.clockIcon.color = Alloy._success_color;
			$.clockLbl.applyProperties({
				text : "Open till ".concat(till),
				color : Alloy._success_color
			});
		} else {
			$.clockIcon.color = Alloy._error_color;
			$.clockLbl.applyProperties({
				text : till ? "Closed at ".concat(till) : "Closed",
				color : Alloy._error_color
			});
		}
	}

	$.tableView.data = data;
}

function underConstruction() {
	dialog.show({
		message : Alloy.Globals.strings.msgUnderConstruction
	});
}

function didClickPhone(e) {
	Ti.Platform.openURL("tel:" + store.mobileareacode + store.mobileprefix + store.mobilenumber);
}

function didClickDirection(e) {
	utilities.getDirection(Alloy.Globals.currentLocation, (store.latitude + "," + store.longitude));
}

function didClickRefill(e) {
	app.navigator.open({
		ctrl : "refill",
		titleid : "titleOrderRefill",
		stack : true,
		ctrlArguments : {
			message : "Refill"
		}
	});
}

function didClickFavorite(e) {
	underConstruction();
}

function didClickHome(e) {
	dialog.show({
		message : String.format(Alloy.Globals.strings.msgChangeHomePharmacy, store.addressline1),
		buttonNames : [Alloy.Globals.strings.btnYes, Alloy.Globals.strings.strCancel],
		cancelIndex : 1,
		success : underConstruction
	});
}

exports.init = init;
