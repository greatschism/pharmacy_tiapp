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

		if (utilities.getProperty(Alloy.CFG.resources_updated_on) != Ti.App.version || !ENV_PROD) {

			var dataDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.dataDirectory);
			if (!dataDir.exists()) {
				dataDir.createDirectory();
			}

			if (Alloy.CFG.clear_cached_resources && (utilities.getProperty(Alloy.CFG.resources_cleared_on) != Ti.App.version || !ENV_PROD)) {
				Res.deleteUnusedResources();
				Res.collection.clear();
				/**
				 *  update flag once data is flushed
				 */
				utilities.setProperty(Alloy.CFG.resources_cleared_on, Ti.App.version);
			}

			var data = require(Res.dataDirectory + "/" + "resources").data;

			//set default language as device language during first launch
			if (utilities.getProperty(Alloy.CFG.first_launch_app, true, "bool", false) || !ENV_PROD) {
				var defaultLang = _.findWhere(data, {
					type : "language",
					selected : true
				}),
				    deviceLan = _.findWhere(data, {
					type : "language",
					code : Ti.Locale.currentLanguage
				});
				logger.debug(TAG, "client default language", defaultLang.code);
				if (_.isObject(deviceLan) && defaultLang.code != deviceLan.code) {
					logger.debug(TAG, "switch to device's default language", deviceLan.code);
					defaultLang.selected = false;
					deviceLan.selected = true;
				}
			}

			Res.setData(data, true);

			/**
			 *  update flag once data set is done
			 */
			utilities.setProperty(Alloy.CFG.resources_updated_on, Ti.App.version);
		}
	},

	setData : function(data, useLocalResources) {

		var mightRequireReload = false;

		_.each(data, function(obj) {

			if (_.has(obj, "platform") && _.indexOf(obj.platform, Alloy.CFG.platform) == -1) {
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
					if (obj.type == "font") {
						//font
						utilities.copyFile(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Res.dataDirectory + "/" + srcFile), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.dataDirectory + "/" + desFile), false);
					} else {
						//image
						Res.resizeImage(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.dataDirectory + "/" + desFile), Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, Res.dataDirectory + "/" + srcFile).read(), obj.properties);
					}
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
				logger.debug(TAG, "added", obj.type, obj.version, obj.code || "");
			} else if (obj.selected != document.selected || _.has(obj, "data")) {
				obj.update = !_.has(obj, "data") && !_.has(document, "data");
				obj.revert = obj.selected && obj.update;
				obj.selected = obj.revert ? false : obj.selected;
				_.extend(document, obj);
				logger.debug(TAG, "updated", document.type, document.version, document.code || "");
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
					mightRequireReload = true;
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

		return mightRequireReload;
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
		if (!Res.updateCallback) {
			if (Res.updateQueue.length) {
				Res.updateCallback = callback;
				_.each(Res.updateQueue, function(obj) {
					if (obj.type == "font" || obj.type == "image") {
						Res.downloadAsset(obj);
					} else {
						http.request({
							method : "appload_clientjson",
							params : {
								feature_code : "THXXX",
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
					logger.debug(TAG, "downloading", obj.type, obj.version, obj.code || "");
				});
			} else if (callback) {
				callback();
			}
		}
	},

	didUpdate : function(result, passthrough) {
		if ((_.has(result, "code") && result.code != Alloy.CFG.apiCodes.success) || (_.has(result, "success") && result.success === false)) {
			passthrough.error = true;
			logger.error(TAG, "unable to download", passthrough, "with error", result);
		} else {
			passthrough.error = false;
			logger.debug(TAG, "downloaded successfully", passthrough.type, passthrough.version, passthrough.code || "");
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
					if (asset.update === true) {
						var obj = _.pick(asset, ["type", "version", "base_version", "code", "url", "format", "properties"]);
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
			logger.debug(TAG, "downloaded successfully", passthrough.type, passthrough.version, passthrough.code || "");
			var desFile = passthrough.type + "_" + passthrough.code + "_" + passthrough.version + "." + passthrough.format;
			if (passthrough.type == "fonts") {
				//fonts
				utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.dataDirectory + "/" + desFile), result);
			} else {
				//images
				Res.resizeImage(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Res.dataDirectory + "/" + desFile), result, passthrough.properties);
			}
			var item = _.pick(passthrough, ["type", "version", "base_version", "code", "properties"]);
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
		if (Res.updateQueue.length === 0 && Res.updateCallback) {
			Res.updateCallback(Res.errorQueue);
			Res.updateCallback = null;
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

	resizeImage : function(desFile, blob, properties) {
		if (_.has(properties, "left") && _.has(properties, "right")) {
			properties.width = app.device.width - (utilities.percentageToValue(properties.left, app.device.width) + utilities.percentageToValue(properties.right, app.device.width));
			delete properties.left;
			delete properties.right;
		}
		if (_.has(properties, "top") && _.has(properties, "bottom")) {
			properties.height = app.device.height - (utilities.percentageToValue(properties.top, app.device.height) + utilities.percentageToValue(properties.bottom, app.device.height));
			delete properties.top;
			delete properties.bottom;
		}
		var newWidth = properties.width || 0,
		    newHeight = properties.height || 0;
		if (newWidth === 0 || newHeight === 0) {
			var imgWidth = blob.width,
			    imgHeight = blob.height;
			/**
			 * px to dp
			 * Note: Android returns
			 * height in px
			 */
			if (OS_ANDROID) {
				imgWidth /= app.device.logicalDensityFactor;
				imgHeight /= app.device.logicalDensityFactor;
			}
			if (newWidth === 0) {
				newHeight = utilities.percentageToValue(newHeight, app.device.height);
				newWidth = Math.floor((imgWidth / imgHeight) * newHeight);
			} else if (newHeight === 0) {
				newWidth = utilities.percentageToValue(newWidth, app.device.width);
				newHeight = Math.floor((imgHeight / imgWidth) * newWidth);
			}
			/**
			 * dp based values
			 * may be applied to ImageView
			 */
			_.extend(properties, {
				width : newWidth,
				height : newHeight
			});
		}
		/**
		 * converting dp to px
		 * for imageAsResized
		 * Note: done for both platforms
		 * as px from android converted to
		 * dp above
		 */
		newWidth *= app.device.logicalDensityFactor;
		newHeight *= app.device.logicalDensityFactor;
		//write resized image
		utilities.writeFile(desFile, blob.imageAsResized(newWidth, newHeight), false);
	}
};

module.exports = Res;
