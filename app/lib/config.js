var Alloy = require("alloy"),
    _ = require("alloy/underscore")._;

var Configuration = {

	init : function(config, callback) {

		var resources = require("resources");

		/**
		 * initialization
		 */
		if (Alloy.CFG.override_remote_resources === true) {
			return [];
		}

		var items = {
			"theme" : "themes",
			"template" : "templates",
			"menu" : "menus",
			//"language" : "languages",
			"fonts" : "fonts",
			"images" : "images"
		};
		_.each(items, function(val, key) {
			if (_.has(config, key)) {
				var obj = config[key];
				_.extend(obj, {
					selected : true
				});
				resources.set(val, _.isArray(obj) ? obj : [obj]);
			}
		});

		/***
		 * no. of items to be updated
		 */
		return resources.checkForUpdates();
	},

	load : function(callback) {

		/**
		 * load into memory
		 */
		var resources = require("resources"),
		    utilities = require("utilities"),
		    theme = resources.get("themes", {selected : true})[0],
		    template = resources.get("templates", {selected : true})[0],
		    menu = resources.get("menus", {selected : true})[0],
		    fonts = resources.get("fonts", {selected : true})[0].data,
		    images = resources.get("images", {selected : true})[0].data;

		//menu
		Alloy.Collections.menuItems.reset(utilities.clone(menu.data));

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
		_.each(fonts, function(font) {
			//ignore if font doesn't have a valid file property
			if (!font.file) {
				return false;
			}
			var fontExists = _.findWhere(Alloy.RegFonts, {
				id : font.id
			});
			if (_.isUndefined(fontExists)) {
				Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + font.file), font.postscript);
				Alloy.RegFonts.push(_.extend(utilities.clone(font), {
					lastUpdate : lastUpdate
				}));
			} else {
				if (fontExists.file != font.file) {
					if (OS_IOS) {
						//ios will not allow to update a font, has to be unregistered and registered back
						Ti.App.unregisterFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + fontExists.file), fontExists.postscript);
					}
					//on android, registered font can be just replaced with new value
					Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + font.file), font.postscript);
				}
				_.extend(fontExists, {
					lastUpdate : lastUpdate
				});
			}
			Alloy.Fonts[font.code] = font.postscript;
		});
		//remove unwanted fonts from memory
		Alloy.RegFonts = _.reject(Alloy.RegFonts, function(font) {
			var flag = lastUpdate !== font.lastUpdate;
			if (flag) {
				Ti.App.unregisterFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryFonts + "/" + font.file), font.postscript);
			}
			return flag;
		});

		//images
		Alloy.Images = {};
		_.each(images, function(image) {
			//ignore if image doesn't have a valid file property
			if (!image.file) {
				return false;
			}
			var code = image.code,
			    orientations = image.orientation;
			if (!_.has(Alloy.Images, code)) {
				Alloy.Images[code] = {};
			}
			for (var orientation in orientations) {
				Alloy.Images[code][orientation] = {
					image : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.directoryImages + "/" + image.file).nativePath
				};
				_.extend(Alloy.Images[code][orientation], _.isObject(image.properties) && _.isObject(image.properties[orientation]) ? image.properties[orientation] : orientations[orientation]);
			}
		});

		//theme
		_.extend(Alloy.CFG, utilities.clone(_.omit(theme.data.config, ["ios", "android"])));
		var platform = require("core").device.platform;
		if (_.isObject(theme.data.config[platform])) {
			_.extend(Alloy.CFG, utilities.clone(theme.data.config[platform]));
		}
		Alloy.TSS = {
			Theme : {
				id : theme.id,
				version : theme.version
			}
		};
		var tss = utilities.clone(theme.data.tss),
		    constants = {
			"auto" : Ti.UI.SIZE,
			"fill" : Ti.UI.FILL
		};
		for (var ts in tss) {
			if (_.has(tss[ts], "width")) {
				tss[ts].width = constants[tss[ts].width] || tss[ts].width;
			}
			if (_.has(tss[ts], "height")) {
				tss[ts].height = constants[tss[ts].height] || tss[ts].height;
			}
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
			/**
			 * remove any '#' or '.' character in first place and repalce '-' with '_'
			 * and transform classifiers
			 * Example
			 * input: ".some-classname[platform=ios formFactor=handheld]"
			 * output: "some_classname_platform_ios_formFacoor_handheld"
			 * Note: Will support only one platform and one formFactor query, muliple combination should not be used
			 */
			var identifier = ts.replace(/^#/g, "").replace(/^\./, "").replace(/-+/g, "_").replace(/\[.*$/g, ""),
			    matches = ts.match(/\[.*$/g);
			if (matches && matches.length) {
				var classifiers = (matches[0] || "").replace(/\[|\]/g, "").split(" ");
				for (var i in classifiers) {
					identifier += "_" + classifiers[i].split("=").join("_");
				}
			}
			Alloy.TSS[identifier] = tss[ts];
		}
		Alloy.TSS.Window.titleAttributes.font.fontFamily = Alloy.Fonts[Alloy.TSS.Window.titleAttributes.font.fontFamily];

		/**
		 * delete unused resources
		 */
		if (Alloy.CFG.delete_unused_resources) {
			resources.deleteUnusedResources();
		}

		if (callback) {
			callback();
		}
	},

	updateImageProperties : function(item) {
		_.extend(Alloy.Images[item.code][item.orientation], require("resources").updateImageProperties(item));
	},

	updateResources : function(callback) {
		require("resources").update(callback);
	},

	/**
	 * https://appcelerator.force.com/portal/500F000000VToZE
	 * https://jira.appcelerator.org/browse/ALOY-755
	 * Note: Will support only one platform and one formFactor query, muliple combination should not be used
	 * @param {String} name
	 */
	updateTSS : function(name) {
		var dicts = require("alloy/styles/" + name),
		    theme = dicts[0];
		if (theme.style.id != Alloy.TSS.Theme.id || theme.style.version != Alloy.TSS.Theme.version) {
			for (var i in dicts) {
				var dict = dicts[i] || {},
				    key = (dict.key || "").replace(/-/g, "_");
				if (!_.has(Alloy.TSS, key)) {
					key += "_platform_" + require("core").device.platform;
				}
				if (dict.queries && dict.queries.formFactor) {
					key += "_formFactor_" + (dict.queries.formFactor.toLowerCase().replace("is", ""));
				}
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
