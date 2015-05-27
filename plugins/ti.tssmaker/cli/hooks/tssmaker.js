// Export supported versions
exports.cliVersion = ">=3.X";

var TAG = "TSSMaker",
    fs = require("fs");

// Main entry point for the hook;
// it is the version of Titanium that introduced and allow the hook js script to function.
exports.init = function(logger, config, cli, appc) {

	logger.info(TAG + " : initiated");

	var projectDir = cli.argv["project-dir"],
	    selectedTheme = "default";

	try {
		var resources = require("./../../../../app/assets/data/resources.js"),
		    themes = (resources || {}).themes || [];
		for (var i in themes) {
			if (themes[i].selected) {
				selectedTheme = themes[i].id;
			}
		}
	} catch(e) {
		logger.error(TAG + " : " + e);
		return;
	}

	var CURRENT_TIME = new Date().getTime(),
	    TEMP_NAME = "theme_" + CURRENT_TIME,
	    appTSSPath = projectDir + "/app/styles/app.tss",
	    themeJSPath = projectDir + "/app/assets/data/themes/" + selectedTheme + ".js",
	    tempThemeJSPath = projectDir + "/plugins/ti.tssmaker/cli/hooks/" + TEMP_NAME + ".js",
	    defaultJSPath = projectDir + "/plugins/ti.tssmaker/cli/hooks/defaults.js";

	function trimDoubleQuotes(str, regExp) {
		do {
			m = regExp.exec(str);
			if (m) {
				var index = m.index;
				str = str.slice(0, index) + str.slice(index + 1);
				while (str[index] != '"') {
					index++;
				}
				str = str.slice(0, index) + str.slice(index + 1);
			}
		} while (m);
		return str;
	}

	function writeAppTss() {

		var atss = require("./defaults"),
		    tss = {};

		if (fs.existsSync(appTSSPath)) {
			fs.unlinkSync(appTSSPath);
		}

		fs.writeFileSync(tempThemeJSPath, fs.readFileSync(themeJSPath, "utf-8"));

		logger.debug(TAG + " : temp theme js is created and ready to use = " + tempThemeJSPath);

		tss = require("./" + TEMP_NAME).styles.tss;

		for (var ts in tss) {

			if (!atss[ts]) {
				atss[ts] = {
				};
			}

			/**
			 * remove any '#' or '.' character in first place and repalce '-' with '_'
			 * and transform classifiers
			 * Example
			 * input: ".some-classname[platform=ios formFactor=handheld]"
			 * output: "some_classname_platform_ios_formFacoor_handheld"
			 * Note: Will support only one platform and one formFactor query, muliple combination should not be used
			 */
			var identifier = "Alloy.TSS." + ts.replace(/^#/g, "").replace(/^\./, "").replace(/-+/g, "_").replace(/\[.*$/g, ""),
			    matches = ts.match(/\[.*$/g);
			if (matches && matches.length) {
				var classifiers = (matches[0] || "").replace(/\[|\]/g, "").split(" ");
				for (var i in classifiers) {
					identifier += "_" + classifiers[i].split("=").join("_");
				}
			}

			var dict = tss[ts];
			for (var key in dict) {
				atss[ts][key] = identifier + "." + key;
			}

		}

		var appStr = JSON.stringify(atss);
		appStr = trimDoubleQuotes(appStr, /"Alloy.TSS+/g);
		appStr = trimDoubleQuotes(appStr, /"Alloy.CFG+/g);
		appStr = trimDoubleQuotes(appStr, /"Alloy.Globals+/g);
		appStr = trimDoubleQuotes(appStr, /"Ti.UI+/g);
		appStr = appStr.substring(1, appStr.length - 1);

		logger.debug(TAG + " : atss = \n\n " + appStr + "\n\n");

		fs.writeFileSync(appTSSPath, appStr);

		logger.info(TAG + " : app.tss is ready now!");
	};

	cli.on("build.pre.construct", function(build, done) {

		try {

			var defaultJSLmd,
			    themeJSLmd,
			    appTSSLmd;

			if (fs.existsSync(defaultJSPath)) {
				defaultJSLmd = new Date(fs.statSync(defaultJSPath).mtime);
			} else {
				logger.error(TAG + " : default js not found = " + themeJSPath);
				return;
			}

			if (fs.existsSync(themeJSPath)) {
				themeJSLmd = new Date(fs.statSync(themeJSPath).mtime);
			} else {
				logger.error(TAG + " : selected theme js not found = " + themeJSPath);
				return;
			}

			if (fs.existsSync(appTSSPath)) {
				appTSSLmd = new Date(fs.statSync(defaultJSPath).mtime);
			}

			if (!appTSSLmd || themeJSLmd > appTSSLmd || defaultJSLmd > appTSSLmd) {
				logger.info("mofifications found, app.tss should be updated. Processing...");
				writeAppTss();
			} else {
				logger.info("app.tss is up to date already.");
			}

			//delete all temp theme files
			var dir = projectDir + "/plugins/ti.tssmaker/cli/hooks",
			    files = fs.readdirSync(dir);
			for (var i in files) {
				var file = files[i];
				if (file.indexOf("theme_") != -1) {
					fs.unlinkSync(dir + "/" + file);
				}
			}

			return done();

		} catch(error) {

			logger.error(TAG + " : Something went wrong = " + JSON.stringify(error));
			return;

		}

	});
};
