var args = arguments[0] || {};

function didClick(e) {
	if (e.source.title == "Go to Prescriptions") {
		console.log("go to prescription clicked!!!");
		Alloy.Globals.Navigator.openView(Alloy.Collections.menuItems.at(1).toJSON());
	} else {
		console.log("order a refill clicked!!!");
		Alloy.Globals.Navigator.pushView({
			ctrl : "refill",
			title : "Order a refill",
			ctrlArguments : {
				message : "Refill"
			}
		});
	}
}
