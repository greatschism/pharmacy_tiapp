var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    icons = Alloy.CFG.icons,
    store = {};

function init() {

	store = Alloy.Collections.stores.where({
	storeid: args.storeId
	})[0].toJSON();

	$.titleLbl.text = store.addressline1;
	$.subtitleLbl.text = store.subtitle;

	if (Alloy.Globals.loggedIn) {
		$.favoriteIconLbl.text = store.favorite;
		if (store.favorite) {
			$.favoriteBtn.title = Alloy.Globals.strings.btnRemoveFromFavorites;
		}
		$.homeBtn.color = Number(store.ishomepharmacy) ? Alloy.TSS.primary_color.color : Alloy.TSS.unselected_color.color;
	}

	if (!store.distance_enabled) {
		$.directionBtn.visible = false;
	}

	$.callLbl.setHtml(String.format(Alloy.Globals.strings.strCall, "(" + store.mobileareacode + ")" + store.mobileprefix + "-" + store.mobilenumber));

	var dates = _.sortBy(store.hours.date || [], function(obj) {
		return moment().day(obj.day, "dddd").day();
	}),
	    date = _.findWhere(dates, {
		day : moment().format("dddd")
	}),
	    services = store.storeservices.storespecial || [],
	    data = [];

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
			$.clockIconLbl.color = Alloy.TSS.success_color.color;
			$.clockLbl.applyProperties({
				text : "Open till ".concat(till),
				color : Alloy.TSS.success_color.color
			});
		} else {
			$.clockIconLbl.color = Alloy.TSS.error_color.color;
			$.clockLbl.applyProperties({
				text : till ? "Closed at ".concat(till) : "Closed",
				color : Alloy.TSS.error_color.color
			});
		}
	}

	if (dates.length) {
		var datesSection = uihelper.createTableViewSection($, Alloy.Globals.strings.sectionStoreHours);
		for (var i in dates) {
			var row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow",
				classes : ["auto-height"]
			}),
			    view = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view"]
			}),
			    leftLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["left", "list-item-info-lbl"]
			}),
			    rightLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["right", "list-item-detail-lbl"]
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
		var servicesSection = uihelper.createTableViewSection($, Alloy.Globals.strings.sectionStoreServices);
		for (var i in services) {
			var row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow",
				classes : ["auto-height"]
			}),
			    titleLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-title-lbl"]
			});
			titleLbl.text = services[i].service;
			row.add(titleLbl);
			servicesSection.add(row);
		}
		data.push(servicesSection);
	}

	$.tableView.data = data;
}

function underConstruction() {
	uihelper.showDialog({
		message : Alloy.Globals.strings.msgUnderConstruction
	});
}

function didClickPhone(e) {
	uihelper.showDialer(store.mobileareacode + store.mobileprefix + store.mobilenumber);
}

function didClickDirection(e) {
	uihelper.getDirection(store.latitude + "," + store.longitude);
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
	uihelper.showDialog({
		message : String.format(Alloy.Globals.strings.msgChangeHomePharmacy, store.addressline1),
		buttonNames : [Alloy.Globals.strings.btnYes, Alloy.Globals.strings.strCancel],
		cancelIndex : 1,
		success : underConstruction
	});
}

exports.init = init;
