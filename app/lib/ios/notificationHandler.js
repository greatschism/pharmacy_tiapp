var TAG = "notificationHandler",
    Alloy = require("alloy"),
    notificationPanel = require("notificationPanel"),
    logger = require("logger"),
    isIOS8 = checkVersion(8),
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
	if (deviceToken || Alloy.Globals.isVirtualDevice) {
		if (callback) {
			callback(deviceToken);
		}
		return true;
	}
	if (isBusy) {
		return logger.warn(TAG, "ignored initialization as one is already in progress");
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
	notificationPanel.show(e.data);
}

Object.defineProperty(module.exports, "deviceId", {
	get : function() {
		return Ti.App.installId;
	}
});

Object.defineProperty(module.exports, "deviceToken", {
	get : function() {
		return deviceToken;
	}
});

exports.init = init;

/**
 * On android calling init
 * requires GCM Project Id
 * which we get only after appload
 * but the callback can be assigned
 * without init. For iOS
 * we don't have any dependency from
 * server side to get device token
 * and we can assign callback only
 * when we register to token
 */
init();
