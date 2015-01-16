var Alloy = require("alloy"),
    resources = require("resources"),
    localization = require("localization");

var Config = {

	init : function(_config, _callback) {

		/**
		 * initialization
		 */

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
		    fonts = resources.get("fonts");

		//styles
		var style = theme.style;
		for (var i in style) {
			Alloy["_".concat(i)] = style[i];
		}

		//menu items
		Alloy.Collections.menuItems.reset(menu.items);

		//template
		Alloy.Models.template.set(template);

		//language was initialized already from alloy.js

		//fonts
		Alloy._fonts = {};
		for (var i in fonts) {
			/**
			 * Ti.App.registerFont - is a method available only with custom SDK build 3.4.1.mscripts and later
			 */
			Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "data/fonts/" + fonts[i].name + ".ttf"));
			Alloy._fonts[fonts[i].code] = fonts[i].name;
		}

		if (_callback) {
			_callback();
		}
	}
};

module.exports = Config;
