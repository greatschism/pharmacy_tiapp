var Alloy = require("alloy"),
    resources = require("resources"),
    localization = require("localization");

var Config = {

	init : function(_config, _callback) {

		/**
		 * initialization
		 */
		//for debugging purpose only, should be false on test / production
		if (Alloy.CFG.overrideRemoteConfiguration === true) {
			Config.load(_callback);
			return;
		}

		var keys = ["themes", "templates", "menus", "languages", "fonts", "images"],
		    query = {
			selected : true
		};
		for (var i in keys) {
			var key = keys[i];
			if (_.has(_config, key)) {
				resources.set(key, [_.extend(_config[key], query)]);
			}
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
		var styles = theme.styles;
		for (var i in styles) {
			Alloy["_".concat(i)] = styles[i];
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
				Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + fonts[i].file));
			}
			Alloy["_font_" + fonts[i].code] = fonts[i].name;
		}
		//replacing font code with post script name
		for (var i = 1; i <= 6; i++) {
			var hId = "_h".concat(i);
			Alloy[hId].fontFamily = Alloy["_font_" + Alloy[hId].fontFamily];
		}

		Alloy._images = {};
		for (var i in images) {
			Alloy["_image_" + images[i].code] = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryImages + "/" + images[i].file).nativePath;
		}

		if (_callback) {
			_callback();
		}
	}
};

module.exports = Config;
