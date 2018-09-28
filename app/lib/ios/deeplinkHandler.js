var TAG = "DEHA",
    Alloy = require("alloy"),
    logger = require("logger");

function init() {
	/**
	 * 	url passed via associated domain captured
	 *  here and assigned to Alloy.Globals.url
	 */
	// Ti.API.info('deeplink handler init');
	// Ti.App.iOS.addEventListener('continueactivity', function(e) {
	// 	Ti.API.info('continueactivity is FIRED');
	// 	if (e.activityType === "NSUserActivityTypeBrowsingWeb") {
	// 		Ti.API.info('(e.activityType === "NSUserActivityTypeBrowsingWeb") ' +JSON.stringify(e.webpageURL));
	// 		/**
	// 		 * 	Handle the URL in case it opened the app
	// 		 */ 
	// 		if ( typeof e.webpageURL === 'string') {
	// 			Alloy.Globals.url = e.webpageURL;
	// 		}
	// 	}
	// });

	//The above code has been commented out.  The continueactivity event needs to be bound in alloy.js in order to fire when the app is opened from being completely closed.
	//This logic has been moved back to Alloy.js

}

exports.init = init; 