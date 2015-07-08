var args = arguments[0] || {},
    isSearch = false,
    isListPrepared = false,
    isMapPrepared = false,
    rows = [];

/**
 *  complete UI operations before loading view / init
 *  Note: May fail if use searchbar doesn't have a static height
 */
(function() {
	$.containerView.top = $.searchbar.height;
})();

function init() {
	$.uihelper.getLocation(didGetLocation);
}

function didGetLocation(currentLocation) {
	/**
	 *  case 1:
	 * 		when location service is turned off and user logged in call api for listing home and favourite stores
	 *  case 2:
	 * 		when location service is turned off and user is not logged in do nothing
	 *  note : iOS simulator may fail to give location often
	 *  just updating the location in simulator settings would help
	 */
	if (Alloy.Globals.isLoggedIn || !_.isEmpty(currentLocation)) {
		getStores();
	}
}

function getStores(searchStr) {
	//check whether it is a search
	if (searchStr) {
		isSearch = true;
	} else if ($.searchTxt.getValue()) {
		//reset search if any
		$.searchTxt.setValue("");
	}
	/*
	 *  we are making a new api call
	 *  the data of this api call should sync when switching between list and map
	 */
	isListPrepared = false;
	isMapPrepared = false;
	//till api is ready
	didGetStores({
		"status" : "Success",
		"code" : "200",
		"message" : "x",
		"description" : "x",
		"data" : {
			"stores" : [{
				"id" : "1234",
				"store_identifier" : "12345",
				"store_ncpdp_id" : "12345",
				"store_name" : "TEST STORE 1",
				"addressline1" : "TEST1",
				"addressline2" : "TEST1",
				"state" : "CA",
				"city" : "SF",
				"zip" : "04003",
				"email_address" : "x",
				"phone" : "6172837737",
				"fax" : "6172837737",
				"latitude" : "37.774929",
				"longitude" : "-122.419416",
				"timezone" : "US/Central",
				"distance" : "234.23",
				"searchdistance" : "234.234",
				"isbookmarked" : "0",
				"ishomepharmacy" : "1"
			}, {
				"id" : "1235",
				"store_identifier" : "12346",
				"store_ncpdp_id" : "12346",
				"store_name" : "TEST STORE 2",
				"addressline1" : "TEST2",
				"addressline2" : "TEST2",
				"state" : "CA",
				"city" : "SF",
				"zip" : "04003",
				"email_address" : "x",
				"phone" : "6172837737",
				"fax" : "6172837737",
				"latitude" : "34.052234",
				"longitude" : "-118.243685",
				"timezone" : "US/Central",
				"distance" : "234.23",
				"searchdistance" : "234.234",
				"isbookmarked" : "1",
				"ishomepharmacy" : "0"
			}]
		}
	});
}

function didGetStores(result, passthrough) {
	if (!result.data) {
		//ignore when list is already empty
		if (!Alloy.Collections.stores.length) {
			return false;
		}
		//this resets the list populated already
		result.data = {
			stores : []
		};
	}
	//common parsing logics
	var loggedIn = Alloy.Globals.isLoggedIn;
	_.each(result.data.stores, function(store) {
		var iconClasses;
		store.ishomepharmacy = parseInt(store.ishomepharmacy);
		store.isbookmarked = parseInt(store.isbookmarked);
		if (loggedIn && (store.ishomepharmacy || store.isbookmarked)) {
			iconClasses = ["content-left-icon", (store.ishomepharmacy ? "icon-home" : "icon-filled-star")];
		}
		/*
		 * distance key may have to be changed once api is ready
		 * with condition whether it is a text search or near by
		 */
		_.extend(store, {
			title : $.utilities.ucword(store.addressline1),
			subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip,
			detailSubtitle : store[ isSearch ? "searchdistance" : "distance"] + $.strings.strSuffixDistance,
			detailType : "inactive",
			iconClasses : iconClasses
		});
	});
	Alloy.Collections.stores.reset(result.data.stores);
	if ($.tableView.visible) {
		prepareList();
	} else {
		prepareMap();
	}
}

function prepareList() {
	/**
	 *  check whether list and map is already in sync
	 *  since this function can called when switching between list and map
	 */
	if (isMapPrepared) {
		return false;
	}
	//reset rows
	rows = [];
	var data = [];
	Alloy.Collections.stores.each(function(store) {
		var row = Alloy.createController("itemTemplates/masterDetailWithLIcon", store.toJSON());
		data.push(row.getView());
		rows.push(row);
	});
	$.tableView.setData(data);
}

function prepareMap() {
	if (isListPrepared) {
		return false;
	}
}

function didChangeSearch(e) {

}

function didClickTableView(e) {
	var row = rows[e.index];
	if (row) {
		handleNavigation(row.getParams());
	}
}

function handleNavigation(params) {
	//store module opened for selecting a store
	if (args.selectable) {
		_.extend(args.store, params);
		$.app.navigator.close();
		return true;
	}
	//open detail screen
	$.app.navigator.open({
		titleid : "titleStoreDetails",
		ctrl : "storeDetails",
		ctrlArguments : params,
		stack : true
	});
}

function didClickRightNavBtn(e) {
	var opacity = 1;
	if ($.tableView.visible) {
		opacity = 0;
	} else {
		$.tableView.visible = true;
	}
	var anim = Ti.UI.createAnimation({
		opacity : opacity,
		duration : 200
	});
	anim.addEventListener("complete", function onComplete() {
		anim.removeEventListener("complete", onComplete);
		$.tableView.opacity = opacity;
		if (opacity) {
			//to keep map and list in sync
			prepareList();
		} else {
			$.tableView.visible = false;
			//to keep list and map in sync
			prepareMap();
		}
	});
	$.tableView.animate(anim);
}

exports.init = init;
