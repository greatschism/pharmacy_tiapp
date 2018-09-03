// Arguments passed into this controller can be accessed off of the `$.args` object directly or:
var args = $.args,
    utilities = require('utilities');

var homePharmacy = {};

function init() {
	if (Alloy.Globals.isLoggedIn) {
		getAllPharmacy();
	}
}

function didClickPhoto(e) {	
	$.app.navigator.showLoader();
 	$.uihelper.getPhotoForCard(true, didGetPhoto, $.window, didFailure);
 	$.app.navigator.showLoader();
 }
 
function didFailure(){
 	$.app.navigator.hideLoader();
 }

function didGetPhoto(blob) {
	/**
	 * keeping this blob in memory around the process
	 * is not a good idea, let's keep it in a file until
	 * we need this back
	 *
	 * image path is used throughout this module
	 * should not be changed
	 */

	var smallBlob = blob.imageAsResized(blob.getWidth() * 0.4, blob.getHeight() * 0.4);
	$.utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "insurancecard.jpg"), smallBlob, false);

	blob = null;
	smallBlob = null;

	$.app.navigator.hideLoader();
	$.app.navigator.open({
		titleid : "titleInsuranceCard",
		ctrl : "insuranceProfile",
		ctrlArguments : {
			store : homePharmacy,
		},
		stack : true
	});

}

function didFail(result, passthrough) {
	/**
	 * if something goes odd with api
	 * just close this screen to
	 * prevent any further actions
	 */
	$.app.navigator.hideLoader();
	$.app.navigator.close();
}

function getAllPharmacy() {
	/**
	 *step 1: get the stores, step 2: Identify the home pharmacy, step 3: get store details for home pharmacy
	 */
	$.http.request({
		method : "stores_list",
		params : {
			data : [{
				stores : {
					search_criteria : "",
					user_lat : "",
					user_long : "",
					search_lat : "",
					search_long : "",
					view_type : "LIST"
				}
			}]
		},
		errorDialogEnabled : false,
		success : getHomePharmacy,
		failure : didGetNoStore
	});
}

function didGetNoStore() {
	// getOrSetPickupModes();

}

function getHomePharmacy(result) {

	if (Alloy.Globals.isLoggedIn) {
		_.each(result.data.stores.stores_list, function(store) {
			if (parseInt(store.ishomepharmacy)) {
				$.http.request({
					method : "stores_get",
					params : {
						data : [{
							stores : {
								id : store.id,
							}
						}]
					},
					keepLoader : Alloy.Models.pickupModes.get("code_values") ? false : true,
					success : didGetStore,
					failure : didFail
				});
			}
		});
	}

}

function didGetStore(result, passthrough) {
	// logger.debug("\n\n\n in didgetstore result", JSON.stringify(result, null, 4), "\n\n\n");
	/**
	 * update properties to object
	 * don't replace, if then might clear the reference
	 * when passed through the controllers
	 */
	_.extend(homePharmacy, result.data.stores);
	_.extend(homePharmacy, {
		title : $.utilities.ucword(homePharmacy.addressline1),
		subtitle : $.utilities.ucword(homePharmacy.city) + ", " + homePharmacy.state + ", " + homePharmacy.zip
	});

	//$.storeTitleLbl.text = store.title;
	$.app.navigator.hideLoader();
	//logger.debug("\n\n\n in didgetstore store obj", JSON.stringify(store, null, 4), "\n\n\n");
}

exports.init = init; 