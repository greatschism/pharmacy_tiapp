var TAG = "notificationHandler",
    isIOS8 = checkVersion(8),
    logger = require("logger"),
    isBusy = false,
    deviceTokenCallback,
    deviceToken;

function checkVersion(thatVersion) {
	var version = Ti.Platform.version.split("."),
	    major = parseInt(version[0], 10);
	if (major >= thatVersion) {
		return true;
	}
	return false;
}

function init(callback) {
	if (isBusy) {
		return logger.warn(TAG, "ignored initialization as one is already in progress");
	}
	if (deviceToken || Alloy.Globals.isVirtualDevice) {
		if (callback) {
			callback(deviceToken);
		}
		return true;
	}
	isBusy = true;
	deviceTokenCallback = callback;
	if (isIOS8) {
		Ti.App.iOS.addEventListener("usernotificationsettings", didUsernotificationsettings);
		Ti.App.iOS.registerUserNotificationSettings({
			types : [Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND, Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE]
		});
	} else {
		Ti.Network.registerForPushNotifications({
			types : [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND],
			success : didSuccess,
			error : didFailure,
			callback : didReceivePush
		});
	}
}

function didUsernotificationsettings() {
	Ti.Network.registerForPushNotifications({
		success : didSuccess,
		error : didFailure,
		callback : didReceivePush
	});
	Ti.App.iOS.removeEventListener("usernotificationsettings", didUsernotificationsettings);
}

function didSuccess(e) {
	deviceToken = e.deviceToken;
	triggerCallback();
	isBusy = false;
}

function didFailure(e) {
	logger.error(TAG, e);
	triggerCallback();
	isBusy = false;
}

function triggerCallback() {
	if (deviceTokenCallback) {
		deviceTokenCallback(deviceToken);
		deviceTokenCallback = null;
	}
}

function didReceivePush(e) {
	var payload = e.data;
}

Object.defineProperty(module.exports, "deviceToken", {
	get : function() {
		return deviceToken;
	}
});

exports.init = init;
