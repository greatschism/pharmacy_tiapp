// Export supported versions
exports.cliVersion = ">=3.X";

var TAG = "PropertiesBuilder",
    fs = require("fs");

/**
 * The 3.0+ CLI doesn"t properly pass the deploy type for Android,
 * so get it based on the target
 */
function mapTargetToDeployType(target) {
	switch(target) {
	case "dist-playstore":
		return "production";
	case "device":
		return "test";
	case "emulator":
		return "development";
	default:
		return "development";
	}
}

// Main entry point for the hook;
// it is the version of Titanium that introduced and allow the hook js script to function.
exports.init = function(logger, config, cli, appc) {

	logger.info(TAG + " : initiated");

	cli.on("build.pre.construct", function(build, done) {

		var deployType = mapTargetToDeployType(cli.argv["target"]);
		if (deployType != "production") {
			logger.info(TAG + " : ignored since deploy type is " + deployType);
			return done();
		}

		try {

			//update tiapp.xml
			var tiappPath = "./tiapp.xml",
			    tiapp = require("tiapp.xml").load(tiappPath),
			    children = tiapp.doc.documentElement.childNodes;

			//android properties
			var android = tiapp.doc.documentElement.getElementsByTagName("android")[0];
			if (android) {
				var children = android.getElementsByTagName("manifest"),
				    manifest = children.length == 0 ? android.appendChild(tiapp.doc.createElement("manifest")) : children[0],
				    versionCode = cli.argv["versionCode"];
				if (!versionCode) {
					versionCode = parseInt(manifest.getAttribute("android:versionCode")) || 0;
					versionCode += 1;
				}
				manifest.setAttribute("android:versionCode", versionCode);
				var application = android.getElementsByTagName("application")[0];
				if (application) {
					var activity = android.getElementsByTagName("activity")[0];
					if (activity) {
						var names = (tiapp.name + " Activity").split(" ");
						for (var i in names) {
							var name = names[i].toLowerCase();
							name = (name + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
								return $1.toUpperCase();
							});
							names[i] = name;
						}
						activity.setAttribute("android:name", "." + names.join(""));
					}
				}
			}

			//update version
			if (cli.argv["update-version"] != "false") {
				if (cli.argv["app-version"]) {
					tiapp.version = cli.argv["app-version"];
				} else {
					var versions = tiapp.version.split(".");
					if (versions[3]) {
						versions[3] = parseInt(versions[3]) + 1;
					} else if (versions[2]) {
						versions[2] = parseInt(versions[2]) + 1;
					} else if (versions[1]) {
						versions[1] = parseInt(versions[1]) + 1;
					}
					tiapp.version = versions.join(".");
				}
			}
			tiapp.write();

			//update config
			var configPath = "./app/config.json",
			    configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
			configData.global.buildDate = new Date().toString();
			fs.writeFileSync(configPath, JSON.stringify(configData, null, 4));

			return done();

		} catch(e) {

			logger.error(TAG + " : " + e);
			return done();

		}

	});

};
