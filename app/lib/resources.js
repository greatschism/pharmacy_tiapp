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
	 * items caused error while update
	 */
	errorQueue : [],

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
				Res.deleteUnusedResources();
				Res.collection.clear();
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
			 *  	theme - version
			 * 		menu - version
			 *  	template - version
			 *  	language - version & code
			 *  	fonts - version & code
			 *  	images - version & code
			 */
			var document = Res.collection.find(_.pick(obj, ["type", "version", "base_version", "code"]))[0] || {};

			if (useLocalResources) {
				if (obj.type == "fonts" || obj.type == "images") {
					obj.data = "updated";
				} else if (obj.type == "font" || obj.type == "image") {
					var srcFile = obj.type + "_" + obj.code + "_" + obj.version,
					    desFile = srcFile + "." + obj.format;
					utilities.copyFile(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Res.dataDirectory + "/" + srcFile), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.dataDirectory + "/" + desFile), false);
					obj.data = desFile;
				} else {
					var baseName = Res.dataDirectory + "/" + obj.type + "_";
					if (obj.type == "language") {
						baseName += obj.code + "_";
					}
					obj.data = require(baseName + obj.version).data;
				}
			}

			if (_.isEmpty(document)) {
				obj.update = !_.has(obj, "data");
				obj.revert = obj.selected && obj.update;
				obj.selected = obj.revert ? false : obj.selected;
				Res.collection.save(obj);
				logger.debug(TAG, "added", obj);
			} else if (obj.selected != document.selected || _.has(obj, "data")) {
				obj.update = !_.has(obj, "data") && !_.has(document, "data");
				obj.revert = obj.selected && obj.update;
				obj.selected = obj.revert ? false : obj.selected;
				_.extend(document, obj);
				logger.debug(TAG, "updated", document);
			}

			if (obj.selected || obj.revert) {
				var queryObj;
				switch(obj.type) {
				case "theme":
				case "template":
				case "menu":
				case "fonts":
				case "images":
					queryObj = {
						type : obj.type,
						version : {
							$ne : obj.version
						},
					};
					break;
				case "language":
					queryObj = {
						type : obj.type,
						$or : [{
							version : {
								$ne : obj.version
							}
						}, {
							code : {
								$ne : obj.code
							}
						}]
					};
					break;
				case "font":
				case "image":
					queryObj = {
						type : obj.type,
						code : obj.code,
						version : {
							$ne : obj.version
						}
					};
					break;
				}
				if (obj.selected) {
					queryObj.selected = true;
					Res.collection.update(queryObj, {
						$set : {
							selected : false
						}
					});
				}
				delete queryObj.selected;
				queryObj.revert = true;
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
		Res.errorQueue = [];

		//update all where update flag is true
		_.each(Res.collection.find({
			$or : [{
				selected : true
			}, {
				revert : true
			}],
			update : true
		}), function(obj) {
			Res.updateQueue.push(_.pick(obj, ["type", "version", "base_version", "code", "url"]));
		});

		return Res.updateQueue;
	},

	update : function(callback) {
		if (!Res.successCallback) {
			if (Res.updateQueue.length) {
				Res.successCallback = callback;
				_.each(Res.updateQueue, function(obj) {
					if (obj.type == "font" || obj.type == "image") {
						Res.downloadAsset(obj);
					} else {
						http.request({
							method : "appload_clientjson",
							params : {
								data : [{
									appload : {
										client_param_type : obj.type,
										client_param_version : obj.version,
										client_param_base_version : obj.base_version,
										client_param_lang_code : obj.code,
										app_version : Ti.App.version,
										client_name : Alloy.CFG.client_name
									}
								}]
							},
							passthrough : obj,
							errorDialogEnabled : false,
							success : Res.didUpdate,
							failure : Res.didUpdate
						});
					}
					logger.debug(TAG, "downloading", obj);
				});
			} else if (callback) {
				callback();
			}
		}
	},

	didUpdate : function(result, passthrough) {
		if ((_.has(result, "code") && result.code != Alloy.CFG.apiCodes.success_code) || (_.has(result, "success") && result.success === false)) {
			passthrough.error = true;
			logger.error(TAG, "unable to download", passthrough, "with error", result);
		} else {
			passthrough.error = false;
			logger.debug(TAG, "downloaded successfully", passthrough);
			var isAsset = passthrough.type == "fonts" || passthrough.type == "images",
			    item = _.pick(passthrough, ["type", "version", "base_version"]);
			_.extend(item, {
				data : isAsset ? "updated" : result.data.appload[passthrough.type],
				selected : true
			});
			if (passthrough.type == "language") {
				item.code = passthrough.code;
			}
			Res.setData([item]);
			if (isAsset) {
				var assets = result.data.appload[passthrough.type];
				_.each(assets, function(asset) {
					asset.selected = true;
				});
				Res.setData(assets);
				_.each(assets, function(asset) {
					if (asset.update == true) {
						var obj = _.pick(asset, ["type", "version", "base_version", "code", "url", "format"]);
						Res.updateQueue.push(obj);
						Res.downloadAsset(obj);
					}
				});
			}
		}
		Res.didComplete(passthrough);
	},

	downloadAsset : function(passthrough) {
		require("http").request({
			url : passthrough.url,
			format : "data",
			passthrough : passthrough,
			success : Res.didDownloadAsset,
			failure : Res.didDownloadAsset
		});
	},

	didDownloadAsset : function(result, passthrough) {
		if (_.isObject(result) && _.has(result, "success") && result.success === false) {
			passthrough.error = true;
			logger.error(TAG, "unable to download", passthrough, "with error", result);
		} else {
			passthrough.error = false;
			logger.debug(TAG, "downloaded successfully", passthrough);
			var desFile = passthrough.type + "_" + passthrough.code + "_" + passthrough.version + "." + passthrough.format;
			utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.dataDirectory + "/" + desFile), result);
			var item = _.pick(passthrough, ["type", "version", "base_version", "code"]);
			_.extend(item, {
				data : desFile,
				selected : true
			});
			Res.setData([item]);
		}
		Res.didComplete(passthrough);
	},

	didComplete : function(passthrough) {
		Res.errorQueue = _.filter(Res.updateQueue, function(obj) {
			return _.isEqual(obj, passthrough) && passthrough.error === true;
		});
		Res.updateQueue = _.reject(Res.updateQueue, function(obj) {
			return _.isEqual(obj, passthrough);
		});
		if (Res.updateQueue.length == 0 && Res.successCallback) {
			Res.successCallback(Res.errorQueue);
			Res.successCallback = null;
		}
	},

	deleteUnusedResources : function() {
		//delete unused fonts
		var unusedAssets = _.difference(utilities.getFiles(Res.dataDirectory, Ti.Filesystem.applicationDataDirectory), _.pluck(Res.collection.find({
			$or : [{
				type : "font",
				selected : true
			}, {
				type : "font",
				revert : true
			}, {
				type : "image",
				selected : true
			}, {
				type : "image",
				revert : true
			}]
		}), "data"));
		_.each(unusedAssets, function(data) {
			utilities.deleteFile(Res.dataDirectory + "/" + data);
		});
		Res.collection.remove({
			selected : false,
			revert : false
		});
		Res.collection.commit();
	},

	updateImageProperties : function(obj) {
		var imgDoc = Res.collection.find({
		type : "image",
		selected : true,
		name : obj.name,
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
