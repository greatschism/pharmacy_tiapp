var args = arguments[0] || {},
    app = require("core"),
    icons = Alloy.CFG.icons,
    dialog = require("dialog"),
    utilities = require("utilities"),
    moment = require("alloy/moment"),
    prescription = {};

function init() {


	$.titleLbl.text = prescription.name;
	$.subtitleLbl.text = prescription.placedat;
	
	$.distanceLbl.text = prescription.name;

	$.hidePrescriptionBtn.color = Alloy._fg_quaternary;
	

	

	

	

	

//	$.tableView.data = data;
}

function underConstruction() {
	dialog.show({
		message : Alloy.Globals.strings.msgUnderConstruction
	});
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

function handleScroll(e) {
	$.login.canCancelEvents = e.value;
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
