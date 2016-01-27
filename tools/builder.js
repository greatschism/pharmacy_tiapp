var log4js = require("log4js"),
    program = require("commander"),
    path = require("path"),
    fs = require("nofs"),
    util = require("util"),
    cp = require("child_process"),
    exec = require("sync-exec"),
    _u = require("underscore"),
    spawn = cp.spawn,
    ROOT_DIR = path.normalize(__dirname + "/..") + "/",
    SHORT_CODE_MAX_LEN = 4,
    MODE_SHORT_CODE_JS = ROOT_DIR + "app/lib/moduleShortCode.js",
    CTRL_SHORT_CODE_JS = ROOT_DIR + "app/lib/ctrlShortCode.js",
    STYLE_SHEETS_JS = ROOT_DIR + "app/lib/styleSheets.js",
    CTRL_DIR = ROOT_DIR + "app/controllers",
    TSS_DIR = ROOT_DIR + "app/styles",
    APP_TSS = TSS_DIR + "/app.tss",
    APP_ASSETS_DIR = ROOT_DIR + "app/assets/",
    APP_HTTPS_CER = APP_ASSETS_DIR + "https.cer",
    APP_ASSETS_IPHONE_DIR = APP_ASSETS_DIR + "iphone",
    APP_ASSETS_ANDROID_DIR = APP_ASSETS_DIR + "android",
    APP_ASSETS_MOBILEWEB_DIR = APP_ASSETS_DIR + "mobileweb",
    APP_ASSETS_DATA_DIR = APP_ASSETS_DIR + "data",
    APP_ASSETS_IMAGES_DIR = APP_ASSETS_DIR + "images",
    APP_ASSETS_IMAGES_SERIES_DIR = APP_ASSETS_IMAGES_DIR + "/series",
    APP_DEFAULT_ICON = ROOT_DIR + "DefaultIcon.png",
    APP_ITUNES_ICON = ROOT_DIR + "iTunesConnect.png",
    APP_MARKETPLACE_ICON = ROOT_DIR + "MarketplaceArtwork.png",
    APP_MARKETPLACE_FEATURE_IMG = ROOT_DIR + "MarketplaceArtworkFeature.png",
    APP_ANDROID_RES_BASE_DIR = ROOT_DIR + "platform/android/res/",
    APP_ANDROID_DRAWABLE_LDPI = APP_ANDROID_RES_BASE_DIR + "drawable-ldpi",
    APP_ANDROID_DRAWABLE_MDPI = APP_ANDROID_RES_BASE_DIR + "drawable-mdpi",
    APP_ANDROID_DRAWABLE_HDPI = APP_ANDROID_RES_BASE_DIR + "drawable-hdpi",
    APP_ANDROID_DRAWABLE_XHDPI = APP_ANDROID_RES_BASE_DIR + "drawable-xhdpi",
    APP_ANDROID_DRAWABLE_XXHDPI = APP_ANDROID_RES_BASE_DIR + "drawable-xxhdpi",
    APP_ANDROID_DRAWABLE_XXXHDPI = APP_ANDROID_RES_BASE_DIR + "drawable-xxxhdpi",
    APP_CONFIG_JSON = ROOT_DIR + "app/config.json",
    APP_TIAPP_XML = ROOT_DIR + "tiapp.xml",
    TOOLS_DIR = ROOT_DIR + "tools/",
    DEFAULTS_JSON = TOOLS_DIR + "defaults.json",
    BRANDS_JSON = TOOLS_DIR + "brands.json",
    BASE_CONFIG_JSON = TOOLS_DIR + "base_config.json",
    BASE_TIAPP_XML = TOOLS_DIR + "base_tiapp.xml",
    BASE_ASSETS_DIR = TOOLS_DIR + "assets/",
    BASE_ASSETS_IMAGES_SERIES_DIR = BASE_ASSETS_DIR + "images/series",
    BRAND_RESOURCE_BASE_DIR,
    BRAND_KEYS_BASE_DIR,
    BRAND_ENV_JSON,
    BRAND_ENV_DATA,
    logger;

/**
 * build program
 * interface
 */
program.option("-B, --brand-id <id>", "Brand id to build with; should match with any one defined in brands.json");
program.option("-e, --environment <environment>", "Environment to build with; should match with any one defined in env.json", toLowerCase);
program.option("-s, --sdk <version>", "Titanium SDK version to build with.");
program.option("-u, --username <USERNAME>", "Username for authentication.");
program.option("-P, --password <USER_PASSWORD>", "Password for authentication.");
program.option("-o, --org-id <ORGANIZATION_ID>", "Specify the organization.");
program.option("-d, --defaults", "Set given arguments as defaults (limited as brand-id, environment, sdk, username, password, org-id, version, build-number and log-level).");
program.option("-v, --version <value>", "App version");
program.option("-i, --build-number <value>", "Build number.");
program.option("-p, --platform <platform>", "Target build platform: Supported values are ios or android.", toLowerCase, "ios");
program.option("-T, --target <value>", "Target to build for: dist-playstore, dist-appstore or dist-adhoc.", toLowerCase, "dist-adhoc");
program.option("-O, --output-dir <dir>", "Output directory.", ROOT_DIR + "dist");
program.option("-F, --output-file <file>", "Output file (base) name.");
program.option("-f, --force", "Force a full rebuild.");
program.option("-b, --build-only", "Only brand the project; when specified, does not trigger a release.");
program.option("-c, --appc-clean", "Valid only when --build-only is specified; when specified, triggers appc clean right after branding.");
program.option("-C, --clean-only", "Clean the project by removing all branding information; when specified, does not trigger a build.");
program.option("-U, --unit-test", "Valid only when --build-only is specified; when specified, executes unit test cases.");
program.option("-l, --log-level <level>", "Minimum logging level. Supported options are trace, debug, info, warn, and error", toLowerCase, "info");
program.parse(process.argv);

/**
 * configuer logger
 */
log4js.configure({
	appenders : [{
		type : "console"
	}]
});
log4js.setGlobalLogLevel(program.logLevel);

//logger for Builder
logger = log4js.getLogger("Builder");

