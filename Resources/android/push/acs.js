var APP = require("core");

var PUSH = require("push");

var CloudPush = require("ti.cloudpush");

var registerAndroid = function(_callback) {
    CloudPush.retrieveDeviceToken({
        success: function(_data) {
            APP.log("debug", "ACS.registerAndroid @success");
            APP.log("trace", _data.deviceToken);
            PUSH.deviceToken = _data.deviceToken;
            Ti.App.Properties.setString("PUSH_DEVICETOKEN", _data.deviceToken);
            CloudPush.addEventListener("callback", function(evt) {
                PUSH.pushRecieved(evt);
                APP.log(JSON.stringify(evt));
            });
            _callback();
        },
        error: function(_data) {
            APP.log("debug", "ACS.registerAndroid @error");
            APP.log("trace", JSON.stringify(_data));
        }
    });
};

var registeriOS;

exports.registerDevice = function(_callback) {
    APP.log("debug", "ACS.registerDevice");
    registerAndroid(_callback);
};