var Utilities = require("utilities");

var Resouces = {

	init : function() {

		if (OS_IOS || OS_ANDROID) {

			var fontPath = "data/fonts",
			    fontFiles = Utilities.getFiles(fontPath),
			    fontsDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fontPath);

			if (Ti.App.Properties.getBool("updatedResourcesOn", "") != Ti.App.version || Ti.App.deployType != "production") {

				var dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "data");

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

			for (var i in fontFiles) {
				//Ti.App.registerFont - is a method available only with custom SDK build 3.4.1.mscripts and later
				Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fontPath + "/" + fontFiles[i] + ".ttf"));
			}
		}
	}
};

module.exports = Resouces;
