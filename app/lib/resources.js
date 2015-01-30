var utilities = require("utilities"),
    scule = require("com.scule"),
    http = require("http"),
    logger = require("logger");

var Resources = {

	/**
	 * storage engine & path to scule collection
	 */
	pathThemes : "scule+titanium://themes",
	pathTemplates : "scule+titanium://templates",
	pathMenus : "scule+titanium://menus",
	pathLanguages : "scule+titanium://languages",
	pathFonts : "scule+titanium://fonts",
	pathImages : "scule+titanium://images",

	/**
	 * directories used for storing files
	 */
	directoryData : "data",
	directoryLanguages : "data/languages",
	directoryFonts : "data/fonts",
	directoryImages : "data/images",

	/**
	 * items to be updated
	 */
	updateQueue : [],

	successCallback : false,

	init : function() {

		if (Ti.App.Properties.getString("updatedResourcesOn", "") != Ti.App.version || Ti.App.deployType != "production") {

			//themes
			Resources.set("themes", JSON.parse(utilities.getFile(Resources.directoryData + "/themes.json")), true);

			//templates
			Resources.set("templates", JSON.parse(utilities.getFile(Resources.directoryData + "/templates.json")), true);

			//menus
			Resources.set("menus", JSON.parse(utilities.getFile(Resources.directoryData + "/menus.json")), true);

			//languages
			Resources.set("languages", JSON.parse(utilities.getFile(Resources.directoryData + "/languages.json")), true);

			//fonts
			Resources.set("fonts", JSON.parse(utilities.getFile(Resources.directoryData + "/fonts.json")), true);

			//images
			Resources.set("images", JSON.parse(utilities.getFile(Resources.directoryData + "/images.json")), true);

			Ti.App.Properties.setString("updatedResourcesOn", Ti.App.version);

		}
	},

	getCollection : function(_key) {
		var path;
		switch(_key) {
		case "themes":
			path = Resources.pathThemes;
			break;
		case "templates":
			path = Resources.pathTemplates;
			break;
		case "menus":
			path = Resources.pathMenus;
			break;
		case "languages":
			path = Resources.pathLanguages;
			break;
		case "fonts":
			path = Resources.pathFonts;
			break;
		case "images":
			path = Resources.pathImages;
			break;
		}
		return scule.factoryCollection(path);
	},

	get : function(_key, _where, _conditions) {
		return Resources.getCollection(_key).find(_where || {}, _conditions || {});
	},

	set : function(_key, _data, _useLocalResources) {
		Resources["set" + utilities.ucfirst(_key)](_data, _useLocalResources);
	},

	setThemes : function(_items, _useLocalResources) {
		var coll = Resources.getCollection("themes");
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			name: item.name
			})[0] || {};
			if (_useLocalResources !== true && _.has(item, "styles")) {
				item = _.omit(item, ["styles"]);
			}
			_.extend(item, {
				update : !_.has(item, "styles")
			});
			if (_.isEmpty(model)) {
				_.extend(item, {
					revert : item.selected === true && item.update === true,
					selected : item.update === true ? false : item.selected
				});
				coll.save(item);
				logger.i("theme added : " + item.name);
			} else if (item.version > model.version || _useLocalResources === true) {
				_.extend(item, {
					revert : item.selected === true && _.has(model, "styles") === false,
					selected : _.has(model, "styles") === false ? false : item.selected
				});
				coll.update({
					name : item.name
				}, {
					$set : item
				}, {}, true);
				logger.i("theme updated : " + item.name);
			}
		}
		coll.commit();
	},

	setTemplates : function(_items, _useLocalResources) {
		var coll = Resources.getCollection("templates");
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			name: item.name
			})[0] || {};
			if (_useLocalResources !== true && _.has(item, "data")) {
				item = _.omit(item, ["data"]);
			}
			_.extend(item, {
				update : !_.has(item, "data")
			});
			if (_.isEmpty(model)) {
				_.extend(item, {
					revert : item.selected === true && item.update === true,
					selected : item.update === true ? false : item.selected
				});
				coll.save(item);
				logger.i("template added : " + item.name);
			} else if (item.version > model.version || _useLocalResources === true) {
				_.extend(item, {
					revert : item.selected === true && _.has(model, "data") === false,
					selected : _.has(model, "data") === false ? false : item.selected
				});
				coll.update({
					name : item.name
				}, {
					$set : item
				}, {}, true);
				logger.i("template updated : " + item.name);
			}
		}
		coll.commit();
	},

	setMenus : function(_items, _useLocalResources) {
		var coll = Resources.getCollection("menus");
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			name: item.name
			})[0] || {};
			if (_useLocalResources !== true && _.has(item, "items")) {
				item = _.omit(item, ["items"]);
			}
			_.extend(item, {
				update : !_.has(item, "items")
			});
			if (_.isEmpty(model)) {
				_.extend(item, {
					revert : item.selected === true && item.update === true,
					selected : item.update === true ? false : item.selected
				});
				coll.save(item);
				logger.i("menu added : " + item.name);
			} else if (item.version > model.version || _useLocalResources === true) {
				_.extend(item, {
					revert : item.selected === true && _.has(model, "items") === false,
					selected : _.has(model, "items") === false ? false : item.selected
				});
				coll.update({
					name : item.name
				}, {
					$set : item
				}, {}, true);
				logger.i("menu updated : " + item.name);
			}
		}
		coll.commit();
	},

	setLanguages : function(_items, _useLocalResources) {
		var coll = Resources.getCollection("languages");
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			name: item.name
			})[0] || {};
			if (_useLocalResources === true) {
				_.extend(item, {
					strings : JSON.parse(utilities.getFile(Resources.directoryLanguages + "/" + item.name + ".json") || "{}")
				});
			} else if (_.has(item, "strings")) {
				item = _.omit(item, ["strings"]);
			}
			_.extend(item, {
				update : !_.has(item, "strings")
			});
			if (_.isEmpty(model)) {
				_.extend(item, {
					revert : item.selected === true && item.update === true,
					selected : item.update === true ? false : item.selected
				});
				coll.save(item);
				logger.i("language added : " + item.name);
			} else if (item.version > model.version || _useLocalResources === true) {
				_.extend(item, {
					revert : item.selected === true && _.has(model, "strings") === false,
					selected : _.has(model, "strings") === false ? false : item.selected
				});
				coll.update({
					name : item.name
				}, {
					$set : item
				}, {}, true);
				logger.i("language updated : " + item.name);
			}
		}
		coll.commit();
	},

	setFonts : function(_items, _useLocalResources) {
		var coll = Resources.getCollection("fonts"),
		    dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryData),
		    fontsDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryFonts),
		    fontFiles = utilities.getFiles(Resources.directoryFonts, Ti.Filesystem.applicationDataDirectory);
		if (OS_IOS || OS_ANDROID) {
			if (!dataDir.exists()) {
				dataDir.createDirectory();
			}
			if (!fontsDir.exists()) {
				fontsDir.createDirectory();
			}
		}
		var platform = OS_IOS ? "ios" : ( OS_ANDROID ? "android" : "mobileweb");
		for (var i in _items) {
			var item = _items[i];
			if (_.indexOf(item.platform, platform) >= 0) {
				var model = coll.find({
				name: item.name
				})[0] || {};
				if (_useLocalResources === true) {
					var file = item.name + "_" + item.version + "." + item.format;
					if (OS_IOS || OS_ANDROID) {
						utilities.copy(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Resources.directoryFonts + "/" + item.name), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryFonts + "/" + file));
					}
					_.extend(item, {
						file : file
					});
				}
				_.extend(item, {
					update : !_.has(item, "file")
				});
				if (_.isEmpty(model)) {
					coll.save(item);
					logger.i("font added : " + item.name);
				} else if (item.version > model.version || _useLocalResources === true) {
					coll.update({
						name : item.name
					}, {
						$set : item
					}, {}, true);
					logger.i("font updated : " + item.name);
				}
			}
		}
		coll.commit();
	},

	setImages : function(_items, _useLocalResources) {
		var coll = Resources.getCollection("images"),
		    dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryData),
		    imagesDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryImages),
		    imageFiles = utilities.getFiles(Resources.directoryImages, Ti.Filesystem.applicationDataDirectory);
		if (OS_IOS || OS_ANDROID) {
			if (!dataDir.exists()) {
				dataDir.createDirectory();
			}
			if (!imagesDir.exists()) {
				imagesDir.createDirectory();
			}
		}
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			name: item.name
			})[0] || {};
			if (_useLocalResources === true) {
				var file = item.name + "_" + item.version + "." + item.format;
				if (OS_IOS || OS_ANDROID) {
					utilities.copy(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Resources.directoryImages + "/" + item.name + "." + item.format), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryImages + "/" + file));
				}
				_.extend(item, {
					file : file
				});
			}
			_.extend(item, {
				update : !_.has(item, "file")
			});
			if (_.isEmpty(model)) {
				coll.save(item);
				logger.i("image added : " + item.name);
			} else if (item.version > model.version || _useLocalResources === true) {
				coll.update({
					name : item.name
				}, {
					$set : item
				}, {}, true);
				logger.i("image updated : " + item.name);
			}
		}
		coll.commit();
	},

	checkForUpdates : function() {
		//update all where update flag is true
		var keys = {
			"themes" : {
				"selected" : true,
				"update" : true
			},
			"templates" : {
				"selected" : true,
				"update" : true
			},
			"menus" : {
				"selected" : true,
				"update" : true
			},
			"languages" : {
				"selected" : true,
				"update" : true
			},
			"fonts" : {
				"update" : true
			},
			"images" : {
				"update" : true
			}
		};
		for (var key in keys) {
			var toUpdate = Resources.get(key, keys[key]);
			for (var i in toUpdate) {
				Resources.updateQueue.push({
					key : key,
					data : _.omit(toUpdate[i], ["_id", "strings"])
				});
			}
		}
		return Resources.updateQueue.length;
	},

	update : function(_callback) {
		if (Resources.successCallback === false) {
			var updateQueue = Resources.updateQueue;
			if (updateQueue.length) {
				Resources.successCallback = _callback;
				for (var i in updateQueue) {
					var queue = updateQueue[i];
					http.request({
						url : queue.data.url,
						type : "GET",
						format : queue.key == "fonts" || queue.key == "images" ? "DATA" : "JSON",
						passthrough : queue,
						success : Resources.didUpdate,
						failure : Resources.didUpdate
					});
					logger.i("downloading " + queue.key + " from " + queue.data.url);
				}
			} else if (_callback) {
				_callback();
			}
		}
	},

	didUpdate : function(_data, _url, _passthrough) {
		if (_data) {
			//reset update flag
			var coll = Resources.getCollection(_passthrough.key);
			coll.commit();
			logger.i("downloaded " + _passthrough.key + " from " + _passthrough.data.url);
		} else {
			logger.e("unable to download " + _passthrough.key + " from " + _passthrough.data.url);
		}
		Resources.updateQueue = _.reject(Resources.updateQueue, function(obj) {
			return _.isEqual(obj, _passthrough);
		});
		if (Resources.updateQueue.length == 0 && Resources.successCallback) {
			Resources.successCallback();
			Resources.successCallback = false;
		}
	}
};

module.exports = Resources;
