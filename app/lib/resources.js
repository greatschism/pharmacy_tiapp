var utilities = require("utilities"),
    scule = require("com.scule"),
    logger = require("logger");

var Resources = {

	/**
	 * storage engine & path to scule collection
	 */
	pathTheme : "scule+titanium://theme",
	pathMenu : "scule+titanium://menu",
	pathTemplate : "scule+titanium://template",
	pathLanguages : "scule+titanium://languages",
	pathFonts : "scule+titanium://fonts",

	init : function() {

		if (Ti.App.Properties.getBool("updatedResourcesOn", "") != Ti.App.version || Ti.App.deployType != "production") {

			var clientData = JSON.parse(utilities.getFile("data/client.json"));

			//theme
			Resources.set("theme", clientData.theme);

			//menu
			Resources.set("menu", clientData.menu);

			//template
			Resources.set("template", clientData.template);

			//languages
			Resources.set("languages", clientData.languages.items);

			//fonts
			Resources.set("fonts", clientData.fonts.items);

			Ti.App.Properties.setString("updatedLangFileOn", Ti.App.version);

		}
	},

	getCollection : function(_key) {
		var path;
		switch(_key) {
		case "theme":
			path = Resources.pathTheme;
			break;
		case "menu":
			path = Resources.pathMenu;
			break;
		case "template":
			path = Resources.pathTemplate;
			break;
		case "languages":
			path = Resources.pathLanguages;
			break;
		case "fonts":
			path = Resources.pathFonts;
			break;
		}
		return scule.factoryCollection(path);
	},

	setLanguages : function(_lItems, _clearNSup) {
		var lColl = Resources.getCollection("languages");
		//update languages list to local db
		for (var i in _lItems) {
			var lItem = _lItems[i],
			    lModel = lColl.find({
			code: lItem.code
			})[0] || {};
			if (_.isEmpty(lModel)) {
				if (!_.has(lItem, "selected")) {
					_.extend(lItem, {
						selected : false
					});
				}
				_.extend(lItem, {
					strings : JSON.parse(utilities.getFile("data/languages/" + lItem.code + ".json") || "{}"),
					update : false
				});
				lColl.save(lItem);
				logger.i("language pushed to list : " + lItem.code);
			} else {
				if (lItem.version > lModel.version) {
					lModel = _.omit(lModel, ["_id"]);
					_.extend(lItem, {
						update : true
					});
					_.extend(lModel, lItem);
					lColl.update({
						code : lItem.code
					}, {
						$set : lItem
					}, {}, true);
					logger.i("language updated in list : " + lItem.code);
				}
			}
		}
		// remove unsupported languages
		if (_clearNSup !== false) {
			var supported = _.pluck(_lItems, "code");
			logger.i("language supported : " + supported);
			var removed = lColl.remove({
				code : {
					$nin : supported
				}
			});
			logger.i("language removed : " + removed);
		}
		// check for selected language
		var selected = lColl.find({
			selected : true
		});
		logger.i("language selected : " + selected[0].code);
		lColl.commit();
	},

	setFonts : function(_fItems, _clearNSup) {
		var fColl = Resources.getCollection("fonts"),
		    fontPath = "data/fonts",
		    dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "data"),
		    fontsDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fontPath),
		    fontFiles = utilities.getFiles(fontPath, Ti.Filesystem.applicationDataDirectory);
		if (OS_IOS || OS_ANDROID) {
			if (!dataDir.exists()) {
				dataDir.createDirectory();
			}
			if (!fontsDir.exists()) {
				fontsDir.createDirectory();
			}
		}
		var platform = OS_IOS ? "ios" : ( OS_ANDORID ? "android" : "mobileweb");
		for (var i in _fItems) {
			var fItem = _fItems[i];
			if (_.indexOf(fItem.platform, platform) >= 0) {
				var fModel = fColl.find({
				name: fItem.name
				})[0] || {};
				if (_.isEmpty(fModel)) {
					if (OS_IOS || OS_ANDROID) {
						var path = fontPath + "/" + fItem.name;
						utilities.copy(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, path), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path + ".ttf"));
					}
					_.extend(fItem, {
						update : false
					});
					fColl.save(fItem);
				} else {
					if (fItem.version > fModel.version) {
						fModel = _.omit(fModel, ["_id"]);
						_.extend(fItem, {
							update : true
						});
						_.extend(fModel, fItem);
						fColl.update({
							code : fItem.name
						}, {
							$set : fItem
						}, {}, true);
					}
				}
			}
		}
		// remove unsupported fonts
		if (_clearNSup !== false) {
			var supported = _.pluck(fColl.findAll(), "name");
			logger.i("fonts supported : " + supported);
			//delete unsupported font files
			for (var i in fontFiles) {
				if (_.indexOf(supported, fontFiles[i].replace(".ttf", "")) == -1) {
					utilities.deleteFile(fontPath + "/" + fontFiles[i], Ti.Filesystem.applicationDataDirectory);
				}
			}
			var removed = fColl.remove({
				name : {
					$nin : supported
				}
			});
			logger.i("fonts removed : " + removed);
		}
		fColl.commit();
	},

	set : function(_key, _data) {
		if (_key == "languages") {
			Resources.setLanguages(_data);
		} else if (_key == "fonts") {
			Resources.setFonts(_data);
		} else {
			var coll = Resources.getCollection(_key);
			coll.clear();
			coll.save(_data);
			coll.commit();
		}
	},

	get : function(_key) {
		var data = Resources.getCollection(_key).findAll();
		if (_key == "languages" || _key == "fonts") {
			return data;
		} else {
			return data[0] || {};
		}
	}
};

module.exports = Resources;
