var TAG = "NOHA",
    Alloy = require("alloy"),
    notificationPanel = require("notificationPanel"),
    logger = require("logger"),
    isVirtualDevice = Ti.Platform.model === "Simulator",
    isIOS8 = checkVersion(8),
    isBusy = false,
    deviceToken,
    deviceTokenCallback;

//return a default token on virutal device
if (isVirtualDevice) {
	deviceToken = "89bf96e7496498742cce9c45dd994c7e61e10df87169564590e10060078f5136";
}

function checkVersion(thatVersion) {
	var version = Ti.Platform.version.split("."),
	    major = parseInt(version[0], 10);
	if (major >= thatVersion) {
		return true;
	}
	return false;
}

function init(callback) {
	if (deviceToken || isVirtualDevice) {
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

function didUsernotificationsettings(e) {
	if (e.types.length) {
		Ti.Network.registerForPushNotifications({
			success : didSuccess,
			error : didFailure,
			callback : didReceivePush
		});
	} else {
		logger.error(TAG, "user declined permission for push notification");
		triggerCallback();
		isBusy = false;
	}
	Ti.App.iOS.removeEventListener("usernotificationsettings", didUsernotificationsettings);
}

function didSuccess(e) {
	deviceToken = e.deviceToken;
	triggerCallback();
	isBusy = false;
}

function didFailure(e) {
	logger.error(TAG, "unable to get remove device uuid");
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

Object.defineProperty(exports, "deviceId", {
	get : function() {
		return Ti.App.installId;
	}
});

Object.defineProperty(exports, "deviceToken", {
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
 * when we call register
 */
if (Ti.Network.remoteDeviceUUID) {
	init();
}
