(function() {
	if (Ti.App.Properties.getString("sessionid", false) || OS_MOBILEWEB) {
		Alloy.createController(Alloy.CFG.navigator + "/master");
	} else {
		Alloy.createController("stack/master", {
			ctrl : "carousel",
			titleImage : "/images/login/pharmacy.png"
		});
	}
})();
