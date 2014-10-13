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
 * @param {String} _params.cancel cancel index of alert box
 * @param {String} _params.ok ok text of alert box
 * @param {View} _params.androidView androidView of alert box
 * @param {Function} _params.success callback, if any button is clicked other than cancel
 * @param {Function} _params.cancel callback for cancel button
 */

exports.show = function(_params) {
	var dict = {
		title : _params.title || Ti.App.name,
		message : _params.message || ""
	};
	if (_.has(_params, "buttonNames")) {
		_.extend(dict, {
			buttonNames : _params.buttonNames,
			cancel : _params.cancel || -1
		});
	} else {
		_.extend(dict, {
			ok : _params.ok || "OK"
		});
	}
	if (OS_ANDROID && _.has(_params, "androidView")) {
		dialog.androidView = _params.androidView;
	}
	var dialog = Ti.UI.createAlertDialog(dict);
	dialog.addEventListener("click", function(e) {
		var cancel = e.source.cancel;
		if (_params.success && e.index != cancel) {
			_params.success(e.index);
		} else if (_params.cancel && e.index == cancel) {
			_params.cancel();
		}
	});
	dialog.show();
};