//store defaults if requested
if (program.defaults) {
	var programData = _u.pick(program, ["brandId", "environment", "sdk", "username", "password", "orgId", "version", "buildNumber", "logLevel"]);
	//take missing keys from existing defaults set
	if (fs.existsSync(DEFAULTS_JSON)) {
		var currentData = JSON.parse(fs.readFileSync(DEFAULTS_JSON, "utf-8"));
		_u.each(currentData, function(value, key) {
			if (!_u.has(programData, key)) {
				programData[key] = value;
			}
		});
	}
	fs.writeFileSync(DEFAULTS_JSON, JSON.stringify(programData, null, 4));
	logger.debug("Writing " + DEFAULTS_JSON);
} else if (fs.existsSync(DEFAULTS_JSON)) {
	logger.debug("Reading " + DEFAULTS_JSON);
	//get cached arguments if exits, but don't overwrite from cache
	var defaultData = JSON.parse(fs.readFileSync(DEFAULTS_JSON, "utf-8"));
	_u.each(defaultData, function(value, key) {
		if (!_u.has(program, key)) {
			program[key] = value;
		}
	});
}

/**
 * check for required parameters,
 * can be skipped if buildOnly
 * is specified.
 */
if (!program.buildOnly && !program.cleanOnly) {
	_u.each(["username", "password", "orgId"], function(value) {
		if (!_u.has(program, value)) {
			logger.error("username, password or org-id is missing");
			process.exit(1);
		}
	});
}

/**
 * brand info
 */
var brand = _u.findWhere(JSON.parse(fs.readFileSync(BRANDS_JSON, "utf-8")), {
	id : program.brandId
});

/**
 * exit if brand is invalid
 * if cleanOnly is true then
 * allow process to clean project
 */
if (brand) {

	//update brand resource path
	BRAND_RESOURCE_BASE_DIR = TOOLS_DIR + brand.id + "/";
	BRAND_KEYS_BASE_DIR = BRAND_RESOURCE_BASE_DIR + "keys/";
	BRAND_ENV_JSON = BRAND_RESOURCE_BASE_DIR + "env.json";

	/**
	 * actual env data is always inherited
	 * from default one to avoid duplicate values
	 */
	var BRAND_DATA = JSON.parse(fs.readFileSync(BRAND_ENV_JSON, "utf-8")),
	    BRAND_SELECTED_ENV_DATA = BRAND_DATA[program.environment] || {};
	BRAND_ENV_DATA = BRAND_DATA["default"];
	_u.each(BRAND_ENV_DATA, function(val, key) {
		if (_u.has(BRAND_SELECTED_ENV_DATA, key)) {
			_u.extend(BRAND_ENV_DATA[key], BRAND_SELECTED_ENV_DATA[key]);
		}
	});

} else if (!program.cleanOnly) {

	logger.error("invalid brand-id: " + program.brandId);
	process.exit(2);

}

/**
 * cleanup existing resources
 * and copy new resources
 * only when
 * 1. if the brand-id or environment is different from old one
 * 2. or force is true
 * 3. or clean-only is true
 */
var currentAppConfigData = fs.existsSync(APP_CONFIG_JSON) ? JSON.parse(fs.readFileSync(APP_CONFIG_JSON, "utf-8")).global : {},
    build = program.cleanOnly || program.force || currentAppConfigData.brandId !== brand.id || currentAppConfigData.environment !== program.environment;
