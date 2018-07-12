var TAG = "UIHE",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    config = require("config"),
    utilities = require("utilities"),
    logger = require("logger"),
    analyticsHandler = require("analyticsHandler"),
    moment = require("alloy/moment");

if (OS_IOS) {
 	var TiTouchId = require("com.mscripts.mscriptstouchid");
	var TiIdentity = require('ti.identity');
}

var TouchIDHelper = {


	deviceCanAuthenticate : function() {
		var result = false;
		if (OS_IOS) {
			var supported =  TiIdentity.isSupported();
			if (TiIdentity.biometryType == TiIdentity.BIOMETRY_TYPE_FACE_ID) {
				return result; //we don't support FaceID right this second...
			}
		 	var canAuthenticate = TiTouchId.deviceCanAuthenticate();
		 	if (canAuthenticate.canAuthenticate === true) {
		 		result = true;
		 	}

		}

		return result;
	},


	authenticateOnlyPasscode : function(successCallback, failureCallback) {
		var result = false;

		
		TiTouchId.authenticateOnlyPasscode({
			reason : Alloy.Globals.strings.loginTouchFailure,
			reason :  Alloy.Globals.strings.loginUseTouch,
 			callback : function(tIDResp) {

 				if( ! tIDResp.error) {
	 				setTimeout( function(){

						successCallback();
						return;

 						//touchIDAuth(tIDResp, itemObj);
 					},0);
 				} else {
 					failureCallback();
 				}
			} 				
 		});
	},
	
	authenticate : function(successCallback, failureCallback) {
		var result = false;

		
		TiTouchId.authenticate({
			reason : Alloy.Globals.strings.loginTouchFailure,
			reason :  Alloy.Globals.strings.loginUseTouch,
 			callback : function(tIDResp) {

 				if( ! tIDResp.error) {
	 				setTimeout( function(){

						successCallback();
						return;

 						//touchIDAuth(tIDResp, itemObj);
 					},0);
 				} else {
 					failureCallback();
 				}
			} 				
 		});
	}
};

module.exports = TouchIDHelper;
