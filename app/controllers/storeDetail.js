var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    moment = require("alloy/moment");

(function() {
	var store = Alloy.Collections.stores.where({
	storeid: args.storeId
	})[0].toJSON();
	var services = store.storeservices.storespecial;
	var dates = store.hours.date;
	dates = _.sortBy(dates, function(obj) {
		return moment().day(obj.day, "dddd").day();
	});
	var date = _.findWhere(dates, {
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
		var image,
		    labelDict;
		if (toOpen < 0 && toClose > 0) {
			image = "/images/clock_green.png";
			labelDict = {
				text : "Open till ".concat(till),
				color : "#245e3d"
			};
		} else {
			image = "/images/clock_red.png";
			labelDict = {
				text : till ? "Closed at ".concat(till) : "Closed",
				color : "#610e07"
			};
		}
		$.clockImg.image = image;
		$.clockLbl.applyProperties(labelDict);
	}
	if (Alloy.Globals.loggedIn) {
		$.favoriteImg.image = "/images/".concat(store.bookmarked ? "favorite" : "unfavorite").concat(".png");
	}
	store.phone = Alloy.Globals.strings.strCall + " (" + store.mobileareacode + ") " + store.mobileprefix + " - " + store.mobilenumber;
	if (_.isEmpty(Alloy.Globals.currentLocation)) {
		$.directionBtn.hide();
		$.distanceView.hide();
	}
	Alloy.Models.store.set(store);
	Alloy.Collections.storeHours.reset(dates);
	Alloy.Collections.storeServices.reset(services);
})();

function didClickPhone(e) {
	Ti.Platform.openURL("tel:" + Alloy.Models.store.get("mobileareacode") + Alloy.Models.store.get("mobileprefix") + Alloy.Models.store.get("mobilenumber"));
}

function didClickDirection(e) {
	utilities.getDirection(Alloy.Globals.currentLocation, (Alloy.Models.store.get("latitude") + "," + Alloy.Models.store.get("longitude")));
}

function underConstruction() {
	dialog.show({
		message : Alloy.Globals.strings.msgUnderConstruction
	});
}

function didClickFavorite(e) {
	underConstruction();
}

function didClickHome(e) {
	dialog.show({
		message : String.format(Alloy.Globals.strings.msgChangeHomePharmacy, Alloy.Models.store.get("addressline1")),
		buttonNames : [Alloy.Globals.strings.btnYes, Alloy.Globals.strings.strCancel],
		cancelIndex : 1,
		success : underConstruction
	});
}

function terminate() {
	$.destroy();
	Alloy.Models.store.clear();
}

function didRefill(e) {
	app.navigator.open({
		ctrl : "refill",
		titleid : "titleOrderRefill",
		stack : true,
		ctrlArguments : {
			message : "Refill"
		}
	});
}

exports.terminate = terminate;
