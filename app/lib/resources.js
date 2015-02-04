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

	successCallback : null,

	init : function() {

		if (Ti.App.Properties.getString(Alloy.CFG.RESOURCES_UPDATED_ON, "") != Ti.App.version || Ti.App.deployType != "production") {

			var keys = ["themes", "templates", "menus", "languages", "fonts", "images"],
			    clearCache = Alloy.CFG.clearCachedResources && (Ti.App.Properties.getString(Alloy.CFG.RESOURCES_CLEARED_ON, "") != Ti.App.version || Ti.App.deployType != "production");

			for (var i in keys) {
				var key = keys[i];
				Resources.set(key, JSON.parse(utilities.getFile(Resources.directoryData + "/" + key + ".json")), true, clearCache);
			}

			if (clearCache === true) {
				Ti.App.Properties.setString(Alloy.CFG.RESOURCES_CLEARED_ON, Ti.App.version);
			}

			Ti.App.Properties.setString(Alloy.CFG.RESOURCES_UPDATED_ON, Ti.App.version);

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

	set : function(_key, _data, _useLocalResources, _clearCache) {
		Resources["set" + utilities.ucfirst(_key)](_data, _useLocalResources, _clearCache);
	},

	setThemes : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("themes"),
		    selectedItem = false;
		if (_clearCache === true) {
			coll.clear();
		}
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			id: item.id
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
				logger.i("theme added : " + item.id);
			} else if (item.version > model.version || item.selected != model.selected || _useLocalResources === true) {
				_.extend(item, {
					revert : item.selected === true && _.has(model, "styles") === false,
					selected : _.has(model, "styles") === false ? false : item.selected
				});
				coll.update({
					id : item.id
				}, {
					$set : item
				}, {}, true);
				logger.i("theme updated : " + item.id);
			}
			if (item.selected === true) {
				selectedItem = item.id;
			}
		}
		if (selectedItem) {
			coll.update({
				id : {
					$ne : selectedItem
				}
			}, {
				$set : {
					selected : false
				}
			}, {}, true);
		}
		coll.commit();
	},

	setTemplates : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("templates"),
		    selectedItem = false;
		if (_clearCache === true) {
			coll.clear();
		}
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			id: item.id
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
				logger.i("template added : " + item.id);
			} else if (item.version > model.version || item.selected != model.selected || _useLocalResources === true) {
				_.extend(item, {
					revert : item.selected === true && _.has(model, "data") === false,
					selected : _.has(model, "data") === false ? false : item.selected
				});
				coll.update({
					id : item.id
				}, {
					$set : item
				}, {}, true);
				logger.i("template updated : " + item.id);
			}
			if (item.selected === true) {
				selectedItem = item.id;
			}
		}
		if (selectedItem) {
			coll.update({
				id : {
					$ne : selectedItem
				}
			}, {
				$set : {
					selected : false
				}
			}, {}, true);
		}
		coll.commit();
	},

	setMenus : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("menus"),
		    selectedItem = false;
		if (_clearCache === true) {
			coll.clear();
		}
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			id: item.id
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
				logger.i("menu added : " + item.id);
			} else if (item.version > model.version || item.selected != model.selected || _useLocalResources === true) {
				_.extend(item, {
					revert : item.selected === true && _.has(model, "items") === false,
					selected : _.has(model, "items") === false ? false : item.selected
				});
				coll.update({
					id : item.id
				}, {
					$set : item
				}, {}, true);
				logger.i("menu updated : " + item.id);
			}
			if (item.selected === true) {
				selectedItem = item.id;
			}
		}
		if (selectedItem) {
			coll.update({
				id : {
					$ne : selectedItem
				}
			}, {
				$set : {
					selected : false
				}
			}, {}, true);
		}
		coll.commit();
	},

	setLanguages : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("languages"),
		    selectedItem = false;
		if (_clearCache === true) {
			coll.clear();
		}
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (_useLocalResources === true) {
				_.extend(item, {
					strings : JSON.parse(utilities.getFile(Resources.directoryLanguages + "/" + item.id + ".json") || "{}")
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
				logger.i("language added : " + item.id);
			} else if (item.version > model.version || item.selected != model.selected || _useLocalResources === true) {
				_.extend(item, {
					revert : item.selected === true && _.has(model, "strings") === false,
					selected : _.has(model, "strings") === false ? false : item.selected
				});
				coll.update({
					id : item.id
				}, {
					$set : item
				}, {}, true);
				logger.i("language updated : " + item.id);
			}
			if (item.selected === true) {
				selectedItem = item.id;
			}
		}
		if (selectedItem) {
			coll.update({
				id : {
					$ne : selectedItem
				}
			}, {
				$set : {
					selected : false
				}
			}, {}, true);
		}
		coll.commit();
	},

	setFonts : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("fonts"),
		    dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryData),
		    fontsDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryFonts);
		if (_clearCache === true) {
			coll.clear();
		}
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
				id: item.id
				})[0] || {};
				if (_useLocalResources === true) {
					var file = item.id + "_" + item.version + "." + item.format;
					if (OS_IOS || OS_ANDROID) {
						utilities.copy(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Resources.directoryFonts + "/" + item.id), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryFonts + "/" + file), false);
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
					logger.i("font added : " + item.id);
				} else if (item.version > model.version || _useLocalResources === true) {
					coll.update({
						id : item.id
					}, {
						$set : item
					}, {}, true);
					logger.i("font updated : " + item.id);
				}
			}
		}
		coll.commit();
	},

	setImages : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("images"),
		    dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryData),
		    imagesDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryImages);
		if (_clearCache === true) {
			coll.clear();
		}
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
			id: item.id
			})[0] || {};
			if (_useLocalResources === true) {
				var file = item.id + "_" + item.version + "." + item.format;
				if (OS_IOS || OS_ANDROID) {
					utilities.copy(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Resources.directoryImages + "/" + item.id + "." + item.format), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryImages + "/" + file), false);
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
				logger.i("image added : " + item.id);
			} else if (item.version > model.version || _useLocalResources === true) {
				coll.update({
					id : item.id
				}, {
					$set : item
				}, {}, true);
				logger.i("image updated : " + item.id);
			}
		}
		coll.commit();
	},

	checkForUpdates : function() {
		//update all where update flag is true
		var keys = {
			"themes" : {
				$or : [{
					"selected" : true
				}, {
					"revert" : true
				}],
				"update" : true
			},
			"templates" : {
				$or : [{
					"selected" : true
				}, {
					"revert" : true
				}],
				"update" : true
			},
			"menus" : {
				$or : [{
					"selected" : true
				}, {
					"revert" : true
				}],
				"update" : true
			},
			"languages" : {
				$or : [{
					"selected" : true
				}, {
					"revert" : true
				}],
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
					data : _.omit(toUpdate[i], ["_id", "styles", "data", "items", "strings"])
				});
			}
		}
		return Resources.updateQueue.length;
	},

	update : function(_callback) {
		if (!Resources.successCallback) {
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
					logger.i("downloading " + queue.key + " - " + queue.data.id + " from " + queue.data.url);
				}
			} else if (_callback) {
				_callback();
			}
		}
	},

	didUpdate : function(_data, _passthrough) {
		if (_data) {
			var key = _passthrough.key,
			    coll = Resources.getCollection(key),
			    model = coll.find({
			id : _passthrough.data.id
			})[0] || {};
			switch(key) {
			case "themes":
				_.extend(model, {
					styles : _data,
					update : false
				});
				if (model.revert === true) {
					_.extend(model, {
						selected : true,
						revert : false
					});
					coll.update({
						id : {
							$ne : model.id
						}
					}, {
						$set : {
							selected : false
						}
					}, {}, true);
				}
				break;
			case "templates":
				_.extend(model, {
					data : _data,
					update : false
				});
				if (model.revert === true) {
					_.extend(model, {
						selected : true,
						revert : false
					});
					coll.update({
						id : {
							$ne : model.id
						}
					}, {
						$set : {
							selected : false
						}
					}, {}, true);
				}
				break;
			case "menus":
				_.extend(model, {
					items : _data,
					update : false
				});
				if (model.revert === true) {
					_.extend(model, {
						selected : true,
						revert : false
					});
					coll.update({
						id : {
							$ne : model.id
						}
					}, {
						$set : {
							selected : false
						}
					}, {}, true);
				}
				break;
			case "languages":
				_.extend(model, {
					strings : _data,
					update : false
				});
				if (model.revert === true) {
					_.extend(model, {
						selected : true,
						revert : false
					});
					coll.update({
						id : {
							$ne : model.id
						}
					}, {
						$set : {
							selected : false
						}
					}, {}, true);
				}
				break;
			case "fonts":
				coll.remove({
					id : {
						$ne : model.id
					},
					code : model.code
				});
				var file = model.id + "_" + model.version + "." + model.format;
				utilities.write(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryFonts + "/" + file), _data, false);
				_.extend(model, {
					file : file,
					update : false
				});
				break;
			case "images":
				var unusedImgIds = [],
				    supportedOrientations = model.orientation,
				    imagesWithSameCode = coll.find({
					id : {
						$ne : model.id
					},
					code : model.code
				});
				imagesWithSameCode.forEach(function(imgDocument) {
					for (var i in supportedOrientations) {
						if (_.contains(imgDocument[i].orientation, supportedOrientations[i])) {
							unusedImgIds.push(imgDocument.id);
							break;
						}
					}
				});
				coll.remove({
					id : {
						$in : unusedImgIds
					}
				});
				var file = model.id + "_" + model.version + "." + model.format;
				utilities.write(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryImages + "/" + file), _data, false);
				_.extend(model, {
					file : file,
					update : false
				});
				break;
			}
			coll.commit();
			logger.i("downloaded " + key + " - " + _passthrough.data.id + " from " + _passthrough.data.url);
			Resources.updateQueue = _.reject(Resources.updateQueue, function(obj) {
				return _.isEqual(obj, _passthrough);
			});
			if (Resources.updateQueue.length == 0 && Resources.successCallback) {
				Resources.successCallback();
				Resources.successCallback = null;
			}
		} else {
			logger.e("unable to download " + key + " from " + _passthrough.data.url);
		}
	},

	deleteUnusedResoruces : function() {
		//delete unused fonts
		var unusedFonts = _.difference(utilities.getFiles(Resources.directoryFonts, Ti.Filesystem.applicationDataDirectory), _.pluck(Resources.get("fonts"), "file"));
		for (var i in unusedFonts) {
			utilities.deleteFile(Resources.directoryFonts + "/" + unusedFonts[i]);
		}
		//delete unused images
		var unusedImages = _.difference(utilities.getFiles(Resources.directoryImages, Ti.Filesystem.applicationDataDirectory), _.pluck(Resources.get("images"), "file"));
		for (var i in unusedImages) {
			utilities.deleteFile(Resources.directoryImages + "/" + unusedImages[i]);
		}
	}
};

module.exports = Resources;
