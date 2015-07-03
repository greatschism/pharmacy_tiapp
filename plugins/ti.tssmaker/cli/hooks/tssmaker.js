// Export supported versions
exports.cliVersion = ">=3.X";

var TAG = "TSSMaker",
    fs = require("fs");

// Main entry point for the hook;
// it is the version of Titanium that introduced and allow the hook js script to function.
exports.init = function(logger, config, cli, appc) {

	logger.info(TAG + " : initiated");

	var projectDir = cli.argv["project-dir"],
	    selectedThemeVersion = "1",
	    selectedLanguageVersion = "1",
	    lang = "en";

	try {
		var resources = require("./../../../../app/assets/data/resources"),
		    data = (resources || {}).data || [],
		    count = 0;
		for (var i in data) {
			if (data[i].type == "theme" && data[i].selected) {
				selectedThemeVersion = data[i].version;
			}
			if (data[i].type == "language" && data[i].selected) {
				selectedLanguageVersion = data[i].version;
			}
			if (count == 2) {
				//we got what we wanted
				break;
			}
		}
	} catch(e) {
		logger.error(TAG + " : " + e);
		return;
	}

	var CURRENT_TIME = new Date().getTime(),
	    TEMP_THEME_NAME = "theme_" + CURRENT_TIME,
	    TEMP_LANGUAGE_NAME = "language_" + CURRENT_TIME,
	    appTSSPath = projectDir + "/app/styles/app.tss",
	    themeJSPath = projectDir + "/app/assets/data/theme_" + selectedThemeVersion + ".js",
	    tempThemeJSPath = projectDir + "/plugins/ti.tssmaker/cli/hooks/" + TEMP_THEME_NAME + ".js",
	    languageJSPath = projectDir + "/app/assets/data/language_" + lang + "_" + selectedThemeVersion + ".js",
	    tempLanguageJSPath = projectDir + "/plugins/ti.tssmaker/cli/hooks/" + TEMP_LANGUAGE_NAME + ".js",
	    defaultJSPath = projectDir + "/plugins/ti.tssmaker/cli/hooks/defaults.js",
	    configPath = projectDir + "/app/config.json";

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

	/**
	 *  create classes for each icon from it's name
	 *  append all available accessibility labels with icon class
	 *  the name convention should followed as below
	 * 	examples
	 * 	  icon name - thick_doctor
	 *    	class name will be - .icon-thick-doctor
	 *    	accessibility key in language string should be - accessibilityLblThickDoctor or accessibilityLblDoctor (considered only if accessibilityLblThickDoctor is not found)
	 * 	  icon name - thin_unfilled_success
	 *    	class name will be - .icon-thin-unfilled-success
	 *    	accessibility key in language string should be - accessibilityLblThinUnfilledSuccess or accessibilityLblUnfilledSuccess or accessibilityLblSuccess
	 */
	function processIcons(desObj, icons, strings) {
		for (var icn in icons) {
			var icnVal = "Alloy.CFG.icons." + icn,
			    className = ".icon-" + icn.replace(/_+/g, "-");
			desObj[className] = {
				title : icnVal,
				text : icnVal
			};
			var name = icn.replace(/_+/g, " ").replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
				return $1.toUpperCase();
			}),
			    prefix = "Alloy.Globals.strings.",
			    accessiblityKey = "accessibilityLbl" + name;
			if (strings[accessiblityKey]) {
				desObj[className].accessibilityLabel = prefix + accessiblityKey;
			} else {
				accessiblityKey = accessiblityKey.replace(/Thin+/g, "").replace(/Thick+/g, "");
				if (strings[accessiblityKey]) {
					desObj[className].accessibilityLabel = prefix + accessiblityKey;
				} else {
					accessiblityKey = accessiblityKey.replace(/Unfilled+/g, "").replace(/Filled+/g, "");
					if (strings[accessiblityKey]) {
						desObj[className].accessibilityLabel = prefix + accessiblityKey;
					}
				}
			}
		}
	}

	function writeAppTss() {

		var atss = require("./defaults"),
		    configData = JSON.parse(fs.readFileSync(configPath, "utf8")),
		    tss = {},
		    language = {};

		//delete old app.tss
		if (fs.existsSync(appTSSPath)) {
			fs.unlinkSync(appTSSPath);
		}

		/**
		 *  copying the actual language file to a temporary location to avoid node caches on require statement
		 * 	require.cache can be used (yet to be tested), but this work around helps for now (tested)
		 */

		fs.writeFileSync(tempLanguageJSPath, fs.readFileSync(languageJSPath, "utf-8"));

		logger.debug(TAG + " : temporary language js is created and ready to use = " + tempLanguageJSPath);

		language = require("./" + TEMP_LANGUAGE_NAME).data;

		//add classes for icons
		processIcons(atss, configData.global.icons, language);
		processIcons(atss, configData.global.iconNotations, language);

		/**
		 *  copying the actual theme file to a temporary location to avoid node caches on require statement
		 *  require.cache can be used (yet to be tested), but this work around helps for now (tested)
		 */
		fs.writeFileSync(tempThemeJSPath, fs.readFileSync(themeJSPath, "utf-8"));

		logger.debug(TAG + " : temporary theme js is created and ready to use = " + tempThemeJSPath);

		tss = require("./" + TEMP_THEME_NAME).data.tss;

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
		appStr = trimDoubleQuotes(appStr, /"Alloy\.+/g);
		appStr = trimDoubleQuotes(appStr, /"Ti\.+/g);
		appStr = trimDoubleQuotes(appStr, /"Titanium\.+/g);
		appStr = appStr.substring(1, appStr.length - 1);

		logger.debug(TAG + " : atss = \n\n " + appStr + "\n\n");

		fs.writeFileSync(appTSSPath, appStr);

		logger.info(TAG + " : app.tss is ready now!");
	};

	cli.on("build.pre.construct", function(build, done) {

		try {

			var appTSSLmd,
			    themeJSLmd,
			    languageJSMd,
			    defaultJSLmd,
			    configLmd;

			if (fs.existsSync(appTSSPath)) {
				appTSSLmd = new Date(fs.statSync(appTSSPath).mtime);
			}

			if (fs.existsSync(themeJSPath)) {
				themeJSLmd = new Date(fs.statSync(themeJSPath).mtime);
			} else {
				logger.error(TAG + " : selected theme js not found = " + themeJSPath);
				return;
			}

			if (fs.existsSync(languageJSPath)) {
				languageJSMd = new Date(fs.statSync(languageJSPath).mtime);
			} else {
				logger.error(TAG + " : selected language js not found = " + languageJSPath);
				return;
			}

			if (fs.existsSync(defaultJSPath)) {
				defaultJSLmd = new Date(fs.statSync(defaultJSPath).mtime);
			} else {
				logger.error(TAG + " : default js not found = " + defaultJSPath);
				return;
			}

			if (fs.existsSync(configPath)) {
				configLmd = new Date(fs.statSync(configPath).mtime);
			} else {
				logger.error(TAG + " : config json not found = " + configPath);
				return;
			}

			if (!appTSSLmd || themeJSLmd > appTSSLmd || languageJSMd > appTSSLmd || defaultJSLmd > appTSSLmd || configLmd > appTSSLmd) {
				logger.info("mofifications found, app.tss should be updated. Processing...");
				writeAppTss();
			} else {
				logger.info("app.tss is up to date already.");
			}

			//delete all temporary theme and language files
			var dir = projectDir + "/plugins/ti.tssmaker/cli/hooks",
			    files = fs.readdirSync(dir);
			for (var i in files) {
				var file = files[i];
				if (file.indexOf("theme_") != -1 || file.indexOf("language_") != -1) {
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
