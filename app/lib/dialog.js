/**
 * AlertDialog class
 *
 * @class dialog
 */

/**
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

exports.show = function(_params) {
	var dict = {
		title : _params.title || Ti.App.name,
		persistent : _params.persistent || false
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
};
