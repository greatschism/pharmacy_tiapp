var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    logger = require("logger"),
    scule = require("com.scule"),
    http = require("requestwrapper"),
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

			var initialData = require(Res.directoryData + "/" + "resources"),
			    clearCache = Alloy.CFG.clear_cached_resources && (utilities.getProperty(Alloy.CFG.resources_cleared_on, "", "string", false) != Ti.App.version || !ENV_PROD);

			_.each(["themes", "templates", "menus", "languages", "fonts", "images"], function(val) {
				Res.set(val, initialData[val], true, clearCache);
			});

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
		_.each(items, function(item) {
			var model = coll.find({
			id: item.id
			})[0] || {};
			if (useLocalResources) {
				_.extend(item, {
					data : require(Res.directoryThemes + "/" + item.code).data
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "data"),
					revert : item.selected && !_.has(item, "data"),
					selected : !_.has(item, "data") ? false : item.selected
				});
				coll.save(item);
				logger.debug("theme added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "data") && !_.has(model, "data"));
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
		});
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
		_.each(items, function(item) {
			var model = coll.find({
			id: item.id
			})[0] || {};
			if (useLocalResources) {
				_.extend(item, {
					data : require(Res.directoryTemplates + "/" + item.code).data
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
		});
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
		_.each(items, function(item) {
			var model = coll.find({
			id: item.id
			})[0] || {};
			if (useLocalResources) {
				_.extend(item, {
					data : require(Res.directoryMenus + "/" + item.code).data
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "data"),
					revert : item.selected && !_.has(item, "data"),
					selected : !_.has(item, "data") ? false : item.selected
				});
				coll.save(item);
				logger.debug("menu added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "data") && !_.has(model, "data"));
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
		});
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
		_.each(items, function(item) {
			var model = coll.find({
			id: item.id
			})[0] || {};
			if (useLocalResources) {
				_.extend(item, {
					data : require(Res.directoryLanguages + "/" + item.code).data
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "data"),
					revert : item.selected && !_.has(item, "data"),
					selected : !_.has(item, "data") ? false : item.selected
				});
				coll.save(item);
				logger.debug("language added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "data") && !_.has(model, "data"));
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
		});
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
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false,
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
		_.each(items, function(item) {
			var model = coll.find({
			id: item.id
			})[0] || {};
			if (_.has(item, "data")) {
				item.data = _.filter(item.data, function(font) {
					if (_.has(font, "platform") && _.indexOf(font.platform, platform) == -1) {
						return false;
					}
					delete font.platform;
					var fontDoc = _.findWhere(model.data, {
						id : font.id
					}) || {};
					if (!_.isEmpty(fontDoc)) {
						_.extend(font, _.pick(fontDoc, ["postscript", "file", "update"]));
					}
					if (useLocalResources) {
						var file = font.name + "_" + font.version + "." + font.format;
						utilities.copyFile(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Res.directoryFonts + "/" + font.name), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryFonts + "/" + file), false);
						_.extend(font, {
							postscript : font.name,
							file : file
						});
					}
					_.extend(font, {
						update : !_.has(font, "file") || (!_.isEmpty(fontDoc) && fontDoc.version != font.version)
					});
					return true;
				});
			}
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "data"),
					revert : item.selected && !_.has(item, "data"),
					selected : !_.has(item, "data") ? false : item.selected
				});
				coll.save(item);
				logger.debug("fonts coll added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "data") && !_.has(model, "data"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.debug("fonts coll updated : " + item.id);
			}
			if (item.selected) {
				selectedId = item.id;
			}
			if (item.revert) {
				revertId = item.id;
			}
		});
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

	setImages : function(items, useLocalResources, clearCache) {
		var coll = Res.getCollection("images"),
		    selectedId = (coll.find({
		selected: true
		})[0] || {}).id,
		    revertId = false,
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
		_.each(items, function(item) {
			var model = coll.find({
			id: item.id
			})[0] || {};
			_.each(item.data, function(image) {
				var imgDoc = _.findWhere(model.data, {
					id : image.id
				}) || {};
				if (!_.isEmpty(imgDoc)) {
					_.extend(image, _.pick(imgDoc, ["properties", "file", "update"]));
				}
				if (useLocalResources) {
					var file = image.name + "_" + image.version + "." + image.format;
					utilities.copyFile(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Res.directoryImages + "/" + image.name + "." + image.format), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryImages + "/" + file), false);
					_.extend(image, {
						file : file
					});
				}
				_.extend(image, {
					update : !_.has(image, "file") || (!_.isEmpty(imgDoc) && imgDoc.version != image.version)
				});
			});
			if (_.isEmpty(model)) {
				_.extend(item, {
					update : !_.has(item, "data"),
					revert : item.selected && !_.has(item, "data"),
					selected : !_.has(item, "data") ? false : item.selected
				});
				coll.save(item);
				logger.debug("images coll added : " + item.id);
			} else if (item.version != model.version || item.selected != model.selected || useLocalResources) {
				item.update = item.version != model.version || (!_.has(item, "data") && !_.has(model, "data"));
				item.revert = item.selected && item.update && selectedId != item.id;
				item.selected = item.revert ? false : item.selected;
				_.extend(model, item);
				logger.debug("images coll updated : " + item.id);
			}
			if (item.selected) {
				selectedId = item.id;
			}
			if (item.revert) {
				revertId = item.id;
			}
		});
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

	checkForUpdates : function() {
		//update all where update flag is true
		var where = {
			$or : [{
				"selected" : true
			}, {
				"revert" : true
			}],
			"update" : true
		},
		    items = {
			"theme" : "themes",
			"template" : "templates",
			"menu" : "menus",
			"language" : "languages",
			"fonts" : "fonts",
			"images" : "images"
		};
		_.each(items, function(val, key) {
			_.each(Res.get(val, where), function(updateObj) {
				Res.updateQueue.push({
					key : key,
					val : val,
					data : _.omit(updateObj, ["_id", "data"])
				});
			});
		});
		return Res.updateQueue;
	},

	update : function(callback) {
		if (!Res.successCallback) {
			updateQueue = Res.updateQueue;
			if (updateQueue.length) {
				Res.successCallback = callback;
				_.each(updateQueue, function(queue) {
					http.request({
						method : "appload_clientjson",
						params : {
							data : [{
								appload : {
									client_param_type : queue.key,
									client_param_version : queue.data.version,
									client_param_base_version : "1",
									app_version : Ti.App.version,
									client_name : Alloy.CFG.client_name
								}
							}]
						},
						passthrough : queue,
						errorDialogEnabled : false,
						success : Res.didUpdate,
						failure : Res.didFail
					});
					logger.debug("downloading " + queue.val + " - " + queue.data.version);
				});
			} else if (callback) {
				callback();
			}
		}
	},

	didUpdate : function(result, passthrough) {
		var coll = Res.getCollection(passthrough.val),
		    model = coll.find({
		id : passthrough.data.id
		})[0] || {};
		switch(passthrough.val) {
		case "themes":
			_.extend(model, {
				data : result.data.appload.theme.data,
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
				data : result.data.appload.template.data,
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
				data : result.data.appload.menu.data,
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
				code : result.data.appload.language.code,
				titleid : result.data.appload.language.titleid,
				data : result.data.appload.language.data,
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
			model.data = _.filter(result.data.appload.fonts.data, function(font) {
				if (_.has(font, "platform") && _.indexOf(font.platform, app.device.platform) == -1) {
					return false;
				}
				delete font.platform;
				var fontDoc = _.findWhere(model.data, {
					id : font.id
				}) || {};
				if (!_.isEmpty(fontDoc)) {
					_.extend(font, _.pick(fontDoc, ["postscript", "file", "update"]));
				}
				_.extend(font, {
					update : !_.has(font, "file") || (!_.isEmpty(fontDoc) && fontDoc.version != font.version)
				});
				return true;
			});
			break;
		case "images":
			model.data = _.filter(result.data.appload.images.data, function(image) {
				var imgDoc = _.findWhere(model.data, {
					id : image.id
				}) || {};
				if (!_.isEmpty(imgDoc)) {
					_.extend(image, _.pick(imgDoc, ["properties", "file", "update"]));
				}
				_.extend(image, {
					update : !_.has(image, "file") || (!_.isEmpty(imgDoc) && imgDoc.version != image.version)
				});
				return true;
			});
			break;
		}
		coll.commit();
		logger.debug("downloaded " + passthrough.val + " - " + passthrough.data.version);
		if (passthrough.val == "fonts" || passthrough.val == "images") {
			passthrough.data.queue = _.filter(model.data, function(asset) {
				return asset.update;
			});
			Res.downloadAssets(passthrough);
		} else {
			Res.didComplete(passthrough);
		}
	},

	downloadAssets : function(passthrough) {
		var httpClient = require("http");
		_.each(passthrough.data.queue, function(asset) {
			httpClient.request({
				url : asset.url,
				format : "data",
				passthrough : {
					assetId : asset.id,
					assetDetail : passthrough
				},
				success : Res.didDownloadAsset,
				failure : Res.didFail
			});
		});
	},

	didDownloadAsset : function(result, passthrough) {
		var assetId = passthrough.assetId;
		passthrough = passthrough.assetDetail;
		var coll = Res.getCollection(passthrough.val),
		    model = coll.find({
		id : passthrough.data.id
		})[0] || {},
		    asset = _.findWhere(model.data, {
			id : assetId
		}) || {},
		    dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryData);
		if (!dataDir.exists()) {
			dataDir.createDirectory();
		}
		var file = asset.name + "_" + asset.version + "." + asset.format;
		switch(passthrough.val) {
		case "fonts":
			var fontsDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryFonts);
			if (!fontsDir.exists()) {
				fontsDir.createDirectory();
			}
			utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryFonts + "/" + file), result, false);
			_.extend(asset, {
				postscript : asset.name,
				file : file,
				update : false
			});
			break;
		case "images":
			var imagesDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryImages);
			if (!imagesDir.exists()) {
				imagesDir.createDirectory();
			}
			utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.directoryImages + "/" + file), result, false);
			_.extend(asset, {
				file : file,
				update : false,
				properties : {}
			});
			var unusedImgIds = [],
			    supportedOrientations = _.keys(asset.orientation),
			    imagesWithSameCode = _.filter(model.data, function(image) {
				return image.id != asset.id && image.code == asset.code;
			});
			_.each(imagesWithSameCode, function(imgDoc) {
				for (var i in supportedOrientations) {
					if (_.has(imgDoc.orientation, supportedOrientations[i])) {
						unusedImgIds.push(imgDoc.id);
						break;
					}
				}
			});
			model.data = _.filter(model.data, function(image) {
				return _.indexOf(unusedImgIds, image.id) == -1;
			});
			break;
		}
		logger.debug("downloaded asset from " + passthrough.val + " with id " + assetId);
		passthrough.data.queue = _.reject(passthrough.data.queue, function(obj) {
			return obj.id == assetId;
		});
		model.update = passthrough.data.queue.length != 0;
		coll.commit();
		if (!model.update) {
			Res.didComplete(passthrough);
		}
	},

	didFail : function(error, passthrough) {
		logger.error("unable to download ", passthrough, " with error : ", error);
		//to keep system working, leave the errors it can be downloaded on next appload
		didComplete(passthrough.assetDetail || passthrough);
	},

	didComplete : function(passthrough) {
		Res.updateQueue = _.reject(Res.updateQueue, function(obj) {
			return _.isEqual(obj, passthrough);
		});
		if (Res.updateQueue.length == 0 && Res.successCallback) {
			Res.successCallback();
			Res.successCallback = null;
		}
	},

	deleteUnusedResources : function() {
		//delete unused fonts
		var unusedFonts = _.difference(utilities.getFiles(Res.directoryFonts, Ti.Filesystem.applicationDataDirectory), _.pluck((Res.get("fonts", {selected : true})[0] || {}).data, "file"));
		for (var i in unusedFonts) {
			utilities.deleteFile(Res.directoryFonts + "/" + unusedFonts[i]);
		}
		//delete unused images
		var unusedImages = _.difference(utilities.getFiles(Res.directoryImages, Ti.Filesystem.applicationDataDirectory), _.pluck((Res.get("images", {selected : true})[0] || {}).data, "file"));
		for (var i in unusedImages) {
			utilities.deleteFile(Res.directoryImages + "/" + unusedImages[i]);
		}
	},

	updateImageProperties : function(item) {
		var coll = Res.getCollection("images"),
		    imgDoc = _.findWhere((coll.find({
		selected : true
		})[0] || {}).data, {
			code : item.code,
			file : item.file
		}) || {};
		if (!_.has(imgDoc, "properties")) {
			imgDoc.properties = {};
		}
		imgDoc.properties[item.orientation] = item.properties || {};
		coll.commit();
		return imgDoc.properties[item.orientation];
	}
};

module.exports = Res;
