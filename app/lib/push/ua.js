/**
 * Urban Airship push notification class
 * 
 * @class push.ua
 * @uses core
 * @uses push
 * @uses Modules.ti.urbanairship
 */
var app = require("core");
var push = require("push");

/**
 * Sets up UrbanAirship push
 */
exports.init = function() {
	app.log("debug", "UA.init");

	var UA = require("ti.urbanairship");

	UA.options = {
		app_STORE_OR_AD_HOC_BUILD: true,
		PRODUCTION_app_KEY: app.Settings.notifications.key,
		PRODUCTION_app_SECRET: app.Settings.notifications.secret,
		LOGGING_ENABLED: false
	};

	Ti.Network.registerForPushNotifications({
		types: [
			Ti.Network.NOTIFICATION_TYPE_BADGE,
			Ti.Network.NOTIFICATION_TYPE_ALERT,
			Ti.Network.NOTIFICATION_TYPE_SOUND
		],
		/**
		 * Fired after we've registered the device
		 * @param {Object} _data UrbanAirship data object
		 */
		success: function(_data) {
			app.log("debug", "UA.init @success");
			app.log("trace", _data.deviceToken);

			push.deviceToken = _data.deviceToken;

			UA.registerDevice(push.deviceToken, {
				tags: [
					app.ID,
					app.Version,
					Ti.Platform.osname,
					Ti.Platform.locale
				]
			});
		},
		/**
		 * Fired on an error
		 * @param {Object} _data UrbanAirship data object
		 */
		error: function(_data) {
			app.log("debug", "UA.init @error");
			app.log("trace", JSON.stringify(_data));
		},
		/**
		 * Fired when a push notification is received
		 * @param {Object} _data UrbanAirship data object
		 */
		callback: function(_data) {
			app.log("debug", "UA.init @callback");
			app.log("trace", JSON.stringify(_data));

			push.pushRecieved(_data.data);

			if(_data.data.tab) {
				var tabIndex = parseInt(_data.data.tab, 10) - 1;

				if(app.Nodes[tabIndex]) {
					app.handleNavigation(tabIndex);
				}
			}
		}
	});
};