/*var TAG = "notificationHandler",
    CloudPush = require("ti.cloudpush"),
    logger = require("logger"),
    isBusy = false,
    deviceTokenCallback,
    deviceToken;

CloudPush.singleCallback = false;
CloudPush.addEventListener("callback", didReceivePush);

function init(callback) {
	if (isBusy) {
		return logger.warn(TAG, "ignored initialization as one is already in progress");
	}
	if ((deviceToken || !isGooglePlayServicesAvailable() || Alloy.Globals.isVirtualDevice) && _.isFunction(callback)) {
		return callback(deviceToken);
	}
	isBusy = true;
	deviceTokenCallback = callback;
	CloudPush.retrieveDeviceToken({
		success : didSuccess,
		error : didFailure
	});
}

function isGooglePlayServicesAvailable() {
	var isAvailable = CloudPush.isGooglePlayServicesAvailable(),
	    success = false;
	switch(isAvailable) {
	case CloudPush.SERVICE_DISABLED:
		logger.error(TAG, "Google Play Service is disabled");
		break;
	case CloudPush.SERVICE_INVALID:
		logger.error(TAG, "Google Play Service is invalid");
		break;
	case CloudPush.SERVICE_MISSING:
		logger.error(TAG, "Google Play Service is missing");
		break;
	case CloudPush.SERVICE_VERSION_UPDATE_REQUIRED:
		logger.error(TAG, "Google Play Service requires an update");
		break;
	default:
		success = true;
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
	if (_.isFunction(deviceTokenCallback)) {
		deviceTokenCallback(deviceToken);
		deviceTokenCallback = false;
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

exports.init = init;*/
