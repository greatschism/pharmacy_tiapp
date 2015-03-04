var app = require("core"),
    config = require("config"),
    utilities = require("utilities");

var UIHelper = {

	/**
	 * Open maps for direction
	 * @param {String|Object} source address query or latitude and longitude
	 * @param {String|Object} destination address query or latitude and longitude
	 * @param {String} mode direction mode
	 */
	getDirection : function(_source, _destination, _mode) {

		if (_.isObject(_source)) {
			_source = _source.latitude + "," + _source.longitude;
		}

		if (_.isObject(_destination)) {
			_destination = _destination.latitude + "," + _destination.longitude;
		}

		var params = "?saddr=" + _source + "&daddr=" + _destination + "&directionsmode=" + (_mode || "transit");
		if (OS_IOS && Ti.Platform.canOpenURL("comgooglemaps://")) {
			Ti.Platform.openURL("comgooglemaps://".concat(params));
		} else {
			var url = "http://maps.google.com/maps".concat(params);
			if (OS_MOBILEWEB) {
				//Ti.Platform.openURL will not open new window on Mobile Web
				window && window.open(url);
			} else {
				Ti.Platform.openURL(url);
			}
		}
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
	},

	/**
	 * resize image
	 * @param {Object/ImageView} _o
	 */
	getImage : function(_o) {
		var properties = Alloy.Images[_o.code][app.device.orientation],
		    path = properties.image,
		    newWidth = properties.width || 0,
		    newHeight = properties.height || 0,
		    newProperties = {};
		if (newWidth == 0 || newHeight == 0) {
			if (_.has(properties, "left") && _.has(properties, "right")) {
				properties.left = utilities.percentageToValue(properties.left, app.device.width);
				properties.right = utilities.percentageToValue(properties.right, app.device.width);
				newWidth = app.device.width - (properties.left + properties.right);
				newProperties = {
					left : properties.left,
					right : properties.right
				};
			}
			if (OS_MOBILEWEB) {
				if (newWidth == 0) {
					properties.width = "auto";
				} else if (newHeight == 0) {
					properties.height = "auto";
				}
			} else {
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
					code : _o.code,
					file : utilities.getFileName(path),
					orientation : app.device.orientation,
					properties : newProperties
				});
			}
		}
		if (_o.apiName == "Ti.UI.ImageView") {
			_o.applyProperties(properties);
		}
		return properties;
	}
};

module.exports = UIHelper;
