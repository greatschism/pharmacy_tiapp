var Alloy = require("alloy"),
    resources = require("resources"),
    localization = require("localization");

var Config = {

	init : function(_config, _callback) {

		/**
		 * initialization
		 */
		//for debugging purpose only, should be false on test / production
		if (Alloy.CFG.useLocalConfiguration === true) {
			Config.load(_callback);
			return;
		}

		//theme
		if (_.has(_config, "theme")) {
			resources.set("theme", _config.theme);
		}

		//menu
		if (_.has(_config, "menu")) {
			resources.set("menu", _config.menu);
		}

		//template
		if (_.has(_config, "template")) {
			resources.set("template", _config.template);
		}

		//languages
		if (_.has(_config, "languages")) {
			resources.set("languages", _config.languages.items);
		}

		//fonts
		if (_.has(_config, "fonts")) {
			resources.set("fonts", _config.fonts.items);
		}

		//images
		if (_.has(_config, "images")) {
			resources.set("images", _config.images);
		}

		/***
		 * check for files to be updated
		 */
		if (OS_MOBILEWEB || resources.checkForUpdates() > 0) {
			resources.update(function() {
				Config.load(_callback);
			});
		} else {
			Config.load(_callback);
		}
	},
	load : function(_callback) {

		/**
		 * load into memory
		 */

		var theme = resources.get("theme"),
		    menu = resources.get("menu"),
		    template = resources.get("template"),
		    fonts = resources.get("fonts"),
		    images = resources.get("images");

		//styles
		var style = theme.style;
		for (var i in style) {
			Alloy["_".concat(i)] = style[i];
		}

		//menu items
		Alloy.Collections.menuItems.reset(menu.items);

		//template
		Alloy.Models.template.set(template);

		//language
		localization.init();

		//fonts
		Alloy._fonts = {};
		for (var i in fonts) {
			/**
			 * Ti.App.registerFont - is a method available only with custom SDK build 3.4.1.mscripts and later
			 */
			if (OS_IOS || OS_ANDROID) {
				Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + fonts[i].name + "." + fonts[i].format));
			}
			Alloy._fonts[fonts[i].code] = fonts[i].name;
		}
		//replacing font code with post script name
		for (var i = 1; i <= 6; i++) {
			var hId = "_h".concat(i);
			Alloy[hId].fontFamily = Alloy._fonts[Alloy[hId].fontFamily];
		}

		Alloy._images = {};
		for (var i in images) {
			Alloy._images[images[i].name] = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryImages + "/" + images[i].name + "." + images[i].format).nativePath;
		}

		if (_callback) {
			_callback();
		}
	}
};

module.exports = Config;
