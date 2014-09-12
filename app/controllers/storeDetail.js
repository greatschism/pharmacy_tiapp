var args = arguments[0] || {}, App = require("core");

Alloy.Models.store.set(Alloy.Collections.stores.where({
storeid: args.storeId
})[0].toJSON());

function terminate() {
	$.destroy();
	Alloy.Models.store.clear();
}

function didRefill(e) {
	App.Navigator.closeToHome();
}

exports.terminate = terminate; 