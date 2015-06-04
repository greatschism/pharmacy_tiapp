var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    logger = require("logger"),
    scule = require("com.scule"),
    utilities = require("utilities");

var Res = {

	/**
	 * storage engine & path to scule collection
	 */
	pathThemes : Alloy.CFG.storage_engine + "://" + Ti.Utils.md5HexDigest("themes"),
	pathTemplates : Alloy.CFG.storage_engine + "://" + Ti.Utils.md5HexDigest("templates"),
	pathMenus : Alloy.CFG.storage_engine + "://" + Ti.Utils.md5HexDigest("menus"),
	pathLanguages : Alloy.CFG.storage_engine + "://" + Ti.Utils.md5HexDigest("languages"),
	pathFonts : Alloy.CFG.storage_engine + "://" + Ti.Utils.md5HexDigest("fonts"),
	pathImages : Alloy.CFG.storage_engine + "://" + Ti.Utils.md5HexDigest("images"),

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

		if (utilities.getProperty(Alloy.CFG.resources_updated_on, "", "string", false) != Ti.App.version || !ENV_PROD) {

			var keys = ["themes", "templates", "menus", "languages", "fonts", "images"],
			    initialData = require(Res.directoryData + "/" + "resources"),
			    clearCache = Alloy.CFG.clear_cached_resources && (utilities.getProperty(Alloy.CFG.resources_cleared_on, "", "string", false) != Ti.App.version || !ENV_PROD);

			for (var i in keys) {
				Res.set(keys[i], initialData[keys[i]], true, clearCache);
			}

			if (clearCache) {
				utilities.setProperty(Alloy.CFG.resources_cleared_on, Ti.App.version, "string", false);
			}

			utilities.setProperty(Alloy.CFG.resources_updated_on, Ti.App.version, "string", false);

		}
	},

	getCollection : function(key) {
		var path;
		switch(key) {
		case "themes":
			path = Res.pathThemes;
			break;
		case "templates":
			path = Res.pathTemplates;
			break;
		case "menus":
			path = Res.pathMenus;
			break;
		case "languages":
			path = Res.pathLanguages;
			break;
		case "fonts":
			path = Res.pathFonts;
			break;
		case "images":
			path = Res.pathImages;
			break;
		}
		return scule.factoryCollection(path);
	},

	get : function(key, where, conditions) {
		return Res.getCollection(key).find(where || {}, conditions || {});
	},

	set : function(key, data, useLocalResources, clearCache) {
		Res["set" + utilities.ucfirst(key)](data, useLocalResources, clearCache);
	},

	setThemes : function(items, useLocalResources, clearCache) {
		var coll = Res.getCollection("themes"),
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false;
		if (clearCache) {
			coll.clear();
		}
		for (var i in items) {
			var item = items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (useLocalResources) {
				_.extend(item, {
					styles : require(Res.directoryThemes + "/" + item.id).styles
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "styles"),
					revert : item.selected && !_.has(item, "styles"),
					selected : !_.has(item, "styles") ? false : item.selected
				});
				coll.save(item);
				logger.debug("theme added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "styles") && !_.has(model, "styles"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.debug("theme updated : " + item.id);
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

	setTemplates : function(items, useLocalResources, clearCache) {
		var coll = Res.getCollection("templates"),
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false;
		if (clearCache) {
			coll.clear();
		}
		for (var i in items) {
			var item = items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (useLocalResources) {
				_.extend(item, {
					data : require(Res.directoryTemplates + "/" + item.id).data
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "data"),
					revert : item.selected && !_.has(item, "data"),
					selected : !_.has(item, "data") ? false : item.selected
				});
				coll.save(item);
				logger.debug("template added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "data") && !_.has(model, "data"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.debug("template updated : " + item.id);
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

	setMenus : function(items, useLocalResources, clearCache) {
		var coll = Res.getCollection("menus"),
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false;
		if (clearCache) {
			coll.clear();
		}
		for (var i in items) {
			var item = items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (useLocalResources) {
				_.extend(item, {
					items : require(Res.directoryMenus + "/" + item.id).items
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "items"),
					revert : item.selected && !_.has(item, "items"),
					selected : !_.has(item, "items") ? false : item.selected
				});
				coll.save(item);
				logger.debug("menu added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "items") && !_.has(model, "items"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.debug("menus updated : " + item.id);
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

	setLanguages : function(items, useLocalResources, clearCache) {
		var coll = Res.getCollection("languages"),
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false;
		if (clearCache) {
			coll.clear();
		}
		for (var i in items) {
			var item = items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (useLocalResources) {
				_.extend(item, {
					strings : require(Res.directoryLanguages + "/" + item.id).strings
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "strings"),
					revert : item.selected && !_.has(item, "strings"),
					selected : !_.has(item, "strings") ? false : item.selected
				});
				coll.save(item);
				logger.debug("language added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "strings") && !_.has(model, "strings"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.debug("language updated : " + item.id);
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

	setFonts : function(items, useLocalResources, clearCache) {
		var coll = Res.getCollection("fonts"),
		    dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryData),
		    fontsDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryFonts);
		if (clearCache) {
			coll.clear();
		}
		if (!dataDir.exists()) {
			dataDir.createDirectory();
		}
		if (!fontsDir.exists()) {
			fontsDir.createDirectory();
		}
		var platform = require("core").device.platform;
		for (var i in items) {
			var item = items[i];
			if (_.indexOf(item.platform, platform) >= 0) {
				var model = coll.find({
				id: item.id
				})[0] || {};
				if (useLocalResources) {
					var file = item.id + "_" + item.version + "." + item.format;
					utilities.copyFile(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Res.directoryFonts + "/" + item.id), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryFonts + "/" + file), false);
					_.extend(item, {
						file : file
					});
				}
				_.extend(item, {
					update : !_.has(item, "file")
				});
				if (_.isEmpty(model)) {
					coll.save(item);
					logger.debug("font added : " + item.id);
				} else if (item.version != model.version || useLocalResources) {
					_.extend(model, item);
					logger.debug("font updated : " + item.id);
				}
			}
		}
		coll.commit();
	},

	setImages : function(items, useLocalResources, clearCache) {
		var coll = Res.getCollection("images"),
		    dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryData),
		    imagesDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryImages);
		if (clearCache) {
			coll.clear();
		}
		if (!dataDir.exists()) {
			dataDir.createDirectory();
		}
		if (!imagesDir.exists()) {
			imagesDir.createDirectory();
		}
		for (var i in items) {
			var item = items[i],
			    model = coll.find({
			id: item.id
			})[0] || {};
			if (useLocalResources) {
				var file = item.id + "_" + item.version + "." + item.format;
				utilities.copyFile(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Res.directoryImages + "/" + item.id + "." + item.format), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryImages + "/" + file), false);
				_.extend(item, {
					file : file
				});
			}
			_.extend(item, {
				update : !_.has(item, "file")
			});
			if (_.isEmpty(model)) {
				coll.save(item);
				logger.debug("image added : " + item.id);
			} else if (item.version != model.version || useLocalResources) {
				_.extend(model, item);
				logger.debug("image updated : " + item.id);
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
			var toUpdate = Res.get(key, keys[key]);
			for (var i in toUpdate) {
				Res.updateQueue.push({
					key : key,
					data : _.omit(toUpdate[i], ["_id", "styles", "data", "items", "strings"])
				});
			}
		}
		return Res.updateQueue;
	},

	update : function(callback) {
		if (!Res.successCallback) {
			var http = require("http"),
			    updateQueue = Res.updateQueue;
			if (updateQueue.length) {
				Res.successCallback = callback;
				for (var i in updateQueue) {
					var queue = updateQueue[i];
					http.request({
						url : queue.data.url,
						type : "GET",
						format : queue.key == "fonts" || queue.key == "images" ? "data" : "json",
						passthrough : queue,
						success : Res.didUpdate,
						failure : Res.didUpdate
					});
					logger.debug("downloading " + queue.key + " - " + queue.data.id + " from " + queue.data.url);
				}
			} else if (callback) {
				callback();
			}
		}
	},

	didUpdate : function(data, _passthrough) {
		if (data) {
			var key = _passthrough.key,
			    coll = Res.getCollection(key),
			    model = coll.find({
			id : _passthrough.data.id
			})[0] || {};
			switch(key) {
			case "themes":
				_.extend(model, {
					styles : data,
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
					data : data,
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
					items : data,
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
					strings : data,
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
				utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryFonts + "/" + file), data, false);
				_.extend(model, {
					file : file,
					update : false
				});
				break;
			case "images":
				var unusedImgIds = [],
				    supportedOrientations = _.keys(model.orientation),
				    imagesWithSameCode = coll.find({
					id : {
						$ne : model.id
					},
					code : model.code
				});
				imagesWithSameCode.forEach(function(imgDoc) {
					for (var i in supportedOrientations) {
						if (_.has(imgDoc.orientation, supportedOrientations[i])) {
							unusedImgIds.push(imgDoc.id);
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
				utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryImages + "/" + file), data, false);
				_.extend(model, {
					file : file,
					update : false,
					properties : {}
				});
				break;
			}
			coll.commit();
			logger.debug("downloaded " + key + " - " + _passthrough.data.id + " from " + _passthrough.data.url);
			Res.updateQueue = _.reject(Res.updateQueue, function(obj) {
				return _.isEqual(obj, _passthrough);
			});
			if (Res.updateQueue.length == 0 && Res.successCallback) {
				Res.successCallback();
				Res.successCallback = null;
			}
		} else {
			logger.error("unable to download " + key + " from " + _passthrough.data.url);
		}
	},

	deleteUnusedResources : function() {
		//delete unused fonts
		var unusedFonts = _.difference(utilities.getFiles(Res.directoryFonts, Ti.Filesystem.applicationDataDirectory), _.pluck(Res.get("fonts"), "file"));
		for (var i in unusedFonts) {
			utilities.deleteFile(Res.directoryFonts + "/" + unusedFonts[i]);
		}
		//delete unused images
		var unusedImages = _.difference(utilities.getFiles(Res.directoryImages, Ti.Filesystem.applicationDataDirectory), _.pluck(Res.get("images"), "file"));
		for (var i in unusedImages) {
			utilities.deleteFile(Res.directoryImages + "/" + unusedImages[i]);
		}
	},

	updateImageProperties : function(item) {
		var coll = Res.getCollection("images"),
		    imageDoc = coll.find({
		code : item.code,
		file : item.file
		})[0] || {};
		if (!_.has(imageDoc, "properties")) {
			imageDoc.properties = {};
		}
		imageDoc.properties[item.orientation] = item.properties || {};
		coll.commit();
		return imageDoc.properties[item.orientation];
	}
};

module.exports = Res;
