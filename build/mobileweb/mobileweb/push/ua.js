var APP = require("core");

var PUSH = require("push");

exports.init = function() {
    APP.log("debug", "UA.init");
    var UA = require("ti.urbanairship");
    UA.options = {
        APP_STORE_OR_AD_HOC_BUILD: true,
        PRODUCTION_APP_KEY: APP.Settings.notifications.key,
        PRODUCTION_APP_SECRET: APP.Settings.notifications.secret,
        LOGGING_ENABLED: false
    };
    Ti.Network.registerForPushNotifications({
        types: [ Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND ],
        success: function(_data) {
            APP.log("debug", "UA.init @success");
            APP.log("trace", _data.deviceToken);
            PUSH.deviceToken = _data.deviceToken;
            UA.registerDevice(PUSH.deviceToken, {
                tags: [ APP.ID, APP.Version, "mobileweb", Ti.Platform.locale ]
            });
        },
        error: function(_data) {
            APP.log("debug", "UA.init @error");
            APP.log("trace", JSON.stringify(_data));
        },
        callback: function(_data) {
            APP.log("debug", "UA.init @callback");
            APP.log("trace", JSON.stringify(_data));
            PUSH.pushRecieved(_data.data);
            if (_data.data.tab) {
                var tabIndex = parseInt(_data.data.tab, 10) - 1;
                APP.Nodes[tabIndex] && APP.handleNavigation(tabIndex);
            }
        }
    });
};