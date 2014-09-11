var args = arguments[0] || {};

function init() {
	Alloy.Models.store.set(Alloy.Collections.stores.where({
	storeid: args.storeId
	})[0].toJSON());
}

function terminate() {
	$.destroy();
	Alloy.Models.store.clear();
}

exports.init = init;
exports.terminate = terminate;
