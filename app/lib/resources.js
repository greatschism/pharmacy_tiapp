var TAG = "Resources",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    logger = require("logger"),
    scule = require("com.scule"),
    http = require("requestwrapper"),
    utilities = require("utilities");

var Res = {

	/**
	 * scule collection
	 */
	collection : scule.factoryCollection("scule+" + Alloy.CFG.storage_engine + "://" + Ti.Utils.md5HexDigest("resources")),

	/**
	 * directories used for storing files
	 */
	dataDirectory : "data",

	/**
	 * items to be updated
	 */
	updateQueue : [],

	/**
	 * callback after update
	 */
	updateCallback : null,

	init : function() {

		if (utilities.getProperty(Alloy.CFG.resources_updated_on, "", "string", false) != Ti.App.version || !ENV_PROD) {

			utilities.setProperty(Alloy.CFG.resources_updated_on, Ti.App.version, "string", false);

			var dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.dataDirectory);
			if (!dataDir.exists()) {
				dataDir.createDirectory();
			}

			if (Alloy.CFG.clear_cached_resources && (utilities.getProperty(Alloy.CFG.resources_cleared_on, "", "string", false) != Ti.App.version || !ENV_PROD)) {
				utilities.setProperty(Alloy.CFG.resources_cleared_on, Ti.App.version, "string", false);
				Res.collection.clear();
				Res.deleteUnusedResources();
			}

			Res.setData(require(Res.dataDirectory + "/" + "resources").data, true);

		}
	},

	setData : function(data, useLocalResources) {

		_.each(data, function(obj) {

			if (_.has(obj, "platform") && _.indexOf(obj.platform, app.device.platform) == -1) {
				return false;
			}
			delete obj.platform;

			/**
			 *  primary indexes
			 *  	theme - param_version
			 * 		menu - param_version
			 *  	template - param_version
			 *  	language - param_version & code
			 *  	fonts - param_version & code
			 *  	images - param_version & name (since same code will present for different orientation)
			 */
			var document = Res.collection.find(_.pick(obj, ["param_type", "param_version", "param_base_version", "code", "name"]))[0] || {};

			if (obj.param_type != "fonts" && obj.param_type != "images" && useLocalResources) {
				if (obj.param_type == "font" || obj.param_type == "image") {
					var srcFile = obj.param_type + "_" + (obj.name || obj.code) + "_" + obj.param_version,
					    desFile = srcFile + "." + obj.format;
					utilities.copyFile(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Res.dataDirectory + "/" + srcFile), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.dataDirectory + "/" + desFile), false);
					obj.data = desFile;
				} else {
					var baseName = Res.dataDirectory + "/" + obj.param_type + "_";
					if (obj.param_type == "language") {
						baseName += obj.code + "_";
					}
					obj.data = require(baseName + obj.param_version).data;
				}
			}

			if (_.isEmpty(document)) {
				_.extend(obj, {
					update : !useLocalResources,
					revert : obj.selected && !useLocalResources,
					selected : !useLocalResources ? false : obj.selected
				});
				Res.collection.save(obj);
				logger.debug(TAG, "added", obj);
			} else if (obj.version != document.version || obj.selected != document.selected || useLocalResources) {
				obj.update = obj.version != document.version && !useLocalResources;
				obj.revert = !document.selected && obj.update;
				obj.selected = obj.revert ? false : obj.selected;
				_.extend(document, obj);
				logger.debug(TAG, "updated", model);
			}

			if (document.selected) {
				var queryObj = {
					param_type : document.param_type,
					selected : true,
					$or : []
				};
				_.each(["code", "name", "param_version"], function(val) {
					if (_.has(document, val)) {
						var obj = {};
						obj[val] = {
							$ne : document[val]
						};
						queryObj["$or"].push(obj);
					}
				});
				Res.collection.update(queryObj, {
					$set : {
						selected : false
					}
				});
			}

			if (document.revert) {
				var queryObj = {
					param_type : document.param_type,
					revert : true,
					$or : []
				};
				_.each(["code", "name", "param_version"], function(val) {
					if (_.has(document, val)) {
						var obj = {};
						obj[val] = {
							$ne : document[val]
						};
						queryObj["$or"].push(obj);
					}
				});
				Res.collection.update(queryObj, {
					$set : {
						revert : false
					}
				});
			}

		});

		Res.collection.commit();
	},

	checkForUpdates : function() {

		if (Res.updateCallback) {
			return false;
		}

		//reset queue
		Res.updateQueue = [];

		//update all where update flag is true
		_.each(Res.collection.find({
			$or : [{
				selected : true
			}, {
				revert : true
			}],
			update : true
		}), function(obj, key) {
			Res.updateQueue.push(_.omit(obj, ["_id", "data"]));
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
		var unusedFonts = _.difference(utilities.getFiles(Res.dataDirectory, Ti.Filesystem.applicationDataDirectory), _.pluck(Res.collection.find({
			$or : [{
				param_type : "font",
			}, {
				param_type : "image",
			}],
			selected : false,
			update : false,
			revert : false
		}), "data"));
		_.each(unusedFonts, function(data) {
			utilities.deleteFile(Res.dataDirectory + "/" + data);
		});
		Res.collection.remove({
			selected : false,
			update : false,
			revert : false
		});
		Res.collection.commit();
	},

	updateImageProperties : function(obj) {
		var imgDoc = Res.collection.find({
		param_type : "image",
		selected : true,
		code : obj.code,
		data : obj.data
		})[0] || {};
		if (!_.has(imgDoc, "properties")) {
			imgDoc.properties = {};
		}
		imgDoc.properties[obj.orientation] = obj.properties || {};
		Res.collection.commit();
		return imgDoc.properties[obj.orientation];
	}
};

module.exports = Res;
