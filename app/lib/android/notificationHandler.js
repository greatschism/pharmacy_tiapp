var TAG = "NOHA",
    Alloy = require("alloy"),
    notificationPanel = require("notificationPanel"),
    TiPush = require("ti.push"),
    logger = require("logger"),
    isVirtualDevice = Ti.Platform.model.indexOf("sdk") !== -1,
    isBusy = false,
    deviceToken,
    deviceTokenCallback;

//return a default token on virutal device
if (isVirtualDevice) {
	deviceToken = "dpaQ1cP16SQ:APA91bGx1dD9KvAcafGKg5BaTNYg3m0iTyNj6C95LX8nJvLC2OgSE7rRmbRVC9FbqPl7IF4ExFgxWwWcNBWSYYy6CaMWVDRalU-ifmHs6Ma1qJosTvfL8Ubwou0CsIVpK0HRxNm8Fufk";
}

TiPush.addEventListener("callback", didReceivePush);

function init(callback) {
	if (deviceToken || !isGooglePlayServicesAvailable() || isVirtualDevice) {
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
	TiPush.retrieveDeviceToken({
		senderId : Alloy.Models.appload.get("gcmproject_id"),
		success : didSuccess,
		error : didFailure
	});
}

function isGooglePlayServicesAvailable() {
	var isAvailable = TiPush.isGooglePlayServicesAvailable(),
	    success = false;
	switch(isAvailable) {
	case TiPush.SUCCESS:
		success = true;
		break;
	case TiPush.SERVICE_DISABLED:
		logger.error(TAG, "Google Play Service is disabled");
		break;
	case TiPush.SERVICE_INVALID:
		logger.error(TAG, "Google Play Service is invalid");
		break;
	case TiPush.SERVICE_MISSING:
		logger.error(TAG, "Google Play Service is missing");
		break;
	case TiPush.SERVICE_VERSION_UPDATE_REQUIRED:
		logger.error(TAG, "Google Play Service requires an update");
		break;
	}
	return success;
}

function didSuccess(e) {
	deviceToken = e.deviceToken;
	triggerCallback();
	isBusy = false;
}

function didFailure(e) {
	logger.error(TAG, "unable to get gcm device token");
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
	notificationPanel.show(JSON.parse(e.payload));
}

Object.defineProperty(exports, "deviceId", {
	get : function() {
		return TiPush.deviceId;
	}
});

Object.defineProperty(exports, "deviceToken", {
	get : function() {
		return deviceToken;
	}
});

exports.init = init;
