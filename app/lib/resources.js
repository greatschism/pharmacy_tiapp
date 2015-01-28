var utilities = require("utilities"),
    scule = require("com.scule"),
    http = require("http"),
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

			var clientData = JSON.parse(utilities.getFile(Resources.directoryData + "/client.json"));

			//theme
			Resources.set("theme", clientData.theme);

			//menu
			Resources.set("menu", clientData.menu);

			//template
			Resources.set("template", clientData.template);

			//languages
			Resources.set("languages", clientData.languages.items, true, true);

			//fonts
			Resources.set("fonts", clientData.fonts.items, true, true);

			//images
			Resources.set("images", clientData.images.items, true, true);

			Ti.App.Properties.setString("updatedResourcesOn", Ti.App.version);

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
		case "images":
			path = Resources.pathImages;
			break;
		}
		return scule.factoryCollection(path);
	},

	setLanguages : function(_lItems, _clearNSup, _useLocalResources) {
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
				//if _useLocalResources is false, don't use local resources packed up with this build
				_.extend(lItem, {
					strings : JSON.parse(_useLocalResources === true ? utilities.getFile(Resources.directoryLanguages + "/" + lItem.code + ".json") || "{}" : "{}"),
					update : _useLocalResources !== true
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
		// if _clearNSup is true, remove unsupported languages
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

	setFonts : function(_fItems, _clearNSup, _useLocalResources) {
		var fColl = Resources.getCollection("fonts"),
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
		for (var i in _fItems) {
			var fItem = _fItems[i];
			if (_.indexOf(fItem.platform, platform) >= 0) {
				var fModel = fColl.find({
				name: fItem.name
				})[0] || {};
				if (_.isEmpty(fModel)) {
					//if _useLocalResources is false, don't use local resources packed up with this build
					if ((OS_IOS || OS_ANDROID) && _useLocalResources === true) {
						var path = Resources.directoryFonts + "/" + fItem.name;
						utilities.copy(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, path), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path + "." + fItem.format));
					}
					_.extend(fItem, {
						update : _useLocalResources !== true
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
		// if _clearNSup is true, remove unsupported or unused fonts
		if (_clearNSup !== false) {
			var supported = _.pluck(fColl.findAll(), "name");
			logger.i("fonts supported : " + supported);
			//delete unsupported font files
			for (var i in fontFiles) {
				if (_.indexOf(supported, utilities.getBaseFileName(fontFiles[i])) == -1) {
					utilities.deleteFile(Resources.directoryFonts + "/" + fontFiles[i]);
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

	setImages : function(_iItems, _clearNSup, _useLocalResources) {
		var iColl = Resources.getCollection("images"),
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
		for (var i in _iItems) {
			var iItem = _iItems[i];
			var iModel = iColl.find({
			name: iItem.name
			})[0] || {};
			if (_.isEmpty(iModel)) {
				//if _useLocalResources is false, don't use local resources packed up with this build
				if ((OS_IOS || OS_ANDROID) && _useLocalResources === true) {
					var path = Resources.directoryImages + "/" + iItem.name;
					utilities.copy(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, path), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path + "." + iItem.format));
				}
				_.extend(iItem, {
					update : _useLocalResources !== true
				});
				iColl.save(iItem);
			} else {
				if (iItem.version > iModel.version) {
					iModel = _.omit(iModel, ["_id"]);
					_.extend(iItem, {
						update : true
					});
					_.extend(iModel, iItem);
					iColl.update({
						code : iItem.name
					}, {
						$set : iItem
					}, {}, true);
				}
			}
		}
		// if _clearNSup is true, remove unsupported or unused images
		if (_clearNSup !== false) {
			var supported = _.pluck(iColl.findAll(), "name");
			logger.i("images supported : " + supported);
			//delete unsupported image files
			for (var i in imageFiles) {
				if (_.indexOf(supported, utilities.getBaseFileName(imageFiles[i])) == -1) {
					utilities.deleteFile(Resources.directoryImages + "/" + imageFiles[i]);
				}
			}
			var removed = iColl.remove({
				name : {
					$nin : supported
				}
			});
			logger.i("images removed : " + removed);
		}
		iColl.commit();
	},

	set : function(_key, _data, _clearNSup, _useLocalResources) {
		switch(_key) {
		case "languages":
			Resources.setLanguages(_data, _clearNSup, _useLocalResources);
			break;
		case "fonts":
			Resources.setFonts(_data, _clearNSup, _useLocalResources);
			break;
		case "images":
			Resources.setImages(_data, _clearNSup, _useLocalResources);
			break;
		default:
			var coll = Resources.getCollection(_key);
			coll.clear();
			coll.save(_data);
			coll.commit();
		}
	},

	get : function(_key) {
		var data = Resources.getCollection(_key).findAll();
		if (_key == "languages" || _key == "fonts" || _key == "images") {
			return data;
		} else {
			return data[0] || {};
		}
	},

	checkForUpdates : function() {
		//update all fonts and selected language where update flag is true
		var langsToUpdate = Resources.getCollection("languages").find({
			selected : true,
			update : true
		}),
		    fontsToUpdate = Resources.getCollection("fonts").find({
			update : true
		}),
		    imagesToUpdate = Resources.getCollection("images").find({
			update : true
		});
		if (langsToUpdate.length) {
			Resources.updateQueue.push({
				key : "languages",
				data : _.omit(langsToUpdate[0], ["_id", "strings"])
			});
		}
		for (var i in fontsToUpdate) {
			Resources.updateQueue.push({
				key : "fonts",
				data : _.omit(fontsToUpdate[i], ["_id"])
			});
		}
		for (var i in imagesToUpdate) {
			Resources.updateQueue.push({
				key : "images",
				data : _.omit(imagesToUpdate[i], ["_id"])
			});
		}
		return Resources.updateQueue.length;
	},

	update : function(_callback) {
		var updateQueue = Resources.updateQueue;
		if (updateQueue.length) {
			Resources.successCallback = _callback;
			for (var i in updateQueue) {
				var queue = updateQueue[i];
				http.request({
					url : queue.data.url,
					type : "GET",
					format : queue.key == "languages" ? "JSON" : "DATA",
					passthrough : queue,
					success : Resources.didUpdate,
					failure : Resources.didUpdate
				});
				logger.i("downloading " + queue.key + " from " + queue.data.url);
			}
		} else if (_callback) {
			_callback();
		}
	},

	didUpdate : function(_data, _url, _passthrough) {
		if (_data) {
			//reset update flag
			var coll = Resources.getCollection(_passthrough.key),
			    queryObj = {
				update : true
			},
			    set = {
				update : false
			},
			    key = _passthrough.key,
			    prop;
			switch(key) {
			case "languages":
				prop = "code";
				//append language strings
				_.extend(set, {
					strings : _data
				});
				break;
			case "fonts":
				//replace / add font file
				prop = "name";
				Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryFonts + "/" + _passthrough.data.name + "." + _passthrough.data.format).write(_data);
				logger.i("font updated :" + _passthrough.data.name);
				break;
			case "images":
				//replace / add image file
				prop = "name";
				Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Resources.directoryImages + "/" + _passthrough.data.name + "." + _passthrough.data.format).write(_data);
				logger.i("image updated :" + _passthrough.data.name);
				break;
			}
			queryObj[prop] = _passthrough.data[prop];
			coll.update(queryObj, {
				$set : set
			});
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
		}
	}
};

module.exports = Resources;
