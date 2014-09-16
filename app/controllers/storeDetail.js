var args = arguments[0] || {}, App = require("core"), moment = require("alloy/moment");

(function() {
	var store = Alloy.Collections.stores.where({
	storeid: args.storeId
	})[0].toJSON();
	var dates = store.hours.date;
	var date = _.findWhere(dates, {
		day : moment().format("dddd")
	});
	if (date) {
		var storehour = String(date.storehours);
		var till = storehour.substring(storehour.indexOf("-") + 1, storehour.length);
		var toClose = moment(till, "h:mm A").diff(moment(), "minutes");
		var image, labelDict;
		if (toClose > 0) {
			image = "/images/store/clock_open.png";
			labelDict = {
				text : "Open till ".concat(till),
				color : "#245e3d"
			};
		} else {
			image = "/images/store/clock_close.png";
			labelDict = {
				text : "Closed at ".concat(till),
				color : "#610e07"
			};
		}
		$.clockImg.image = image;
		$.clockLbl.applyProperties(labelDict);
	}
	Alloy.Models.store.set(store);
})();

function terminate() {
	$.destroy();
	Alloy.Models.store.clear();
}

function didRefill(e) {
	App.Navigator.open({
		ctrl : "refill",
		title : "Order a refill",
		stack : true,
		ctrlArguments : {
			message : "Refill"
		}
	});
}

exports.terminate = terminate;
