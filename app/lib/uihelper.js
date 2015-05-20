var Alloy = require("alloy"),
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
	 * @param {View} _view to focus
	 */
	requestViewFocus : function(_view) {
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_SCREEN_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, _view);
		}
	},

	/**
	 * force accessibility system to focus a view when there is a layout change on window
	 * Note : Supported only on custom SDK.
	 * @param {View} _view to focus
	 */
	requestAccessibilityFocus : function(_view) {
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_FOCUS_CHANGED, _view);
		}
	},

	/**
	 * Accessibility system announcement
	 * @param {String} _str for announcement
	 */
	requestAnnouncement : function(_str) {
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent(Ti.App.EVENT_ACCESSIBILITY_ANNOUNCEMENT, _str);
		}
	},

	/**
	 * Get current location of user
	 * @param {Function} _callback
	 * @param {Boolean} _forceUpdate
	 */
	getLocation : function(_callback, _forceUpdate) {

		if (_forceUpdate !== true && !_.isEmpty(Helper.currentLocation) && moment().diff(Helper.currentLocation.timestamp, "minutes") < Alloy.CFG.LOCATION_TIMEOUT) {
			Helper.fireLocationCallback(_callback, Helper.currentLocation);
			return;
		}

		var authorization = Titanium.Geolocation.locationServicesAuthorization || "";
		if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
			Helper.showDialog({
				message : Alloy.Globals.strings.msgGeoAuthorizationDenied
			});
			Helper.fireLocationCallback(_callback);
		} else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
			Helper.showDialog({
				message : Alloy.Globals.strings.msgGeoAuthorizationRestricted
			});
			Helper.fireLocationCallback(_callback);
		} else {
			Ti.Geolocation.getCurrentPosition(function(e) {
				Helper.fireLocationCallback(_callback, e.success && !_.isEmpty(e.coords) ? e.coords : {});
			});
		}
	},

	fireLocationCallback : function(_callback, _coords) {
		Helper.currentLocation = _coords ? _coords : {};
		if (_.isFunction(_callback)) {
			_callback(Helper.currentLocation);
		}
	},

	/**
	 * Open maps for direction
	 * @param {String|Object} destination address query or latitude and longitude
	 * @param {String|Object} source address query or latitude and longitude
	 * @param {String} mode direction mode
	 */
	getDirection : function(_destination, _source, _mode) {

		if (_.isObject(_destination)) {
			_destination = _destination.latitude + "," + _destination.longitude;
		}

		if (_.isUndefined(_source)) {
			Helper.getLocation(function(_currentLocation) {
				Helper.getDirection(_destination, _currentLocation, _mode);
			});
			return;
		} else {
			if (_.isEmpty(_source)) {
				_source = "";
			} else {
				_source = _source.latitude + "," + _source.longitude;
			}
		}

		var params = "?saddr=" + _source + "&daddr=" + _destination + "&directionsmode=" + (_mode || "transit");

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
	 * @param {String} _str number to be dialed
	 */
	showDialer : function(_str) {
		Ti.Platform.openURL("tel:" + _str);
	},

	/*
	 * Standard AlertDialog
	 * @param {Object} _params The arguments for the method
	 * @param {String} _params.title title of alert box
	 * @param {String} _params.message message of alert box
	 * @param {String[]} _params.buttonNames buttonNames of alert box
	 * @param {String} _params.cancelIndex cancel index of alert box
	 * @param {String} _params.ok ok text of alert box
	 * @param {View} _params.androidView androidView of alert box
	 * @param {Function} _params.success callback, if any button is clicked other than cancel
	 * @param {Function} _params.cancel callback for cancel button
	 */
	showDialog : function(_params) {
		var dict = {
			title : _params.title || Ti.App.name,
			persistent : _.isUndefined(_params.persistent) ? true : _params.persistent
		};
		if (_.has(_params, "buttonNames")) {
			_.extend(dict, {
				buttonNames : _params.buttonNames,
				cancel : _params.cancelIndex || -1
			});
		} else {
			_.extend(dict, {
				ok : _params.ok || Alloy.Globals.strings.strOK
			});
		}
		if (OS_IOS && _.has(_params, "style")) {
			dict.style = _params.style;
		}
		if (OS_ANDROID && _.has(_params, "androidView")) {
			dict.androidView = _params.androidView;
		} else {
			dict.message = ( OS_IOS ? "\n" : "").concat(_params.message || "");
		}
		var dialog = Ti.UI.createAlertDialog(dict);
		dialog.addEventListener("click", function(e) {
			var cancel = _params.cancelIndex || -1;
			if (_params.success && e.index !== cancel) {
				_params.success(e.index, e);
			} else if (_params.cancel && e.index === cancel) {
				_params.cancel();
			}
		});
		dialog.show();
	},

	/**
	 * Open email dialog
	 * @param {Object} _o options
	 */
	showEmailDialog : function(_o) {
		Ti.UI.createEmailDialog(_o).open();
	},

	/**
	 * resize image
	 * @param {Object/ImageView} _o
	 */
	getImage : function(_code, _imgView) {
		if (!Alloy.Images[_code]) {
			logger.error("invalid image code : " + _code);
			return {};
		}
		var properties = Alloy.Images[_code][app.device.orientation],
		    path = properties.image,
		    newWidth = properties.width || 0,
		    newHeight = properties.height || 0,
		    newProperties = _.clone(properties);
		if (newWidth == 0 || newHeight == 0) {
			if (_.has(properties, "left") && _.has(properties, "right")) {
				properties.left = utilities.percentageToValue(properties.left, app.device.width);
				properties.right = utilities.percentageToValue(properties.right, app.device.width);
				newWidth = app.device.width - (properties.left + properties.right);
				_.extend(newProperties, {
					left : properties.left,
					right : properties.right
				});
			}
			//image's width and height are density independent
			var imgBlob = Ti.Filesystem.getFile(path).read(),
			    imgWidth = imgBlob.width,
			    imgHeight = imgBlob.height;
			imgBlob = null;
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
				code : _code,
				file : utilities.getFileName(path),
				orientation : app.device.orientation,
				properties : newProperties
			});
		}
		if (_imgView) {
			_imgView.applyProperties(properties);
		}
		return properties;
	},

	/**
	 * create table view section
	 * @param {Controller} _ctrl controller object
	 * @param {String} _title section header's title
	 * @param {View} _footerView (optional)
	 * @param {View} _customView (optional) - will be added to header view
	 * @param {Object} _headerProperties (optional) - will be applied on header view
	 */
	createTableViewSection : function(_ctrl, _title, _footerView, _customView, _headerProperties) {
		/**
		 * http://developer.appcelerator.com/question/145117/wrong-height-in-the-headerview-of-a-tableviewsection
		 */
		var dict,
		    headerView = _ctrl.UI.create("View", {
			apiName : "View",
			classes : ["section-header-view"]
		}),
		    lbl = _ctrl.UI.create("Label", {
			apiName : "Label",
			classes : ["section-header-lbl"]
		});
		lbl.text = _title;
		headerView.add(lbl);
		if (_headerProperties) {
			headerView.applyProperties(_headerProperties);
		}
		if (_customView) {
			headerView.add(_customView);
		}
		dict = {
			headerView : headerView
		};
		if (_footerView) {
			_.extend(dict, {
				footerView : _footerView
			});
		}
		return Ti.UI.createTableViewSection(dict);
	}
};

module.exports = Helper;