if (build) {

	/**
	 * if cleanOnly is true we won't build it
	 * just clean it
	 */
	if (!program.cleanOnly) {
		logger.info("Full rebuild has been initiated");
	}

	logger.debug("Initated cleanup");

	//delete all resources
	_u.each([APP_HTTPS_CER, APP_ASSETS_IPHONE_DIR, APP_ASSETS_ANDROID_DIR, APP_ASSETS_MOBILEWEB_DIR, APP_ASSETS_DATA_DIR, APP_ASSETS_IMAGES_DIR, APP_DEFAULT_ICON, APP_ITUNES_ICON, APP_MARKETPLACE_ICON, APP_MARKETPLACE_FEATURE_IMG, APP_ANDROID_DRAWABLE_LDPI, APP_ANDROID_DRAWABLE_MDPI, APP_ANDROID_DRAWABLE_HDPI, APP_ANDROID_DRAWABLE_XHDPI, APP_ANDROID_DRAWABLE_XXHDPI, APP_ANDROID_DRAWABLE_XXXHDPI, APP_CONFIG_JSON, APP_TIAPP_XML, CTRL_SHORT_CODE_JS, STYLE_SHEETS_JS, APP_TSS], function(path) {
		if (fs.existsSync(path)) {
			fs.removeSync(path);
			logger.debug("Unlinked => " + path);
		}
	});

	logger.info("Finished cleanup");

	//exit if clean only is true
	if (program.cleanOnly) {
		process.exit(0);
	} else {

		logger.debug("Project is being branded for " + brand.id);

		//copy brand resources
		var BRAND_HTTPS_CER = BRAND_KEYS_BASE_DIR + BRAND_ENV_DATA.keys.https_certificate,
		    BRAND_ASSETS_IPHONE_DIR = BRAND_RESOURCE_BASE_DIR + "assets/iphone",
		    BRAND_ASSETS_ANDROID_DIR = BRAND_RESOURCE_BASE_DIR + "assets/android",
		    BRAND_ASSETS_MOBILEWEB_DIR = BRAND_RESOURCE_BASE_DIR + "assets/mobileweb",
		    BRAND_ASSETS_DATA_DIR = BRAND_RESOURCE_BASE_DIR + "assets/data",
		    BRAND_ASSETS_IMAGES_DIR = BRAND_RESOURCE_BASE_DIR + "assets/images",
		    BRAND_DEFAULT_ICON = BRAND_RESOURCE_BASE_DIR + "images/DefaultIcon.png",
		    BRAND_ITUNES_ICON = BRAND_RESOURCE_BASE_DIR + "images/iTunesConnect.png",
		    BRAND_MARKETPLACE_ICON = BRAND_RESOURCE_BASE_DIR + "images/MarketplaceArtwork.png",
		    BRAND_MARKETPLACE_FEATURE_IMG = BRAND_RESOURCE_BASE_DIR + "images/MarketplaceArtworkFeature.png",
		    BRAND_ANDROID_RES_BASE_DIR = BRAND_RESOURCE_BASE_DIR + "platform/android/res/",
		    BRAND_ANDROID_DRAWABLE_LDPI = BRAND_ANDROID_RES_BASE_DIR + "drawable-ldpi",
		    BRAND_ANDROID_DRAWABLE_MDPI = BRAND_ANDROID_RES_BASE_DIR + "drawable-mdpi",
		    BRAND_ANDROID_DRAWABLE_HDPI = BRAND_ANDROID_RES_BASE_DIR + "drawable-hdpi",
		    BRAND_ANDROID_DRAWABLE_XHDPI = BRAND_ANDROID_RES_BASE_DIR + "drawable-xhdpi",
		    BRAND_ANDROID_DRAWABLE_XXHDPI = BRAND_ANDROID_RES_BASE_DIR + "drawable-xxhdpi",
		    BRAND_ANDROID_DRAWABLE_XXXHDPI = BRAND_ANDROID_RES_BASE_DIR + "drawable-xxxhdpi";

		_u.each([{
			source : BASE_ASSETS_IMAGES_SERIES_DIR,
			dest : APP_ASSETS_IMAGES_SERIES_DIR
		}, {
			source : BRAND_HTTPS_CER,
			dest : APP_HTTPS_CER
		}, {
			source : BRAND_ASSETS_IPHONE_DIR,
			dest : APP_ASSETS_IPHONE_DIR
		}, {
			source : BRAND_ASSETS_ANDROID_DIR,
			dest : APP_ASSETS_ANDROID_DIR
		}, {
			source : BRAND_ASSETS_MOBILEWEB_DIR,
			dest : APP_ASSETS_MOBILEWEB_DIR
		}, {
			source : BRAND_ASSETS_DATA_DIR,
			dest : APP_ASSETS_DATA_DIR
		}, {
			source : BRAND_ASSETS_IMAGES_DIR,
			dest : APP_ASSETS_IMAGES_DIR
		}, {
			source : BRAND_DEFAULT_ICON,
			dest : APP_DEFAULT_ICON
		}, {
			source : BRAND_ITUNES_ICON,
			dest : APP_ITUNES_ICON
		}, {
			source : BRAND_MARKETPLACE_ICON,
			dest : APP_MARKETPLACE_ICON
		}, {
			source : BRAND_MARKETPLACE_FEATURE_IMG,
			dest : APP_MARKETPLACE_FEATURE_IMG
		}, {
			source : BRAND_ANDROID_DRAWABLE_LDPI,
			dest : APP_ANDROID_DRAWABLE_LDPI
		}, {
			source : BRAND_ANDROID_DRAWABLE_MDPI,
			dest : APP_ANDROID_DRAWABLE_MDPI
		}, {
			source : BRAND_ANDROID_DRAWABLE_HDPI,
			dest : APP_ANDROID_DRAWABLE_HDPI
		}, {
			source : BRAND_ANDROID_DRAWABLE_XHDPI,
			dest : APP_ANDROID_DRAWABLE_XHDPI
		}, {
			source : BRAND_ANDROID_DRAWABLE_XXHDPI,
			dest : APP_ANDROID_DRAWABLE_XXHDPI
		}, {
			source : BRAND_ANDROID_DRAWABLE_XXXHDPI,
			dest : APP_ANDROID_DRAWABLE_XXXHDPI
		}], function(obj) {
			if (fs.existsSync(obj.source)) {
				/**
				 * copy is happening on
				 * folder level, ignore
				 * hidden files
				 */
				fs.copySync(obj.source, obj.dest, {
					all : false
				});
				logger.debug("Linked " + obj.source + " => " + obj.dest);
			}
		});

		/**
		 * merge base resource with brand resource if any
		 */
		var BASE_RESOURCES_JS = require(BASE_ASSETS_DIR + "/resources"),
		    RESOURCES_DATA = BASE_RESOURCES_JS.data;
		if (fs.existsSync(BRAND_ASSETS_DATA_DIR + "/resources.js")) {
			_u.each(require(APP_ASSETS_DATA_DIR + "/resources").data, function(source) {
				var ignore = source.ignore;
				delete source.ignore;
				if (ignore) {
					RESOURCES_DATA = _u.reject(RESOURCES_DATA, function(resource) {
						return _u.isEqual(resource, source);
					});
				} else {
					var destinations = _u.where(RESOURCES_DATA, _u.pick(source, ["type", "version", "code", "name"]));
					if (!destinations.length || !_u.some(destinations, function(destination) {
						if (_u.isEqual(destination.platform, source.platform)) {
							_u.extend(destination, source);
							return true;
						}
					})) {
						RESOURCES_DATA = _u.reject(RESOURCES_DATA, function(resource) {
							return _u.some(destinations, function(destination) {
								return _u.isEqual(resource, destination);
							});
						});
						RESOURCES_DATA.push(source);
					}
				}
			});
			/**
			 * Note: reject will return a new instance of array,
			 * so BASE_RESOURCES_JS.data could be different from
			 * RESOURCES_DATA here
			 */
			BASE_RESOURCES_JS.data = RESOURCES_DATA;
		}
		fs.writeFileSync(APP_ASSETS_DATA_DIR + "/resources.js", "module.exports = " + JSON.stringify(BASE_RESOURCES_JS, null, 4) + ";");

		/**
		 * build theme
		 */
		//brand theme data
		var BASE_THEME_DIR = BASE_ASSETS_DIR + "theme/",
		    BASE_THEME_DATA = JSON.parse(fs.readFileSync(BASE_THEME_DIR + "base.json", "utf-8")),
		    BASE_THEME_VALUES = JSON.parse(fs.readFileSync(BASE_THEME_DIR + "values.json", "utf-8")),
		    BRAND_THEME = BRAND_RESOURCE_BASE_DIR + "theme.json";

		if (fs.existsSync(BRAND_THEME)) {
			var BRAND_THEME_DATA = JSON.parse(fs.readFileSync(BRAND_THEME, "utf-8"));
			/**
			 * extend brand theme config data
			 * to base theme config data
			 */
			if (_u.has(BRAND_THEME_DATA, "config")) {
				if (_u.has(BRAND_THEME_DATA.config, "global")) {
					_u.extend(BASE_THEME_DATA.data.config.global, BRAND_THEME_DATA.config.global);
				}
				if (_u.has(BRAND_THEME_DATA.config, "ios")) {
					_u.extend(BASE_THEME_DATA.data.config.ios, BRAND_THEME_DATA.config.ios);
				}
				if (_u.has(BRAND_THEME_DATA.config, "android")) {
					_u.extend(BASE_THEME_DATA.data.config.android, BRAND_THEME_DATA.config.android);
				}
			}
			/**
			 * extend brand theme value
			 * to base theme config data
			 */
			if (_u.has(BRAND_THEME_DATA, "values")) {
				_u.extend(BASE_THEME_VALUES, BRAND_THEME_DATA.values);
			}
		}

		/**
		 * replace constants
		 */
		var BASE_THEME_DATA_STR = JSON.stringify(BASE_THEME_DATA, null, 4);
		_u.each(BASE_THEME_VALUES, function(val, key) {
			/**
			 * # if val is not string
			 * then exclude double quotes too
			 * # if val is object or array,
			 * then stringify val before replacing
			 */
			BASE_THEME_DATA_STR = BASE_THEME_DATA_STR.replace(new RegExp(_u.isString(val) ? "\\${" + key + "}" : "\"\\${" + key + "}\"", "g"), _u.isObject(val) || _u.isArray(val) ? JSON.stringify(val) : val);
		});

		//now write it as js file
		var APP_THEME_JS = APP_ASSETS_DATA_DIR + "/theme_" + _u.findWhere(RESOURCES_DATA, {
			"type" : "theme"
		}).version + ".js";
		fs.writeFileSync(APP_THEME_JS, "module.exports = " + BASE_THEME_DATA_STR + ";");
		logger.debug("Inherited base theme for " + program.brandId);

		/**
		 * verify template
		 */
		var TEMPLATE_JS = "template_" + (_u.findWhere(RESOURCES_DATA, {
			"type" : "template"
		}) || {}).version + ".js",
		    APP_TEMPLATE_JS = APP_ASSETS_DATA_DIR + "/" + TEMPLATE_JS;
		if (!fs.existsSync(APP_TEMPLATE_JS)) {
			var BASE_TEMPLATE_JS = BASE_ASSETS_DIR + TEMPLATE_JS;
			if (fs.existsSync(BASE_TEMPLATE_JS)) {
				fs.copySync(BASE_TEMPLATE_JS, APP_TEMPLATE_JS);
				logger.debug("Linked " + BASE_TEMPLATE_JS + " => " + APP_TEMPLATE_JS);
			}
		}

		/**
		 * verify menu
		 */
		var MENU_JS = "menu_" + _u.findWhere(RESOURCES_DATA, {
			"type" : "menu"
		}).version + ".js",
		    APP_MENU_JS = APP_ASSETS_DATA_DIR + "/" + MENU_JS;
		if (!fs.existsSync(APP_MENU_JS)) {
			var BASE_MENU_JS = BASE_ASSETS_DIR + MENU_JS;
			fs.copySync(BASE_MENU_JS, APP_MENU_JS);
			logger.debug("Linked " + BASE_MENU_JS + " => " + APP_MENU_JS);
		}

		/**
		 * verify languages
		 */
		_u.each(_u.where(RESOURCES_DATA, {
			"type" : "language"
		}), function(language) {
			var APP_LANGUAGE_JS = APP_ASSETS_DATA_DIR + "/language_" + language.code + "_" + language.version + ".js",
			    BASE_LANGUAGE_DATA = require(BASE_ASSETS_DIR + "/languages/" + language.code + ".js");
			if (fs.existsSync(APP_LANGUAGE_JS)) {
				_u.extend(BASE_LANGUAGE_DATA.data, require(APP_LANGUAGE_JS).data);
			}
			fs.writeFileSync(APP_LANGUAGE_JS, "module.exports = " + JSON.stringify(BASE_LANGUAGE_DATA, null, 4) + ";");
			logger.debug("Merged base language strings with branded language strings for " + language.code);
		});

		/**
		 * verify fonts
		 */
		_u.each(_u.where(RESOURCES_DATA, {
			"type" : "font"
		}), function(font) {
			var BASE_FONT = BASE_ASSETS_DIR + "fonts/" + font.postscript + "." + font.format,
			    APP_FONT_NAME = "font_" + font.code + "_" + font.version,
			    APP_FONT;
			/**
			 * we have 3 platform now
			 * ios, android and mobileweb
			 */
			if (font.platform.length === 3) {
				//for all platforms
				APP_FONT = APP_ASSETS_DATA_DIR + "/" + APP_FONT_NAME;
				if (!fs.existsSync(APP_FONT)) {
					fs.copySync(BASE_FONT, APP_FONT);
					logger.debug("Linked " + BASE_FONT + " => " + APP_FONT);
				}
			} else {
				//individual platforms
				if (_u.indexOf(font.platform, "ios") != -1) {
					//ios onlly
					APP_FONT = APP_ASSETS_DIR + "iphone/data/" + APP_FONT_NAME;
					if (!fs.existsSync(APP_FONT)) {
						fs.copySync(BASE_FONT, APP_FONT);
						logger.debug("Linked " + BASE_FONT + " => " + APP_FONT);
					}
				}
				if (_u.indexOf(font.platform, "android") != -1) {
					//android onlly
					APP_FONT = APP_ASSETS_DIR + "android/data/" + APP_FONT_NAME;
					if (!fs.existsSync(APP_FONT)) {
						fs.copySync(BASE_FONT, APP_FONT);
						logger.debug("Linked " + BASE_FONT + " => " + APP_FONT);
					}
				}
				if (_u.indexOf(font.platform, "mobileweb") != -1) {
					//android onlly
					APP_FONT = APP_ASSETS_DIR + "mobileweb/data/" + APP_FONT_NAME;
					if (!fs.existsSync(APP_FONT)) {
						fs.copySync(BASE_FONT, APP_FONT);
						logger.debug("Linked " + BASE_FONT + " => " + APP_FONT);
					}
				}
			}
		});

		/**
		 * verify images
		 */
		_u.each(_u.where(RESOURCES_DATA, {
			"type" : "image"
		}), function(image) {
			var APP_IMAGE = APP_ASSETS_DATA_DIR + "/image_" + image.code + "_" + image.version;
			if (!fs.existsSync(APP_IMAGE)) {
				var BASE_IMAGE = BASE_ASSETS_DIR + "images/" + image.code + ".png";
				fs.copySync(BASE_IMAGE, APP_IMAGE);
				logger.debug("Linked " + BASE_IMAGE + " => " + APP_IMAGE);
			}
		});

		//config.json
		var configData = JSON.parse(fs.readFileSync(BASE_CONFIG_JSON, "utf-8"));

		/**
		 * API short code
		 * this will be used to identify
		 * a api usage from
		 * analytics / crash reports / api logs
		 * Note: the logic and rules are similar
		 * to controller short code but instead camel
		 * case, here we use underscore (_) to split
		 * the words
		 */
		var apiShortCode;
		if (_u.has(configData.global, "apiPath")) {
			apiShortCode = {};
			_u.each(configData.global.apiPath, function(apiPath, apiName) {
				var separatedNames = apiName.split("_"),
				    nLen = separatedNames.length,
				    shortCode = "";
				if (nLen > 1) {
					_u.each(separatedNames, function(separatedName) {
						shortCode += separatedName.charAt(0);
					});
					var requiredLen = SHORT_CODE_MAX_LEN - shortCode.length;
					if (requiredLen < 0) {
						logger.error("short code " + shortCode + " is too long. api name " + apiName + " should not exceed " + SHORT_CODE_MAX_LEN + " words seperated by underscore.");
						process.exit(3);
					}
					if (requiredLen > 0) {
						_u.some(separatedNames, function(separatedName, index) {
							var newIndex = (index * 2) + 1,
							    newLetter = separatedName.charAt(1) || "";
							if (newLetter) {
								shortCode = (shortCode.substr(0, newIndex) || "") + newLetter + (shortCode.substr(newIndex) || "");
							}
							return shortCode.length === SHORT_CODE_MAX_LEN;
						});
					}
				} else {
					if (apiName.length < SHORT_CODE_MAX_LEN) {
						logger.error("api name " + apiName + " is too short");
						process.exit(4);
					}
					shortCode = apiName.substr(0, SHORT_CODE_MAX_LEN);
				}
				apiShortCode[apiName] = shortCode.toUpperCase();
			});
			/**
			 * check for duplicates
			 */
			_u.each(apiShortCode, function(mCode, mKey) {
				_u.each(apiShortCode, function(cCode, cKey) {
					if (mKey !== cKey && mCode === cCode) {
						logger.error("unabel to generate unique short codes for apiPaths. " + mKey + " and " + cKey + " has same short code: " + mCode);
						process.exit(5);
					}
				});
			});
		}

		/**
		 * update properties below
		 * - brand id
		 * - environment
		 * - build number
		 * - build date
		 */
		_u.extend(configData.global, {
			brandId : brand.id,
			environment : program.environment,
			buildNumber : program.buildNumber,
			buildDate : new Date().toString(),
			apiShortCode : apiShortCode
		});

		//extend global properties
		_u.extend(configData.global, BRAND_ENV_DATA.config);

		/**
		 * enable unit test cases
		 * if specified.
		 */
		if (program.buildOnly && program.unitTest) {
			configData.global.unit_test_enabled = true;
		}

		//write config
		fs.writeFileSync(APP_CONFIG_JSON, JSON.stringify(configData, null, 4));

		logger.debug("Created " + APP_CONFIG_JSON);

		//tiapp.xml
		var tiappData = fs.readFileSync(BASE_TIAPP_XML, "utf-8");
		_u.each(BRAND_ENV_DATA.tiapp, function(val, key) {
			tiappData = tiappData.replace(new RegExp("\\${" + key + "}", "g"), val);
		});
		tiappData = tiappData.replace(new RegExp("\\${BUILD_NUMBER}", "g"), program.buildNumber);
		fs.writeFileSync(APP_TIAPP_XML, tiappData);

		/**
		 * update tiapp.xml further using tiapp.xml module
		 * this is used just to keep the xml file formatted properly
		 */
		var tiapp = require("tiapp.xml").load(APP_TIAPP_XML);
		tiapp.sdkVersion = program.sdk;
		tiapp.version = program.version;

		//android launcher activity name
		var names = (tiapp.name + " Activity").split(" ");
		for (var i in names) {
			var name = names[i].toLowerCase();
			name = (name + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
				return $1.toUpperCase();
			});
			names[i] = name;
		}
		tiapp.doc.documentElement.getElementsByTagName("activity")[0].setAttribute("android:name", "." + names.join(""));

		//finished tiapp.xml updates
		tiapp.write();

		logger.debug("Created " + APP_TIAPP_XML);

		logger.info("Finished branding for " + brand.id);

		/**
		 * controllers short code
		 * this will be used to identify
		 * a controller screen from
		 * analytics / crash reports / api logs
		 */
		logger = log4js.getLogger("ControllerShortCode");
		logger.debug("Writing " + CTRL_SHORT_CODE_JS);
		/**
		 * get controllers list
		 * Note: only top level
		 * itemTemplates, templates,
		 * drawer etc., can be ignored.
		 *
		 * Rules:
		 *
		 * 1. Controller names should use
		 * camel case (with first letter only
		 * in lower case), less than
		 * or equal to 4 words and meaningful.
		 *
		 * 2. Any duplicates on short code name
		 * will throw an error and stop
		 * compilation process.
		 *
		 * Shot code logic:
		 *
		 * 1. If a controller name has more than one
		 * word, first letter of each word will
		 * be taken.
		 *
		 * i.e controllerHasFourWords - CHFW
		 * i.e weAreThree - WAT
		 *
		 * 2. If the above gives less than 4 characters
		 * then second letter of each word will be taken
		 * (only till it reaches 4 characters).
		 *
		 * i.e weAreThree - WEAT
		 *
		 * 3. If the controller has only one word then
		 * take first 4 characters.
		 *
		 * i.e one	 - ONE (controller name only has 3 characters)
		 * i.e login - LOGI
		 */
		var tiCtrlShortCode = {},
		    allCtrlFile = fs.readdirSync(CTRL_DIR);
		for (var i in allCtrlFile) {
			var ctrlFile = allCtrlFile[i];
			if (ctrlFile.substr(ctrlFile.lastIndexOf(".")) === ".js") {
				ctrlFile = ctrlFile.replace(/.js/g, "");
				/**
				 * use first character of each word
				 */
				var charsArr = ctrlFile.split(""),
				    shortCode = "",
				    usedIndexes = [];
				_u.each(charsArr, function(letter, index) {
					var charCode = letter.charCodeAt(0);
					if (!shortCode || (charCode >= 65 && charCode <= 90)) {
						usedIndexes.push(index);
						//0th char may be in small letter
						shortCode += letter;
					}
				});
				/**
				 * now try second character of each word
				 * if length is not enough
				 */
				var requiredLen = SHORT_CODE_MAX_LEN - shortCode.length;
				if (requiredLen < 0) {
					logger.error("short code " + shortCode + " is too long. controller name " + ctrlFile + " should be in camel case and not exceed " + SHORT_CODE_MAX_LEN + " words.");
					process.exit(6);
				}
				if (requiredLen > 0) {
					_u.some(usedIndexes, function(usedIndex, index) {
						var newIndex = usedIndex + 1,
						    nextIndex = usedIndexes[index + 1];
						if (!nextIndex || newIndex < nextIndex) {
							var newLetter = ctrlFile.charAt(newIndex);
							if (newLetter) {
								shortCode = (shortCode.substr(0, newIndex) || "") + newLetter + (shortCode.substr(newIndex) || "");
							}
						}
						return shortCode.length === SHORT_CODE_MAX_LEN;
					});
				}
				/**
				 * if still length is less than SHORT_CODE_MAX_LEN
				 * then use first SHORT_CODE_MAX_LEN character (this happens
				 * only with one word controller names).
				 */
				if (shortCode.length < SHORT_CODE_MAX_LEN) {
					if (ctrlFile.length < SHORT_CODE_MAX_LEN) {
						logger.error("controller name " + ctrlFile + " is too short");
						process.exit(7);
					}
					shortCode = ctrlFile.substr(0, SHORT_CODE_MAX_LEN);
				}
				tiCtrlShortCode[ctrlFile] = shortCode.toUpperCase();
			}
		}
		/**
		 * check for duplicates
		 * and verify they have
		 * module assigned
		 */
		var moduleShortCode;
		if (fs.existsSync(MODE_SHORT_CODE_JS)) {
			moduleShortCode = require(MODE_SHORT_CODE_JS);
		}
		_u.each(tiCtrlShortCode, function(mCode, mKey) {
			_u.each(tiCtrlShortCode, function(cCode, cKey) {
				if (mKey !== cKey && mCode === cCode) {
					logger.error("unabel to generate unique short codes for controllers. " + mKey + " and " + cKey + " has same short code: " + mCode);
					process.exit(8);
				}
			});
			if (moduleShortCode && !moduleShortCode[mCode]) {
				logger.error("module short code not assigned for " + mCode + " or " + mKey);
				process.exit(9);
			}
		});
		fs.writeFileSync(CTRL_SHORT_CODE_JS, "module.exports = " + JSON.stringify(tiCtrlShortCode, null, 4).concat(";"));
		logger.info("Created " + CTRL_SHORT_CODE_JS);

		/**
		 * initate tss maker
		 */
		logger = log4js.getLogger("TSSMaker");

		logger.debug("Initated building app.tss");
		/**
		 * identify language file
		 */
		var SELECTED_LANGUAGE = _u.findWhere(RESOURCES_DATA, {
			type : "language",
			selected : true
		}),
		    APP_SELECTED_LANGUAGE_JS = APP_ASSETS_DATA_DIR + "/language_" + SELECTED_LANGUAGE.code + "_" + SELECTED_LANGUAGE.version + ".js";

		logger.debug("Building app.tss based on => " + APP_THEME_JS);
		logger.debug("Using language file => " + APP_SELECTED_LANGUAGE_JS);

		/**
		 * clear cache for language strings
		 * it might load the old one that
		 * was before extending from base language
		 */
		delete require.cache[APP_SELECTED_LANGUAGE_JS];

		//get theme and language data
		var themeData = JSON.parse(BASE_THEME_DATA_STR).data,
		    languageData = require(APP_SELECTED_LANGUAGE_JS).data,
		    dtss = JSON.parse(fs.readFileSync(BASE_THEME_DIR + "defaults.json", "utf-8")),
		    atss = {},
		    tss = {};

		/**
		 * In app.tss elements those which come first
		 * will get low priority, than the element comes
		 * second / after, so let default tss elements
		 * go after images, icons and theme tss elements
		 */

		//add classes for images
		processImages(atss, _u.where(RESOURCES_DATA, {
			"type" : "image"
		}), languageData);

		//add classes for icons
		processIcons(atss, themeData.config.global.icons, languageData);
		processIcons(atss, themeData.config.global.iconNotations, languageData);

		//process the acutal classes in themes
		tss = themeData.tss;
		for (var ts in tss) {

			if (!atss[ts]) {
				atss[ts] = {};
			}

			/**
			 * remove any '#' or '.' character in first place and replace '-' with '_'
			 * and transform classifiers
			 * Example
			 * input: ".some-classname[platform=ios formFactor=handheld]"
			 * output: "some_classname_platform_ios_formFacoor_handheld"
			 * Note: Will support only one platform and one formFactor query, multiple combination should not be used
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

		/**
		 * deep extend everything from dtss (default tss) to
		 * atss (app tss), so dtss elements
		 * will get high priority as it goes after
		 * all atss elements
		 */
		for (var ts in dtss) {
			if (!atss[ts]) {
				atss[ts] = {};
			}
			var dict = dtss[ts];
			for (var key in dict) {
				atss[ts][key] = dict[key];
			}
		}

		//convert to string and trim double quotes
		var appStr = JSON.stringify(atss);
		appStr = trimDoubleQuotes(appStr, /"Alloy\.+/g);
		appStr = trimDoubleQuotes(appStr, /"Ti\.+/g);
		appStr = trimDoubleQuotes(appStr, /"Titanium\.+/g);
		appStr = appStr.substring(1, appStr.length - 1);

		logger.debug("processed data for app.tss: " + appStr);

		//write app.tss
		fs.writeFileSync(APP_TSS, appStr);

		logger.info("Created " + APP_TSS);

		/**
		 * inject style sheets list
		 * in a lib file. App will
		 * use the list of files
		 * and inject the styles
		 * at run time.
		 * Note: ignore widgets style
		 * sheets form this list.
		 * they are standalone form
		 * actual app.
		 */
		var tiStyleSheets = [];
		/**
		 * app.tss will not be there
		 * after alloy compilation
		 * index.tss is our source file
		 * so ignorning both
		 */
		getAllStyleFilesRecursive(TSS_DIR, ["app.tss", "index.tss"], tiStyleSheets);
		/**
		 * remove duplicates
		 * and items not required
		 * for this platform
		 */
		var tempTiStyleSheets = JSON.parse(JSON.stringify(tiStyleSheets, null, 4).replace(/.tss/g, "").replace(new RegExp(TSS_DIR, "g"), "alloy/styles").replace(new RegExp(program.platform + "/", "g"), "")),
		    platformsToIgnore = _u.without(["ios", "android", "mobileweb"], program.platform);
		tiStyleSheets = [];
		for (var i in tempTiStyleSheets) {
			var tempTiStyleSheet = tempTiStyleSheets[i],
			    shouldContinue = true;
			_u.some(platformsToIgnore, function(platformToIgnore) {
				if (tempTiStyleSheet.indexOf(platformToIgnore) != -1) {
					shouldContinue = false;
				}
				return !shouldContinue;
			});
			if (shouldContinue && tiStyleSheets.indexOf(tempTiStyleSheet) == -1) {
				tiStyleSheets.push(tempTiStyleSheet);
			}
		}
		logger.debug("Writing " + STYLE_SHEETS_JS);
		fs.writeFileSync(STYLE_SHEETS_JS, "module.exports = " + JSON.stringify(tiStyleSheets, null, 4).concat(";"));
		logger.info("Created " + STYLE_SHEETS_JS);
	}

} else {

	logger.info("No changes found, Project is alreadt branded for " + brand.id);
}

/**
 * initate a release
 */
logger = log4js.getLogger("TiRelease");

/**
 * appc clean
 * clean the project when specified
 * initiates a clean always before release
 */
if (!program.buildOnly || program.appcClean) {
	logger.info("Running appc clean");
	exec("appc ti clean --project-dir  " + ROOT_DIR);
}

/**
 * exit if buildOnly is true
 */
if (program.buildOnly) {
	logger.info("Skipping release");
	process.exit(0);
} else {

	//app config for buildDate
	var appConfigData = JSON.parse(fs.readFileSync(APP_CONFIG_JSON, "utf-8"));
	/**
	 * build flag will be false
	 * when there is no change in branding
	 * info / environment, so just update
	 * the build and number date here, when it
	 * is true build date and number would have
	 * been udpate already
	 */
	if (!build) {
		_u.extend(appConfigData.global, {
			buildNumber : program.buildNumber,
			buildDate : new Date().toString()
		});
		//write config
		fs.writeFileSync(APP_CONFIG_JSON, JSON.stringify(appConfigData, null, 4));
	}
	logger.info("Release iniated for " + program.platform + " at " + appConfigData.global.buildDate);

	//prepare build params
	var appcParams = ["run"];

	//platform
	appcParams.push("--platform");
	appcParams.push(program.platform);

	//deploy-type
	appcParams.push("--deploy-type");
	appcParams.push("production");

	/**
	 * read brand config
	 * for build keys
	 */
	var buildKeys = BRAND_ENV_DATA.keys;

	switch(program.platform) {
	case "ios":
		/**
		 * build params for ios
		 */

		//target
		/**
		 * for ios there are
		 * multiple targets
		 */
		appcParams.push("--target");
		appcParams.push(program.target);

		//distribution certificate
		logger.debug("Searching for distribution certificate " + buildKeys.certificate_name);
		if (program.force || exec("security find-certificate -c \"" + buildKeys.certificate_name + "\"").stderr) {
			if (program.force) {
				logger.info("Updating distribution certificate " + buildKeys.certificate_name);
				/**
				 * delete existing certificate if any
				 * Note: multiple certificates can share same common name which might
				 * bring conflicts, so delete all when force is specified
				 */
				if (!exec("security find-certificate -c \"" + buildKeys.certificate_name + "\"").stderr && exec("security delete-certificate -c \"" + buildKeys.certificate_name + "\"").stderr) {
					logger.error("Multiple certificates found with same name " + buildKeys.certificate_name + ". Please delete them manually from keychain and try again.");
					process.exit(10);
				}
			} else {
				logger.warn("Distribution certificate " + buildKeys.certificate_name + " not found!");
			}
			if (exec("security import " + BRAND_KEYS_BASE_DIR + buildKeys.certificate + " -A -k " + process.env.HOME + "/Library/Keychains/login.keychain -P " + buildKeys.certificate_password).stderr) {
				logger.error("Unable to import distribution certificate " + buildKeys.certificate_name);
				process.exit(11);
			}
			logger.info("Imported distribution certificate " + buildKeys.certificate_name);
		}
		appcParams.push("--distribution-name");
		appcParams.push(buildKeys.certificate_name);

		//provisioning profile
		var XCODE_PROVISON_PROFILE = process.env.HOME + "/Library/MobileDevice/Provisioning Profiles/" + buildKeys.provisioning_profile;
		logger.debug("Searching for provisioning profile " + buildKeys.provisioning_profile);
		if (program.force || !fs.existsSync(XCODE_PROVISON_PROFILE)) {
			if (program.force) {
				logger.info("Updating provisioning profile " + buildKeys.provisioning_profile);
			} else {
				logger.warn("Provisioning profile " + buildKeys.provisioning_profile + " not found!");
			}
			fs.copySync(BRAND_KEYS_BASE_DIR + buildKeys.provisioning_profile, XCODE_PROVISON_PROFILE);
			logger.info("Imported Provisioning profile " + buildKeys.provisioning_profile);
		}
		appcParams.push("--pp-uuid");
		appcParams.push(buildKeys.provisioning_profile.replace(".mobileprovision", ""));
		break;
	case "android":
		/**
		 * build params for android
		 */

		//target
		/**
		 * for andorid there is only
		 * one target
		 */
		appcParams.push("--target");
		appcParams.push("dist-playstore");

		//keystore
		appcParams.push("--keystore");
		appcParams.push(BRAND_KEYS_BASE_DIR + buildKeys.keystore);

		//keystore alias
		appcParams.push("--alias");
		appcParams.push(buildKeys.keystore_alias);

		//keystore password
		appcParams.push("--store-password");
		appcParams.push(buildKeys.keystore_password);
		break;
	case "mobileweb":
		/**
		 * build params for mobileweb
		 */

		//target
		/**
		 * for andorid there is only
		 * one target
		 */
		appcParams.push("--target");
		appcParams.push("web");
		break;
	default:
		/**
		 * exit if paltform is invalid
		 */
		logger.error("Invalid platform: " + program.platform);
		process.exit(12);
	}

	//project dir
	appcParams.push("--project-dir");
	appcParams.push(ROOT_DIR);

	//output dir
	appcParams.push("--output-dir");
	appcParams.push(program.outputDir);

	//sdk version
	appcParams.push("--sdk");
	appcParams.push(program.sdk);

	//auth info
	appcParams.push("--username");
	appcParams.push(program.username);
	appcParams.push("--password");
	appcParams.push(program.password);
	appcParams.push("--org-id");
	appcParams.push(program.orgId);

	//log level
	appcParams.push("--log-level");
	appcParams.push(program.logLevel);

	//run app using spwan
	var appc = spawn("appc", appcParams, {
		stdio : [0, "pipe", "pipe"]
	});

	appc.stdout.on("data", function(data) {
		console.log(data.toString());
	});

	appc.stderr.on("data", function(data) {
		console.log(data.toString());
	});

	appc.on("exit", function(code) {
		if (code != 0) {
			logger.error("appc exited with " + code);
		} else {
			/**
			 * rename file if required
			 */
			var fileName = program.outputFile;
			if (fileName) {
				var pExt = program.platform === "ios" ? ".ipa" : ".apk",
				    fExt = fileName.substr(fileName.lastIndexOf("."));
				/**
				 * if the right extention is not set
				 * then set one
				 */
				if (pExt != fExt) {
					fileName += pExt;
				}
				//rename file
				fs.renameSync(program.outputDir + "/" + require("tiapp.xml").load(APP_TIAPP_XML).name + pExt, program.outputDir + "/" + fileName);
				logger.info("Copying file to " + program.outputDir + "/" + fileName);
			}
			logger.info("Release completed successfully for " + program.platform + " for " + brand.id);
		}
		process.exit(code);
	});
}

/********************************
 * Helper functions for Builder
 ********************************/

function toLowerCase(val) {
	return val.toString().toLowerCase();
}

/********************************
 * Helper functions for TSSMaker
 ********************************/

/**
 *  create classes for each image from it's name
 *  append all available accessibility labels with image class
 *  the name convention should followed as below
 * 	examples
 * 	  image name - logo_white
 *    	class name will be - .img-logo-white
 *    	accessibility key in language string should be - imgAccessibilityLblLogoWhite
 */
function processImages(desObj, images, strings) {
	for (var imgKey in images) {
		var imgName = images[imgKey].name,
		    imgVal = "Alloy.Images." + imgName,
		    className = ".img-" + imgName.replace(/_+/g, "-");
		desObj[className] = {
			image : imgVal + ".image",
			width : imgVal + ".width",
			height : imgVal + ".height",
		};
		var name = imgName.replace(/_+/g, " ").replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
			return $1.toUpperCase();
		}),
		    prefix = "Alloy.Globals.strings.",
		    accessiblityKey = "imgAccessibilityLbl" + name;
		if (strings[accessiblityKey]) {
			desObj[className].accessibilityLabel = prefix + accessiblityKey;
		} else {
			desObj[className].accessibilityHidden = true;
		}
	}
}

/**
 *  create classes for each icon from it's name
 *  append all available accessibility labels with icon class
 *  the name convention should followed as below
 * 	examples
 * 	  icon name - thick_doctor
 *    	class name will be - .icon-thick-doctor
 *    	accessibility key in language string should be - iconAccessibilityLblThickDoctor or iconAccessibilityLblDoctor (considered only if iconAccessibilityLblThickDoctor is not found)
 * 	  icon name - thin_unfilled_success
 *    	class name will be - .icon-thin-unfilled-success
 *    	accessibility key in language string should be - iconAccessibilityLblThinUnfilledSuccess or iconAccessibilityLblUnfilledSuccess or iconAccessibilityLblSuccess
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
		    accessiblityKey = "iconAccessibilityLbl" + name;
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
		if (!desObj[className].accessibilityLabel) {
			desObj[className].accessibilityHidden = true;
		}
	}
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

/**
 * get all tss files
 * excluding those which matches
 * exclude param
 */
function getAllStyleFilesRecursive(dir, exclude, data) {
	var files = fs.readdirSync(dir);
	for (var i in files) {
		var file = dir + "/" + files[i];
		if (fs.lstatSync(file).isDirectory()) {
			getAllStyleFilesRecursive(file, exclude, data);
		} else if (file.substr(file.lastIndexOf(".")) === ".tss" && (!exclude || exclude.indexOf(files[i]) === -1)) {
			data.push(file);
		}
	}
}