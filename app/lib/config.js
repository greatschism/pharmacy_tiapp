var Alloy = require("alloy"),
    utilities = require("utilities"),
    resources = require("resources"),
    localization = require("localization");

var Config = {

	init : function(_config, _callback) {

		/**
		 * initialization
		 */
		//for debugging purpose only, should be false on test / production
		if (Alloy.CFG.overrideRemoteResources === true) {
			return 0;
		}

		var items = {
			"theme" : {
				"key" : "themes",
				"extend" : {
					"selected" : true
				}
			},
			"template" : {
				"key" : "templates",
				"extend" : {
					"selected" : true
				}
			},
			"menu" : {
				"key" : "menus",
				"extend" : {
					"selected" : true
				}
			},
			"language" : {
				"key" : "languages",
				"extend" : {
					"selected" : true
				}
			},
			"fonts" : {
				"key" : "fonts"
			},
			"images" : {
				"key" : "images"
			}
		};
		for (var i in items) {
			var item = items[i];
			if (_.has(_config, i)) {
				var obj = _config[i];
				if (_.has(item, "extend")) {
					_.extend(obj, item.extend);
				}
				resources.set(item.key, _.isArray(obj) ? obj : [obj]);
			}
		}

		/***
		 * no. of items to be updated
		 */
		return resources.checkForUpdates();
	},

	load : function(_callback) {

		/**
		 * load into memory
		 */
		var theme = resources.get("themes", {selected : true})[0],
		    template = resources.get("templates", {selected : true})[0],
		    menu = resources.get("menus", {selected : true})[0],
		    fonts = resources.get("fonts", {
			file : {
				$exists : true
			}
		}),
		    images = resources.get("images", {
			file : {
				$exists : true
			}
		});

		//styles
		var styles = utilities.clone(theme.styles);
		for (var i in styles) {
			Alloy["_".concat(i)] = _.clone(styles[i]);
		}

		//menu items
		Alloy.Collections.menuItems.reset(utilities.clone(menu.items));

		//template
		Alloy.Models.template.set(utilities.clone(template));

		//language
		localization.init();

		//fonts
		/**
		 * Ti.App.registerFont - is a method available only with custom SDK build 3.4.1.mscripts and later
		 * Ti.App.unregisterFont - is a method available only with custom SDK build 3.5.0.mscripts and later
		 */
		//unregister fonts
		if ((OS_IOS || OS_ANDROID) && _.has(Alloy, "_reg_fonts")) {
			var unRegFonts = Alloy._reg_fonts;
			for (var i in unRegFonts) {
				Ti.App.unregisterFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + unRegFonts[i].file), unRegFonts[i].id);
			}
		}
		//Register fonts
		Alloy._fonts = {};
		Alloy._reg_fonts = [];
		for (var i in fonts) {
			if (OS_IOS || OS_ANDROID) {
				Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + fonts[i].file), fonts[i].id);
				Alloy._reg_fonts.push(utilities.clone(fonts[i]));
			}
			Alloy._fonts[fonts[i].code] = fonts[i].id;
		}
		//replacing font code with post script id in styles-typography
		for (var i = 1; i <= 6; i++) {
			var hId = "_h".concat(i);
			Alloy[hId].fontFamily = Alloy._fonts[Alloy[hId].fontFamily];
		}

		//images
		Alloy._images = {};
		for (var i in images) {
			var code = images[i].code,
			    orientations = images[i].orientation;
			if (!_.has(Alloy._images, code)) {
				Alloy._images[code] = {};
			}
			for (var j in orientations) {
				Alloy._images[code][orientations[j]] = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryImages + "/" + images[i].file).nativePath;
			}
		}

		/**
		 * delete unused resources
		 */
		if (Alloy.CFG.deleteUnusedResoruces) {
			resources.deleteUnusedResoruces();
		}

		if (_callback) {
			_callback();
		}
	},

	update : function(_callback) {
		resources.update(_callback);
	}
};

module.exports = Config;
