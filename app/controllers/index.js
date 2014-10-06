(function() {
	if (Ti.App.Properties.getString("login", false)) {
		Alloy.createController(Alloy.CFG.navigator + "/master");
	} else {
		Alloy.createController("stack/master", {
			ctrl : "carousel",
			titleImage : "/images/login/pharmacy.png"
		});
	}
})();
