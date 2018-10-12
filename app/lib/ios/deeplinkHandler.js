var TAG = "DEHA",
    Alloy = require("alloy"),
    logger = require("logger");

function init(e) {
	/**
	 * 	url passed via associated domain captured
	 *  here and assigned to Alloy.Globals.url
	 */
	if (e.activityType === "NSUserActivityTypeBrowsingWeb") {
		logger.debug('(e.activityType === "NSUserActivityTypeBrowsingWeb") ' +JSON.stringify(e.webpageURL));
		/**
		 * 	Handle the URL in case it opened the app
		 */ 
		if ( typeof e.webpageURL === 'string') {
			Alloy.Globals.url = e.webpageURL;
		}
	}
}

exports.init = init; 