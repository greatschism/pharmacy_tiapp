var TAG = "DEHA",
    Alloy = require("alloy"),
    logger = require("logger");

function init() {
	/**
	 * 	url passed via associated domain captured
	 *  here and assigned to Alloy.Globals.url
	 */
	Ti.App.iOS.addEventListener('continueactivity', function(e) {
		if (e.activityType === "NSUserActivityTypeBrowsingWeb") {
			Ti.API.info(JSON.stringify(e.webpageURL));
			/**
			 * 	Handle the URL in case it opened the app
			 */ 
			if ( typeof e.webpageURL === 'string') {
				Alloy.Globals.url = e.webpageURL;
			}
		}
	});
}

exports.init = init; 