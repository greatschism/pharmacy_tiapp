var Alloy = require("alloy");

/**
 * Open maps for direction
 * @param {String|Object} source address query or latitude and longitude
 * @param {String|Object} destination address query or latitude and longitude
 * @param {String} mode direction mode
 */
exports.getDirection = function(_source, _destination, _mode) {

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
};

/**
 * create table view section
 */
exports.createTableViewSection = function(_ctrl, _title, _footerView) {
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
	dict = {
		headerView : headerView
	};
	if (_footerView) {
		_.extend(dict, {
			footerView : _footerView
		});
	}
	return Ti.UI.createTableViewSection(dict);
};
