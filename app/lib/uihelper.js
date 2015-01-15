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
exports.createTableViewSection = function(_options, _footerView) {
	/**
	 * http://developer.appcelerator.com/question/145117/wrong-height-in-the-headerview-of-a-tableviewsection
	 */
	var dict,
	    headerView = Ti.UI.createView({
		backgroundColor : Alloy._bg_quinary,
		height : 30
	}),
	    lbl = Ti.UI.createLabel({
		text : _options.title,
		left : Alloy._m_left,
		right : Alloy._m_right,
		color : Alloy._fg_secondary,
		font : Alloy._typo_h4
	});
	if (OS_IOS) {
		lbl.height = Alloy._typo_height_h4;
	}
	if (_.has(_options, "icon")) {
		headerView.layout = "horizontal";
		lbl.left = Alloy._p_left;
		headerView.add(Ti.UI.createLabel({
			height : Ti.UI.FILL,
			text : _options.icon,
			left : Alloy._m_left,
			color : _options.color || Alloy._fg_secondary,
			font : {
				fontFamily : "mscripts",
				fontSize : 24
			}
		}));
	}
	headerView.add(lbl);
	dict = {
		headerView : headerView
	};
	if (_footerView) {
		dict.footerView = _footerView;
	}
	return Ti.UI.createTableViewSection(dict);
};
