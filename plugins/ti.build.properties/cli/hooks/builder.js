// Export supported versions
exports.cliVersion = ">=3.X";

var TAG = "PropertiesBuilder",
    fs = require("fs");

// Main entry point for the hook;
// it is the version of Titanium that introduced and allow the hook js script to function.
exports.init = function(logger, config, cli, appc) {

	logger.info(TAG + " : initiated");

	var projectDir = cli.argv["project-dir"];

	cli.on("build.pre.construct", function(build, done) {

		var isProd = cli.argv["deploy-type"] == "production";

		try {

			//get tiapp.xml
			var tiappPath = projectDir + "/tiapp.xml",
			    tiapp = require("tiapp.xml").load(tiappPath);

			//get config
			var configPath = projectDir + "/app/config.json",
			    configData = JSON.parse(fs.readFileSync(configPath, "utf8"));

			if (isProd) {

				//ios properties
				if (cli.argv["platform"] === "ios") {
					var iosTags = tiapp.doc.documentElement.getElementsByTagName("ios"),
					    ios = iosTags.length == 0 ? tiapp.doc.documentElement.appendChild(tiapp.doc.createElement("ios")) : iosTags[0];

					//minimum SDK version
					var minOSTags = ios.getElementsByTagName("min-ios-ver"),
					    minOS = minOSTags.length == 0 ? ios.appendChild(tiapp.doc.createElement("min-ios-ver")) : minOSTags[0];
					if (minOS.hasChildNodes()) {
						for (var i in minOS.childNodes) {
							minOS.removeChild(minOS.childNodes[i]);
						}
					}
					minOS.appendChild(tiapp.doc.createTextNode(cli.argv["minSdkVersion"] || "7.1"));
				}

				//android properties
				if (cli.argv["platform"] === "android") {
					var androidTags = tiapp.doc.documentElement.getElementsByTagName("android"),
					    android = androidTags.length == 0 ? tiapp.doc.documentElement.appendChild(tiapp.doc.createElement("android")) : androidTags[0];
					if (!android.hasAttribute("xmlns:android")) {
						android.setAttribute("xmlns:android", "http://schemas.android.com/apk/res/android");
					}

					//version code
					var manifestTags = android.getElementsByTagName("manifest"),
					    manifest = manifestTags.length == 0 ? android.appendChild(tiapp.doc.createElement("manifest")) : manifestTags[0],
					    versionCode = cli.argv["versionCode"];
					if (!versionCode) {
						versionCode = parseInt(manifest.getAttribute("android:versionCode")) || 0;
						versionCode += 1;
					}
					manifest.setAttribute("android:versionCode", versionCode);

					//minimum SDK version
					var usesSDKTags = android.getElementsByTagName("uses-sdk"),
					    usesSDK = usesSDKTags.length == 0 ? manifest.appendChild(tiapp.doc.createElement("uses-sdk")) : usesSDKTags[0];
					usesSDK.setAttribute("android:minSdkVersion", cli.argv["minSdkVersion"] || "14");

					//launching activity name
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

				//update build date
				configData.global.buildDate = new Date().toString();
			}

			//add / remove modules
			if (cli.argv["platform"] === "android") {
				if (configData["os:android"].hasOwnProperty("drawer_layout") && configData["os:android"]["drawer_layout"] === true) {
					tiapp.removeModule("dk.napp.drawer", "android");
					tiapp.setModule("com.tripvi.drawerlayout", {
						platform : "android"
					});
				} else {
					tiapp.removeModule("com.tripvi.drawerlayout", "android");
					tiapp.setModule("dk.napp.drawer", {
						platform : "android"
					});
				}
			}

			//write config
			fs.writeFileSync(configPath, JSON.stringify(configData, null, 4));

			//write tiapp
			tiapp.write();

			//clean build on prod
			if (isProd) {
				return appc.subprocess.run("ti", ["clean", "--project-dir", projectDir], function(err, res) {
					if (err) {
						logger.debug(TAG + " : " + err);
					}
					return done();
				});
			} else {
				return done();
			}

		} catch(e) {

			logger.error(TAG + " : " + e);
			return;

		}

	});

};
