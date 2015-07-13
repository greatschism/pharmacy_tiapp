var args = arguments[0] || {},
    Map = Alloy.Globals.Map,
    isSearch = false,
    isListPrepared = false,
    isMapPrepared = false,
    rows = [],
    pinImg,
    leftBtnDict,
    rightBtnDict,
    listIconDict,
    mapIconDict;

function init() {
	pinImg = $.uihelper.getImage("map_pin").image;
	leftBtnDict = $.createStyle({
		classes : ["annotation-icon-btn", "icon-direction"]
	});
	rightBtnDict = $.createStyle({
		classes : ["annotation-child-icon-btn", "icon-thin-arrow-right"]
	});
	listIconDict = $.createStyle({
		classes : ["icon-list"]
	});
	mapIconDict = $.createStyle({
		classes : ["icon-map"]
	});
	$.containerView.top = $.searchbar.height;
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
	} else {
		isSearch = false;
		//reset search if any
		if ($.searchTxt.getValue()) {
			$.searchTxt.setValue("");
		}
	}
	//till api is ready
	didGetStores({
		"status" : "Success",
		"code" : "200",
		"message" : "x",
		"description" : "x",
		"data" : {
			"stores" : [{
				"id" : "1",
				"store_identifier" : "01",
				"store_ncpdp_id" : "4517100",
				"store_name" : "BAYLOR MEDICAL PLAZA PHARMACY",
				"addressline1" : "3600 GASTON AVENUE, SUITE 109",
				"addressline2" : "3600 GASTON AVENUE, SUITE 109",
				"state" : "TX",
				"city" : "DALLAS",
				"zip" : "75246",
				"email_address" : null,
				"phone" : "2148203451",
				"fax" : "2148204088",
				"latitude" : "32.791002",
				"longitude" : "-96.779725",
				"timezone" : "US/Central",
				"distance" : null,
				"searchdistance" : null,
				"isbookmarked" : "1",
				"ishomepharmacy" : "1"
			}, {
				"id" : "2",
				"store_identifier" : "01",
				"store_ncpdp_id" : "4517100",
				"store_name" : "BAYLOR MEDICAL PLAZA PHARMACY",
				"addressline1" : "3700 GASTON AVENUE, SUITE 109",
				"addressline2" : "3700 GASTON AVENUE, SUITE 109",
				"state" : "TX",
				"city" : "DALLAS",
				"zip" : "75246",
				"email_address" : null,
				"phone" : "2148203451",
				"fax" : "2148204088",
				"latitude" : "34.791002",
				"longitude" : "-95.779725",
				"timezone" : "US/Central",
				"distance" : null,
				"searchdistance" : null,
				"isbookmarked" : "0",
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
	/*
	 *  we are making a new api call
	 *  the data of this api call should sync when switching between list and map
	 */
	isListPrepared = false;
	isMapPrepared = false;
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
		 * with a if avoid null on distance
		 */
		var distance = store[ isSearch ? "searchdistance" : "distance"];
		_.extend(store, {
			title : $.utilities.ucword(store.addressline1),
			subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip,
			detailSubtitle : distance ? distance + $.strings.strSuffixDistance : "",
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
	if (isListPrepared) {
		return false;
	}
	isListPrepared = true;
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
	/**
	 *  check whether list and map is already in sync
	 *  since this function can called when switching between list and map
	 */
	if (isMapPrepared) {
		return false;
	}
	isMapPrepared = true;
	var data = [];
	Alloy.Collections.stores.each(function(store) {
		var storeId = store.get("id"),
		    leftBtn = Ti.UI.createButton(leftBtnDict),
		    rightBtn = Ti.UI.createButton(rightBtnDict),
		    annotation = Map.createAnnotation({
			storeId : storeId,
			title : store.get("title"),
			subtitle : store.get("subtitle"),
			latitude : store.get("latitude"),
			longitude : store.get("longitude"),
			leftView : leftBtn,
			rightView : rightBtn,
			image : pinImg
		});
		if (OS_IOS) {
			leftBtn.applyProperties({
				clicksource : "leftPane",
				storeId : storeId
			});
			rightBtn.applyProperties({
				clicksource : "rightPane",
				storeId : storeId
			});
			leftBtn.addEventListener("click", didClickMap);
			rightBtn.addEventListener("click", didClickMap);
		}
		data.push(annotation);
	});
	$.mapView.annotations = data;
}

function didChangeSearch(e) {

}

function didClickTableView(e) {
	var row = rows[e.index];
	if (row) {
		handleNavigation(row.getParams());
	}
}

function didClickMap(e) {
	var annotation = e.annotation,
	    clicksource = e.clicksource,
	    store;
	if (OS_IOS && !clicksource) {
		annotation = e.source;
		clicksource = annotation.clicksource;
	}
	if (clicksource && annotation) {
		store = Alloy.Collections.stores.findWhere({
			id : annotation.storeId
		});
		if (store) {
			switch(clicksource) {
			case "title":
			case "subtitle":
			case "rightPane":
			case "infoWindow":
				handleNavigation(store.toJSON());
				break;
			case "leftPane":
				/**
				 * if isSearch true then
				 * may have to pass source as the search location
				 */
				$.uihelper.getDirection({
					latitude : store.get("latitude"),
					longitude : store.get("longitude")
				});
				break;
			}
		}
	}
}

function handleNavigation(params) {
	//store module opened for selecting a store
	if (args.selectable) {
		_.extend(args.store, params);
		$.app.navigator.close();
		return true;
	}
	//whether user location is available
	var userLocation = !_.isEmpty($.uihelper.currentLocation);
	//open detail screen
	$.app.navigator.open({
		titleid : "titleStoreDetails",
		ctrl : "storeDetails",
		ctrlArguments : {
			store : params,
			isSearch : isSearch,
			userLocation : userLocation,
			direction : isSearch || userLocation
		},
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
			$.rightNavBtn.getNavButton().applyProperties(mapIconDict);
			//to keep map and list in sync
			prepareList();
		} else {
			$.rightNavBtn.getNavButton().applyProperties(listIconDict);
			$.tableView.visible = false;
			//to keep list and map in sync
			prepareMap();
		}
	});
	$.tableView.animate(anim);
}

exports.init = init;
