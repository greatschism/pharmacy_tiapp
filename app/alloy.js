var isIOS7Plus = function() {
	if (OS_IOS) {
		var version = Titanium.Platform.version.split(".");
		var major = parseInt(version[0], 10);
		if (major >= 7) {
			return true;
		}
	}
	return false;
};

Alloy.Globals.iOS7Plus = isIOS7Plus();

Alloy.Collections.menuItems = new Backbone.Collection();