var Utilities = require("utilities");

var Resouces = {

	init : function() {

		if (OS_IOS || OS_ANDROID) {

			var fontPath = "data/fonts",
			    fontFiles = Utilities.getFiles(fontPath);

			if (Ti.App.Properties.getBool("updatedResourcesOn", "") != Ti.App.version || Ti.App.deployType != "production") {

				var dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "data"),
				    fontsDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fontPath);

				if (!dataDir.exists()) {
					dataDir.createDirectory();
				}

				if (!fontsDir.exists()) {
					fontsDir.createDirectory();
				}

				for (var i in fontFiles) {
					var path = fontPath + "/" + fontFiles[i];
					Utilities.copy(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, path), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path + ".ttf"));
				}

				Ti.App.Properties.setString("updatedLangFileOn", Ti.App.version);
			}

			if (OS_IOS) {
				dynamicFont = require("ti.ios.dynamicfonts");
				for (var i in fontFiles) {
					dynamicFont.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fontPath + "/" + fontFiles[i] + ".ttf"));
				}
			} else if (OS_ANDROID) {

			}
		}
	}
};

module.exports = Resouces;
