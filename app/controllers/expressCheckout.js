// Arguments passed into this controller can be accessed off of the `$.args` object directly or:
var args = $.args,
    utilities = require('utilities');

var checkoutDetails = {};

function init() {
	if (Alloy.Globals.isLoggedIn) {
		//getCheckoutDetails();
	}
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

function getCheckoutDetails() {

	// $.http.request({
	// 	method : "stores_list",
	// 	params : {
	// 		data : [{
	// 			stores : {
	// 				search_criteria : "",
	// 				user_lat : "",
	// 				user_long : "",
	// 				search_lat : "",
	// 				search_long : "",
	// 				view_type : "LIST"
	// 			}
	// 		}]
	// 	},
	// 	errorDialogEnabled : false,
	// 	success : didGetCheckoutDetails,
	// 	failure : checkoutDetailsFail
	// });
}

function checkoutDetailsFail() {


}

function didGetCheckoutDetails(result) {

	if (Alloy.Globals.isLoggedIn) {
		// _.each(result.data.stores.stores_list, function(store) {
		// 	if (parseInt(store.ishomepharmacy)) {
		// 		$.http.request({
		// 			method : "stores_get",
		// 			params : {
		// 				data : [{
		// 					stores : {
		// 						id : store.id,
		// 					}
		// 				}]
		// 			},
		// 			keepLoader : Alloy.Models.pickupModes.get("code_values") ? false : true,
		// 			success : didGetStore,
		// 			failure : didFail
		// 		});
		// 	}
		//});
	//	Here lives logic for preparing the express checkout screens
	}

}

exports.init = init; 