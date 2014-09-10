var args = arguments[0] || {};

function init() {
	var data = Alloy.Collections.stores.where({
	storeid: args.storeId
	})[0].toJSON();
	data.subtitle = data.city + ", " + data.state + " " + data.zip;
	data.distance = data.distance + " mi away";
	Alloy.Models.store.set(data);
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
