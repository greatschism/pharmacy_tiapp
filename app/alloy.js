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
if (!OS_MOBILEWEB) {
	Alloy.Globals.Map = require("ti.map");
}

Alloy.Collections.menuItems = new Backbone.Collection();
Alloy.Collections.stores = new Backbone.Collection();

Alloy.Models.store = new Backbone.Model();
