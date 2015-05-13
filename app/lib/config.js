var Alloy = require("alloy"),
    _ = Alloy._;

var Configuration = {

	init : function(_config, _callback) {

		var resources = require("resources");

		/**
		 * initialization
		 */
		//for debugging purpose only, should be false on test / production
		if (Alloy.CFG.OVERRIDE_REMOTE_RESOURCES === true) {
			return [];
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
		var resources = require("resources"),
		    utilities = require("utilities"),
		    theme = resources.get("themes", {selected : true})[0],
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

		//menu
		Alloy.Collections.menuItems.reset(utilities.clone(menu.items));

		//template
		Alloy.Models.template.set(utilities.clone(template));

		//language
		require("localization").init();

		//fonts
		Alloy.Fonts = {};
		if (!_.has(Alloy, "RegFonts")) {
			Alloy.RegFonts = [];
		}
		/**
		 * Ti.App.registerFont
		 *  and
		 * Ti.App.unregisterFont - is a method available only with custom SDK
		 */
		var lastUpdate = require("alloy/moment")().unix();
		for (var i in fonts) {
			var font = fonts[i],
			    fontExists = _.findWhere(Alloy.RegFonts, {
				id : font.id
			});
			if (_.isUndefined(fontExists)) {
				Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + font.file), font.id);
				Alloy.RegFonts.push(_.extend(utilities.clone(font), {
					lastUpdate : lastUpdate
				}));
			} else {
				if (fontExists.file != font.file) {
					if (OS_IOS) {
						//ios will not allow to update a font, has to be unregistered and registered back
						Ti.App.unregisterFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + fontExists.file), fontExists.id);
					}
					//on android, registered font can be just replaced with new value
					Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + font.file), font.id);
				}
				_.extend(fontExists, {
					lastUpdate : lastUpdate
				});
			}
			Alloy.Fonts[font.code] = font.id;
		}
		//remove unwanted fonts from memory
		Alloy.RegFonts = _.reject(Alloy.RegFonts, function(font) {
			var flag = lastUpdate !== font.lastUpdate;
			if (flag) {
				Ti.App.unregisterFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + font.file), font.id);
			}
			return flag;
		});

		//images
		Alloy.Images = {};
		for (var i in images) {
			var code = images[i].code,
			    orientations = images[i].orientation;
			if (!_.has(Alloy.Images, code)) {
				Alloy.Images[code] = {};
			}
			for (var orientation in orientations) {
				Alloy.Images[code][orientation] = {
					image : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryImages + "/" + images[i].file).nativePath
				};
				_.extend(Alloy.Images[code][orientation], _.isObject(images[i].properties) && _.isObject(images[i].properties[orientation]) ? images[i].properties[orientation] : orientations[orientation]);
			}
		}

		//theme
		_.extend(Alloy.CFG, utilities.clone(_.omit(theme.styles.config, ["ios", "android"])));
		var platform = require("core").device.platform;
		if (_.isObject(theme.styles.config[platform])) {
			_.extend(Alloy.CFG, utilities.clone(theme.styles.config[platform]));
		}
		Alloy.TSS = {
			Theme : {
				id : theme.id,
				version : theme.version
			}
		};
		var tss = utilities.clone(theme.styles.tss);
		for (var ts in tss) {
			if (_.has(tss[ts], "font")) {
				tss[ts].font.fontFamily = Alloy.Fonts[tss[ts].font.fontFamily];
			}
			if (_.has(tss[ts], "buttonFont")) {
				tss[ts].buttonFont.fontFamily = Alloy.Fonts[tss[ts].buttonFont.fontFamily];
			}
			if (_.has(tss[ts], "iconFont")) {
				tss[ts].iconFont.fontFamily = Alloy.Fonts[tss[ts].iconFont.fontFamily];
			}
			if (_.has(tss[ts], "secondaryFont")) {
				tss[ts].secondaryFont.fontFamily = Alloy.Fonts[tss[ts].secondaryFont.fontFamily];
			}
			//remove any '#' or '.' character in first place and repalce '-' with '_'
			Alloy.TSS[ts.replace(/^#/, '').replace(/^\./, '').replace(/-+/g, "_")] = tss[ts];
		}
		Alloy.TSS.Window.titleAttributes.font.fontFamily = Alloy.Fonts[Alloy.TSS.Window.titleAttributes.font.fontFamily];

		/**
		 * delete unused resources
		 */
		if (Alloy.CFG.DELETE_UNUSED_RESOURCES) {
			resources.deleteUnusedResources();
		}

		if (_callback) {
			_callback();
		}
	},

	updateImageProperties : function(_item) {
		_.extend(Alloy.Images[_item.code][_item.orientation], require("resources").updateImageProperties(_item));
	},

	updateResources : function(_callback) {
		require("resources").update(_callback);
	},

	/**
	 * https://appcelerator.force.com/portal/500F000000VToZE
	 * https://jira.appcelerator.org/browse/ALOY-755
	 * @param {String} name
	 */
	updateTSS : function(name) {
		var dicts = require("alloy/styles/" + name),
		    theme = dicts[0];
		if (theme.style.id != Alloy.TSS.Theme.id || theme.style.version != Alloy.TSS.Theme.version) {
			for (var i in dicts) {
				var dict = dicts[i] || {},
				    key = (dict.key || "").replace(/-/g, "_");
				if (_.has(Alloy.TSS, key)) {
					var style = dict.style;
					for (var prop in style) {
						if (_.has(Alloy.TSS[key], prop)) {
							style[prop] = Alloy.TSS[key][prop];
						}
					}
				}
			}
		}
	}
};

module.exports = Configuration;
