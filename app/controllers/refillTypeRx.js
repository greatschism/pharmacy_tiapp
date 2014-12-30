var args = arguments[0] || {},
    app = require("core"),
    locationFirstUpdate = true;

function init() {
	Alloy.Models.store.on("change", updateStore);
}

function choosePharmacy(e) {
	app.navigator.open({
		titleid : "titleStores",
		ctrl : "stores",
		ctrlArguments : {
			orgin : "refillTyprRx"
		},
		stack : true
	});
}

function updateStore() {
	if (locationFirstUpdate) {
		locationFirstUpdate = false;
		$.locationLbl.color = Alloy._fg_secondary;
	}
	$.locationLbl.text = Alloy.Models.store.get("addressline1");
}

function didClickOrderRefill(e) {
	// app.navigator.open({
	// 	titleid : "titleRefillStatus",
	// 	ctrl : "refillStatus",
	// 	stack : true
	// });
	alert("Under Construction");
}

function didClickOrderRefill(e) {
	alert("Under Construction");
};

function terminate() {
	Alloy.Models.store.off("change", updateStore);
}

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews; 