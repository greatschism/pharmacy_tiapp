// Export supported versions
exports.cliVersion = ">=3.X";

var TAG = "TSSMaker",
    fs = require("fs");

// Main entry point for the hook;
// it is the version of Titanium that introduced and allow the hook js script to function.
exports.init = function(logger, config, cli, appc) {

	logger.info(TAG + " : initiated");

	var defaultTheme = "default";

	try {
		var resources = require("./../../../../app/assets/data/resources"),
		    themes = (resources || {}).themes || [];
		for (var i in themes) {
			if (themes[i].selected) {
				defaultTheme = themes[i].id;
			}
		}
	} catch(e) {
		logger.error(TAG + " : " + e);
	}

	var APP_TSS = "app/styles/app.tss",
	    THEME_JS = "app/assets/data/themes/" + defaultTheme + ".js",
	    RANDOM_NAME = "theme_" + (new Date().getTime()),
	    TEMP_THEME_JS = "plugins/ti.tssmaker/cli/hooks/" + RANDOM_NAME + ".js",
	    DEFAULT_JS = "plugins/ti.tssmaker/cli/hooks/defaults.js",
	    projectPath = cli.argv["project-dir"],
	    appTSSPath = projectPath + "/" + APP_TSS,
	    themeJSPath = projectPath + "/" + THEME_JS,
	    tempThemeJSPath = projectPath + "/" + TEMP_THEME_JS,
	    defaultJSPath = projectPath + "/" + DEFAULT_JS;

	logger.debug(TAG + " : app tss = " + APP_TSS);
	logger.debug(TAG + " : theme js = " + THEME_JS);
	logger.debug(TAG + " : temp theme js = " + TEMP_THEME_JS);

	var atss = require("./defaults"),
	    tss = {};

	function getLastModifiedDate(file, defaultDate, callback) {
		fs.stat(file, function(err, stats) {
			callback( err ? defaultDate : new Date(stats.mtime));
		});
	}

	function isExists(file, callback) {
		fs.exists(file, callback);
	}

	function checkAndDeleteCached(file, callback) {
		isExists(file, function(exists) {
			if (exists) {
				console.log("found old copy of " + file);
				fs.unlink(file, function(err) {
					if (err) {
						console.error("unable to deleted old copy of " + file);
					} else {
						console.log("successfully deleted old copy of " + file);
					}
					callback();
				});
			} else {
				callback();
			}
		});
	}

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

	function makeAppTss(build, done) {
		var themeWS = fs.createReadStream(themeJSPath).pipe(fs.createWriteStream(tempThemeJSPath));
		themeWS.on("close", function() {
			logger.debug(TAG + " : temp theme js is created and ready to use = " + TEMP_THEME_JS);
			try {
				tss = require("./" + RANDOM_NAME).styles.tss;
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
				var appTssWS = fs.createWriteStream(appTSSPath);
				appTssWS.on("close", function() {
					logger.info(TAG + " : app.tss is ready now!");
					checkAndDeleteCached(tempThemeJSPath, function() {
						done();
					});
				});
				appTssWS.write(appStr);
				appTssWS.end();
			} catch(error) {
				logger.error(TAG + " : Something went wrong = " + JSON.stringify(error));
				return done();
			}
		});
	};

	function processRequest(build, done) {
		isExists(themeJSPath, function(exists) {
			if (exists) {
				checkAndDeleteCached(appTSSPath, function() {
					makeAppTss(build, done);
				});
			} else {
				logger.error("theme js not found = " + themeJSPath);
				return done();
			}
		});
	};

	cli.on("build.pre.construct", function(build, done) {
		getLastModifiedDate(themeJSPath, false, function(themeJSLmd) {
			getLastModifiedDate(appTSSPath, false, function(appTSSLmd) {
				getLastModifiedDate(defaultJSPath, false, function(defaultJSLmd) {
					if (themeJSLmd == false || appTSSLmd == false || defaultJSLmd == false || themeJSLmd > appTSSLmd || defaultJSLmd > appTSSLmd) {
						logger.info("theme js is modified, app.tss should be updated. Processing...");
						processRequest(build, done);
					} else {
						logger.info("app.tss is up to date already.");
						return done();
					}
				});
			});
		});
	});
};
