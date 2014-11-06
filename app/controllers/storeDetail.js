var args = arguments[0] || {},
    app = require("core"),
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
	$.favoriteImg.image = "/images/".concat(store.bookmarked ? "favorite" : "unfavorite").concat(".png");
	store.phone = Alloy.Globals.Strings.strCall + " (" + store.mobileareacode + ") " + store.mobileprefix + " - " + store.mobilenumber;
	Alloy.Models.store.set(store);
	Alloy.Collections.storeHours.reset(dates);
	Alloy.Collections.storeServices.reset(services);
})();

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
