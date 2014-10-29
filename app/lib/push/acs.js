/**
 * ACS push notification class
 * 
 * @class push.acs
 * @uses core
 * @uses push
 * @uses Modules.ti.cloudpush
 */
var app = require("core");
var push = require("push");

if(OS_ANDROID) {
	var CloudPush = require('ti.cloudpush');

	/**
	 * Registers an Android device for push notifications
	 * @param {Function} _callback The function to run after registration is complete
	 * @platform Android
	 */
	var registerAndroid = function(_callback) {
		CloudPush.retrieveDeviceToken({
			success: function(_data) {
				app.log("debug", "ACS.registerAndroid @success");
				app.log("trace", _data.deviceToken);

				push.deviceToken = _data.deviceToken;

				Ti.App.Properties.setString("push_DEVICETOKEN", _data.deviceToken);

				CloudPush.addEventListener('callback', function(evt) {
					push.pushRecieved(evt);
					app.log(JSON.stringify(evt));
				});

				_callback();
			},
			error: function(_data) {
				app.log("debug", "ACS.registerAndroid @error");
				app.log("trace", JSON.stringify(_data));
			}
		});
	};
}

if(OS_IOS) {
	/**
	 * Registers an iOS device for push notifications
	 * @param {Function} _callback The function to run after registration is complete
	 * @platform iOS
	 */
	var registeriOS = function(_callback) {
		app.log("debug", "push.registeriOS");

		Ti.Network.registerForPushNotifications({
			types: [
                Ti.Network.NOTIFICATION_TYPE_BADGE,
                Ti.Network.NOTIFICATION_TYPE_ALERT,
                Ti.Network.NOTIFICATION_TYPE_SOUND
            ],
			success: function(_data) {
				app.log("debug", "ACS.registeriOS @success");
				app.log("trace", _data.deviceToken);

				push.deviceToken = _data.deviceToken;
				Ti.App.Properties.setString("push_DEVICETOKEN", _data.deviceToken);

				_callback();
			},
			error: function(_data) {
				app.log("debug", "ACS.registeriOS @error");
				app.log("trace", JSON.stringify(_data));
			},
			callback: function(_data) {
				push.pushRecieved(_data);

				app.log(JSON.stringify(_data));
			}
		});
	};
}

/**
 * Registers a device for push notifications
 * @param {Function} _callback The function to run after registration is complete
 */
exports.registerDevice = function(_callback) {
	app.log("debug", "ACS.registerDevice");

	if(OS_IOS) {
		registeriOS(_callback);
	} else if(OS_ANDROID) {
		registerAndroid(_callback);
	}
};