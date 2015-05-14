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

	function getLastModifiedDate(_file, _defaultDate, _callback) {
		fs.stat(_file, function(err, stats) {
			_callback( err ? _defaultDate : new Date(stats.mtime));
		});
	}

	function isExists(_file, _callback) {
		fs.exists(_file, _callback);
	}

	function checkAndDeleteCached(_file, _callback) {
		isExists(_file, function(_exists) {
			if (_exists) {
				console.log("found old copy of " + _file);
				fs.unlink(_file, function(err) {
					if (err) {
						console.error("unable to deleted old copy of " + _file);
					} else {
						console.log("successfully deleted old copy of " + _file);
					}
					_callback();
				});
			} else {
				_callback();
			}
		});
	}

	function trimDoubleQuotes(_str, _regExp) {
		do {
			m = _regExp.exec(_str);
			if (m) {
				var index = m.index;
				_str = _str.slice(0, index) + _str.slice(index + 1);
				while (_str[index] != '"') {
					index++;
				}
				_str = _str.slice(0, index) + _str.slice(index + 1);
			}
		} while (m);
		return _str;
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
					var dict = tss[ts];
					for (var key in dict) {
						atss[ts][key] = "Alloy.TSS." + ts.replace(/^#/, '').replace(/^\./, '').replace(/-+/g, "_") + "." + key;
					}
				}
				var appStr = JSON.stringify(atss);
				appStr = trimDoubleQuotes(appStr, /"Alloy.TSS+/g);
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
		isExists(themeJSPath, function(_exists) {
			if (_exists) {
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
		getLastModifiedDate(themeJSPath, false, function(_themeJSLmd) {
			getLastModifiedDate(appTSSPath, false, function(_appTSSLmd) {
				getLastModifiedDate(defaultJSPath, false, function(_defaultJSLmd) {
					if (_themeJSLmd == false || _appTSSLmd == false || _defaultJSLmd == false || _themeJSLmd > _appTSSLmd || _defaultJSLmd > _appTSSLmd) {
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
