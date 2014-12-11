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
	$.homeBtn.color = Alloy.Globals.config.foregroundColors.quaternary;
	if (_.isEmpty(Alloy.Globals.currentLocation)) {
		$.distanceView.visible = false;
		$.directionBtn.visible = false;
	}

	var services = store.storeservices.storespecial;
	if (services.length) {
		console.log(services);
	}

	var hours = store.hours;
	if (services.length) {
		console.log(hours);
	}

	var dates = hours.date,
	    date;
	dates = _.sortBy(dates, function(obj) {
		return moment().day(obj.day, "dddd").day();
	});
	date = _.findWhere(dates, {
		day : moment().format("dddd")
	});
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
			$.clockIcon.color = Alloy.Globals.config.successColor;
			$.clockLbl.applyProperties({
				text : "Open till ".concat(till),
				color : Alloy.Globals.config.successColor
			});
		} else {
			$.clockIcon.color = Alloy.Globals.config.errorColor;
			$.clockLbl.applyProperties({
				text : till ? "Closed at ".concat(till) : "Closed",
				color : Alloy.Globals.config.errorColor
			});
		}
	}
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
