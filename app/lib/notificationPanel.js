var TAG = "NOPA",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    uihelper = require("uihelper"),
    payloads = [],
    active = false;

/**
 * when notification panel
 * is not active, keep it
 * on queue
 */
function show(payload) {
	if (active) {
		uihelper.showDialog({
			title : Alloy.Globals.strings.dialogTitleNotification,
			message : payload[ OS_IOS ? "alert" : "message"]
		});
	} else {
		payloads.push(payload);
	}
}

Object.defineProperty(module.exports, "active", {
	set : function(value) {
		active = value;
		/**
		 * once becomes active, fire
		 * the notifications if any
		 */
		if (payloads.length) {
			show(payloads.pop());
		}
	},
	get : function() {
		return active;
	}
});

exports.show = show;
