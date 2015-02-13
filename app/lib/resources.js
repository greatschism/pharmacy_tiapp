var utilities = require("utilities"),
    scule = require("com.scule"),
    http = require("http"),
    logger = require("logger");

var Resources = {

	/**
	 * storage engine & path to scule collection
	 */
	pathThemes : Alloy.CFG.storageEngine + "://fe021943dcda87150f590b3475afaded",
	pathTemplates : Alloy.CFG.storageEngine + "://fed36e93a0509e20f2dc96cbbd85b678",
	pathMenus : Alloy.CFG.storageEngine + "://81ca0b7c951be89184c130d2860a5b00",
	pathLanguages : Alloy.CFG.storageEngine + "://f3e334d42863e8250c7d03efefbfd387",
	pathFonts : Alloy.CFG.storageEngine + "://980d14c0c85495b48b9a9134658e6121",
	pathImages : Alloy.CFG.storageEngine + "://59b514174bffe4ae402b3d63aad79fe0",

	/**
	 * directories used for storing files
	 */
	directoryData : "data",
	directoryThemes : "data/themes",
	directoryTemplates : "data/templates",
	directoryMenus : "data/menus",
	directoryLanguages : "data/languages",
	directoryFonts : "data/fonts",
	directoryImages : "data/images",

	/**
	 * items to be updated
	 */
	updateQueue : [],

	successCallback : null,

	init : function() {

		if (utilities.getProperty(Alloy.CFG.RESOURCES_UPDATED_ON, "", "string", false) != Ti.App.version || !ENV_PRODUCTION) {

			var keys = ["themes", "templates", "menus", "languages", "fonts", "images"],
			    clearCache = Alloy.CFG.clearCachedResources && (utilities.getProperty(Alloy.CFG.RESOURCES_CLEARED_ON, "", "string", false) != Ti.App.version || !ENV_PRODUCTION);

			for (var i in keys) {
				var key = keys[i],
				    o = require(Resources.directoryData + "/" + key)[key];
				Resources.set(key, o, true, clearCache);
			}

			if (clearCache) {
				utilities.setProperty(Alloy.CFG.RESOURCES_CLEARED_ON, Ti.App.version, "string", false);
			}

			utilities.setProperty(Alloy.CFG.RESOURCES_UPDATED_ON, Ti.App.version, "string", false);

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
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false;
		if (_clearCache) {
			coll.clear();
		}
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (_useLocalResources) {
				_.extend(item, {
					styles : require(Resources.directoryThemes + "/" + item.id)
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "styles"),
					revert : item.selected && !_.has(item, "styles"),
					selected : !_.has(item, "styles") ? false : item.selected
				});
				coll.save(item);
				logger.i("theme added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || _useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "styles") && !_.has(model, "styles"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.i("theme updated : " + item.id);
			}
			if (item.selected) {
				selectedId = item.id;
			}
			if (item.revert) {
				revertId = item.id;
			}
		}
		if (selectedId) {
			coll.update({
				id : {
					$ne : selectedId
				}
			}, {
				$set : {
					selected : false
				}
			}, {}, true);
		}
		coll.update({
			id : {
				$ne : revertId
			}
		}, {
			$set : {
				revert : false
			}
		}, {}, true);
		coll.commit();
	},

	setTemplates : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("templates"),
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false;
		if (_clearCache) {
			coll.clear();
		}
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (_useLocalResources) {
				_.extend(item, {
					data : require(Resources.directoryTemplates + "/" + item.id)
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "data"),
					revert : item.selected && !_.has(item, "data"),
					selected : !_.has(item, "data") ? false : item.selected
				});
				coll.save(item);
				logger.i("template added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || _useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "data") && !_.has(model, "data"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.i("template updated : " + item.id);
			}
			if (item.selected) {
				selectedId = item.id;
			}
			if (item.revert) {
				revertId = item.id;
			}
		}
		if (selectedId) {
			coll.update({
				id : {
					$ne : selectedId
				}
			}, {
				$set : {
					selected : false
				}
			}, {}, true);
		}
		coll.update({
			id : {
				$ne : revertId
			}
		}, {
			$set : {
				revert : false
			}
		}, {}, true);
		coll.commit();
	},

	setMenus : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("menus"),
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false;
		if (_clearCache) {
			coll.clear();
		}
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (_useLocalResources) {
				_.extend(item, {
					items : require(Resources.directoryMenus + "/" + item.id)
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "items"),
					revert : item.selected && !_.has(item, "items"),
					selected : !_.has(item, "items") ? false : item.selected
				});
				coll.save(item);
				logger.i("menu added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || _useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "items") && !_.has(model, "items"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.i("menus updated : " + item.id);
			}
			if (item.selected) {
				selectedId = item.id;
			}
			if (item.revert) {
				revertId = item.id;
			}
		}
		if (selectedId) {
			coll.update({
				id : {
					$ne : selectedId
				}
			}, {
				$set : {
					selected : false
				}
			}, {}, true);
		}
		coll.update({
			id : {
				$ne : revertId
			}
		}, {
			$set : {
				revert : false
			}
		}, {}, true);
		coll.commit();
	},

	setLanguages : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("languages"),
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false;
		if (_clearCache) {
			coll.clear();
		}
		for (var i in _items) {
			var item = _items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (_useLocalResources) {
				_.extend(item, {
					strings : require(Resources.directoryLanguages + "/" + item.id)
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "strings"),
					revert : item.selected && !_.has(item, "strings"),
					selected : !_.has(item, "strings") ? false : item.selected
				});
				coll.save(item);
				logger.i("language added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || _useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "strings") && !_.has(model, "strings"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.i("language updated : " + item.id);
			}
			if (item.selected) {
				selectedId = item.id;
			}
			if (item.revert) {
				revertId = item.id;
			}
		}
		if (selectedId) {
			coll.update({
				id : {
					$ne : selectedId
				}
			}, {
				$set : {
					selected : false
				}
			}, {}, true);
		}
		coll.update({
			id : {
				$ne : revertId
			}
		}, {
			$set : {
				revert : false
			}
		}, {}, true);
		coll.commit();
	},

	setFonts : function(_items, _useLocalResources, _clearCache) {
		var coll = Resources.getCollection("fonts"),
		    dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryData),
		    fontsDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryFonts);
		if (_clearCache) {
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
				if (_useLocalResources) {
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
				} else if (item.version != model.version || _useLocalResources) {
					_.extend(model, item);
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
		if (_clearCache) {
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
			if (_useLocalResources) {
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
			} else if (item.version != model.version || _useLocalResources) {
				_.extend(model, item);
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
		return Resources.updateQueue;
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
				if (model.revert) {
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
				if (model.revert) {
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
				if (model.revert) {
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
				if (model.revert) {
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
