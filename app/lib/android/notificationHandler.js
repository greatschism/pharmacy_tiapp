var TAG = "notificationHandler",
    Alloy = require("alloy"),
    TiPush = require("ti.push"),
    logger = require("logger"),
    isBusy = false,
    deviceTokenCallback,
    deviceToken;

//TiPush.singleCallback = false;
//TiPush.addEventListener("callback", didReceivePush);

function init(callback) {
	if (isBusy) {
		return logger.warn(TAG, "ignored initialization as one is already in progress");
	}
	if (deviceToken || !isGooglePlayServicesAvailable() || Alloy.Globals.isVirtualDevice) {
		if (callback) {
			callback(deviceToken);
		}
		return true;
	}
	isBusy = true;
	deviceTokenCallback = callback;
	TiPush.retrieveDeviceToken({
		senderId : Alloy.CFG.gcm_sender_id,
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
	var payload = JSON.parse(e.payload);
}

Object.defineProperty(module.exports, "deviceToken", {
	get : function() {
		return deviceToken;
	}
});

exports.init = init;
