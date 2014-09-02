var APP = require("core");

var PUSH = require("push");

var CloudPush;

var registerAndroid;

var registeriOS;

exports.registerDevice = function(_callback) {
    APP.log("debug", "ACS.registerDevice");
};