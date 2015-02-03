var Alloy = require("alloy"),
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

		var items = [{
			key : "themes",
			extend : {
				selected : true
			}
		}, {
			key : "templates",
			extend : {
				selected : true
			}
		}, {
			key : "menus",
			extend : {
				selected : true
			}
		}, {
			key : "languages",
			extend : {
				selected : true
			}
		}, {
			key : "fonts"
		}, {
			key : "images"
		}];
		for (var i in items) {
			var item = items[i];
			if (_.has(_config, item.key)) {
				var obj = _config[key];
				if (_.has(item, "extend")) {
					_.extend(obj, item.extend);
				}
				resources.set(key, [obj]);
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
		var styles = theme.styles;
		for (var i in styles) {
			Alloy["_".concat(i)] = _.clone(styles[i]);
		}

		//menu items
		Alloy.Collections.menuItems.reset(menu.items);

		//template
		Alloy.Models.template.set(template);

		//language
		localization.init();

		//fonts
		for (var i in fonts) {
			/**
			 * Ti.App.registerFont - is a method available only with custom SDK build 3.4.1.mscripts and later
			 */
			if (OS_IOS || OS_ANDROID) {
				Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + fonts[i].file), fonts[i].id);
			}
			Alloy["_font_" + fonts[i].code] = fonts[i].id;
		}
		//replacing font code with post script id
		for (var i = 1; i <= 6; i++) {
			var hId = "_h".concat(i);
			Alloy[hId].fontFamily = Alloy["_font_" + Alloy[hId].fontFamily];
		}

		for (var i in images) {
			var orientations = images[i].orientation;
			for (var j in orientations) {
				var key = "_image_" + images[i].code;
				if (!_.has(Alloy, key)) {
					Alloy[key] = {};
				}
				Alloy[key][orientations[j]] = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryImages + "/" + images[i].file).nativePath;
			}
		}

		if (_callback) {
			_callback();
		}
	}
};

module.exports = Config;
