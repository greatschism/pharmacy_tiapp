var TAG = "uihelper",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    config = require("config"),
    utilities = require("utilities"),
    logger = require("logger"),
    moment = require("alloy/moment");

var Helper = {

	currentLocation : {},

	/**
	 * force accessibility system to focus a view when there is a major change on UI
	 * Note : Supported only on custom SDK.
	 * @param {View} view to focus
	 */
	requestViewFocus : function(view) {
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_SCREEN_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITYview_FOCUS_CHANGED, view);
		}
	},

	/**
	 * force accessibility system to focus a view when there is a layout change on window
	 * Note : Supported only on custom SDK.
	 * @param {View} view to focus
	 */
	requestAccessibilityFocus : function(view) {
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_FOCUS_CHANGED, view);
		}
	},

	/**
	 * Accessibility system announcement
	 * @param {String} str for announcement
	 */
	requestAnnouncement : function(str) {
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent(Ti.App.EVENT_ACCESSIBILITY_ANNOUNCEMENT, str);
		}
	},

	/**
	 * Get current location of user
	 * @param {Function} callback
	 * @param {Boolean} forceUpdate
	 */
	getLocation : function(callback, forceUpdate) {

		if (forceUpdate !== true && !_.isEmpty(Helper.currentLocation) && moment().diff(Helper.currentLocation.timestamp) < Alloy.CFG.location_timeout) {
			Helper.fireLocationCallback(callback, Helper.currentLocation);
			return;
		}

		var authorization = Ti.Geolocation.locationServicesAuthorization || "";
		if (authorization == Ti.Geolocation.AUTHORIZATION_DENIED) {
			Helper.showDialog({
				message : Alloy.Globals.strings.msgGeoAuthorizationDenied
			});
			Helper.fireLocationCallback(callback);
		} else if (authorization == Ti.Geolocation.AUTHORIZATION_RESTRICTED) {
			Helper.showDialog({
				message : Alloy.Globals.strings.msgGeoAuthorizationRestricted
			});
			Helper.fireLocationCallback(callback);
		} else {
			Ti.Geolocation.getCurrentPosition(function(e) {
				Helper.fireLocationCallback(callback, e.success && !_.isEmpty(e.coords) ? e.coords : {});
			});
		}
	},

	fireLocationCallback : function(callback, coords) {
		Helper.currentLocation = coords ? coords : {};
		if (_.isFunction(callback)) {
			callback(Helper.currentLocation);
		}
	},

	/**
	 * Open maps for direction
	 * @param {String|Object} destination address query or latitude and longitude
	 * @param {String|Object} source address query or latitude and longitude
	 * @param {String} mode direction mode
	 */
	getDirection : function(destination, source, mode) {

		if (_.isObject(destination)) {
			destination = destination.latitude + "," + destination.longitude;
		}

		if (_.isUndefined(source)) {
			source = _currentLocation;
		}

		if (_.isObject(source)) {
			source = source.latitude + "," + source.longitude;
		}

		var params = "?saddr=" + source + "&daddr=" + destination + "&directionsmode=" + (mode || "transit");

		if (OS_IOS) {

			var optDialog = Alloy.createWidget("ti.optiondialog", "widget", {
				options : [Alloy.Globals.strings.strGoogle, Alloy.Globals.strings.strApple, Alloy.Globals.strings.strCancel],
				cancel : 2
			});
			optDialog.on("click", function didClick(evt) {
				if (!evt.cancel) {
					var baseUrl;
					switch(evt.index) {
					case 0:
						baseUrl = Ti.Platform.canOpenURL("comgooglemaps://") ? "comgooglemaps://" : "http://maps.google.com/maps";
						break;
					case 1:
						baseUrl = "http://maps.apple.com/";
						break;
					}
					Ti.Platform.openURL(baseUrl + params);
				}
				optDialog.off("click", didClick);
				optDialog.destroy();
				optDialog = null;
			});
			optDialog.show();

		} else {

			Ti.Platform.openURL("http://maps.google.com/maps" + params);

		}
	},

	/**
	 * Open phone's dialer
	 * @param {String} str number to be dialed
	 */
	showDialer : function(str) {
		Ti.Platform.openURL("tel:" + str);
	},

	/*
	 * Standard AlertDialog
	 * @param {Object} params The arguments for the method
	 * @param {String} params.title title of alert box
	 * @param {String} params.message message of alert box
	 * @param {String[]} params.buttonNames buttonNames of alert box
	 * @param {String} params.cancelIndex cancel index of alert box
	 * @param {String} params.ok ok text of alert box
	 * @param {View} params.androidView androidView of alert box
	 * @param {Function} params.success callback, if any button is clicked other than cancel
	 * @param {Function} params.cancel callback for cancel button
	 */
	showDialog : function(params) {
		var dict = {
			title : params.title || Ti.App.name,
			persistent : _.isUndefined(params.persistent) ? true : params.persistent
		};
		if (_.has(params, "buttonNames")) {
			_.extend(dict, {
				buttonNames : params.buttonNames,
				cancel : params.cancelIndex || -1
			});
		} else {
			_.extend(dict, {
				ok : params.ok || Alloy.Globals.strings.strOK
			});
		}
		if (OS_IOS && _.has(params, "style")) {
			dict.style = params.style;
		}
		if (OS_ANDROID && _.has(params, "androidView")) {
			dict.androidView = params.androidView;
		} else {
			dict.message = ( OS_IOS ? "\n" : "").concat(params.message || "");
		}
		var dialog = Ti.UI.createAlertDialog(dict);
		dialog.addEventListener("click", function(e) {
			var cancel = params.cancelIndex || -1;
			if (params.success && e.index !== cancel) {
				params.success(e.index, e);
			} else if (params.cancel && e.index === cancel) {
				params.cancel();
			}
		});
		dialog.show();
	},

	/**
	 * Open email dialog
	 * @param {Object} o options
	 */
	showEmailDialog : function(o) {
		Ti.UI.createEmailDialog(o).open();
	},

	/**
	 * get aspect ratio of image
	 * @param {String} name
	 * @param {ImageView} where image to be applied (optional)
	 */
	getImage : function(name, imgView) {
		if (!Alloy.Images[name]) {
			logger.error(TAG, "invalid image name", name);
			return {};
		}
		var properties = Alloy.Images[name][app.device.orientation],
		    path = properties.image,
		    newWidth = properties.width || 0,
		    newHeight = properties.height || 0;
		if (newWidth == 0 || newHeight == 0) {
			var newProperties = _.pick(properties, ["top", "bottom", "left", "right", "width", "height"]);
			if (_.has(newProperties, "left") && _.has(newProperties, "right")) {
				newProperties.left = utilities.percentageToValue(properties.left, app.device.width);
				newProperties.right = utilities.percentageToValue(properties.right, app.device.width);
				newWidth = app.device.width - (newProperties.left + newProperties.right);
			}
			//image's width and height are density independent
			var imgBlob = Ti.Filesystem.getFile(path).read(),
			    imgWidth = imgBlob.width,
			    imgHeight = imgBlob.height;
			imgBlob = null;
			if (OS_ANDROID) {
				imgWidth /= app.device.logicalDensityFactor;
				imgHeight /= app.device.logicalDensityFactor;
			}
			if (newWidth == 0) {
				newHeight = utilities.percentageToValue(newHeight, app.device.height);
				newWidth = Math.floor((imgWidth / imgHeight) * newHeight);
			} else if (newHeight == 0) {
				newWidth = utilities.percentageToValue(newWidth, app.device.width);
				newHeight = Math.floor((imgHeight / imgWidth) * newWidth);
			}
			_.extend(newProperties, {
				width : newWidth,
				height : newHeight
			});
			config.updateImageProperties({
				name : name,
				data : utilities.getFileName(path),
				orientation : app.device.orientation,
				properties : newProperties
			});
		}
		if (imgView) {
			imgView.applyProperties(properties);
		}
		return properties;
	},

	/**
	 * create table view section
	 * @param {Controller} ctrl controller object
	 * @param {String} title section header's title
	 * @param {View} footerView (optional)
	 * @param {View} customView (optional) - will be added to header view
	 * @param {Object} headerProperties (optional) - will be applied on header view
	 */
	createTableViewSection : function(ctrl, title, footerView, customView, headerProperties) {
		/**
		 * http://developer.appcelerator.com/question/145117/wrong-height-in-the-headerview-of-a-tableviewsection
		 */
		var dict,
		    headerView = ctrl.UI.create("View", {
			apiName : "View",
			classes : ["section-header-view"]
		}),
		    lbl = ctrl.UI.create("Label", {
			apiName : "Label",
			classes : ["section-header-lbl"]
		});
		lbl.text = title;
		headerView.add(lbl);
		if (headerProperties) {
			headerView.applyProperties(headerProperties);
		}
		if (customView) {
			headerView.add(customView);
		}
		dict = {
			headerView : headerView
		};
		if (footerView) {
			_.extend(dict, {
				footerView : footerView
			});
		}
		return Ti.UI.createTableViewSection(dict);
	}
};

module.exports = Helper;
