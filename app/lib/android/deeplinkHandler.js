var TAG = "DEHA",
    Alloy = require("alloy"),
    logger = require("logger");

function init() {
	/**
	 * 	set the Alloy.Globals.url property
	 *  if the app was opened via url
	 */	
	Ti.API.info(" Ti.Android.currentActivity.intent = " + JSON.stringify(Alloy.Globals.androidIntent));
	Alloy.Globals.url = undefined;
	if ( typeof Alloy.Globals.androidIntent !== undefined) {
		Ti.API.info('camer here 1');
		if ( typeof Alloy.Globals.androidIntent.data !== undefined) {
			Ti.API.info('camer here 2');
			/**
			 * 	does the intent data contain 
			 * 	a custom url for the meijer app?
			 */
			if (JSON.stringify(Alloy.Globals.androidIntent.data).indexOf("meijerrx://") != -1 && (JSON.stringify(Alloy.Globals.androidIntent.data) !== "\"meijerrx://\"")) {
				Alloy.Globals.url = JSON.stringify(Alloy.Globals.androidIntent.data);
				/**
				 * 	open and closing quote must be stripped from this passed url directive
				 */
				if (Alloy.Globals.url.indexOf('"') === 0) {
					Alloy.Globals.url = (Alloy.Globals.url.split('"'))[1];
				}
				Ti.API.info('camer here 3: '+ Alloy.Globals.url);
			}
		}
	}
}

exports.init = init;