var args = arguments[0] || {},
    Map = Alloy.Globals.Map,
    searchTypeList = Alloy.CFG.apiCodes.store_search_type_list,
    searchTypeMap = Alloy.CFG.apiCodes.store_search_type_map,
    minSearchLength = Alloy.CFG.store_search_min_length,
    isListPrepared = false,
    isMapPrepared = false,
    storeRows = [],
    searchRows = [],
    pinImg,
    leftBtnDict,
    rightBtnDict,
    listIconDict,
    mapIconDict,
    geoHttpClient,
    storeHttpClient;

function init() {
	pinImg = $.uihelper.getImage("map_pin").image;
	leftBtnDict = $.createStyle({
		classes : ["annotation-icon", "icon-direction"]
	});
	rightBtnDict = $.createStyle({
		classes : ["annotation-child-icon", "icon-thin-arrow-right"]
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
	 * 		when location service is turned off and user logged in call api for listing home and  book marked stores
	 *  case 2:
	 * 		when location service is turned off and user is not logged in do nothing
	 *  note : iOS simulator may fail to give location often
	 *  just updating the location in simulator settings would help
	 */
	if (Alloy.Globals.isLoggedIn || !_.isEmpty(currentLocation)) {
		getStores();
	}
}

/**
 *  default location will be current location
 *  default type will be LIST
 */
function getStores(key, location, type) {

	/**
	 * if search is on map let's don't block ui
	 */
	$.loader.show(null, {
		height : type == searchTypeMap ? Ti.UI.SIZE : Ti.UI.FILL
	});

	/**
	 * abort any pending http requests
	 */
	if (geoHttpClient) {
		geoHttpClient.abort();
	}
	if (storeHttpClient) {
		storeHttpClient.abort();
	}

	var reqStoreObj = {
		view_type : type || searchTypeList
	};

	/*
	 * check whether it is a search
	 */
	if (key || location) {

		if (key) {
			reqStoreObj.search_criteria = key;
		} else {
			_.extend(reqStoreObj, {
				user_lat : location.latitude,
				user_long : location.longitude
			});
		}

	} else {

		_.extend(reqStoreObj, {
			user_lat : $.uihelper.currentLocation.latitude,
			user_long : $.uihelper.currentLocation.longitude
		});

		/*
		 * if not reset search if any
		 */

		if ($.searchTxt.getValue()) {
			$.searchTxt.setValue("");
		}

		if (searchRows.length) {
			searchRows = [];
			$.searchTableView.setData([]);
		}
	}

	$.http.request({
		method : "stores_list",
		params : {
			feature_code : "THXXX",
			data : [{
				stores : reqStoreObj
			}]
		},
		showLoader : false,
		success : didGetStores,
		failure : didGetStores
	});
}

function didGetStores(result, passthrough) {

	/*
	 * hide loader
	 */
	$.loader.hide(false);

	/*
	 * handle failure cases
	 */
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
		var distance = store.searchdistance || store.distance;
		_.extend(store, {
			title : $.utilities.ucword(store.addressline1),
			subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip,
			detailSubtitle : distance ? distance + $.strings.strSuffixDistance : "",
			detailType : "inactive",
			iconClasses : iconClasses
		});
	});
	Alloy.Collections.stores.reset(result.data.stores);
	if ($.storeTableView.visible) {
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
	/**
	 * if isMapPrepared is true it should be data from map
	 * should sort for showing home and book marked on top of the list
	 */
	if (isMapPrepared) {
		/**
		 * stores are already sorted by distance with api
		 */
		Alloy.Collections.stores.sortBy(function(model) {
			//keep home at top
			if (model.get("ishomepharmacy")) {
				return 1;
			}
			//followed by book marked
			if (model.get("isbookmarked")) {
				return 2;
			}
			//followed by others
			return 3;
		});
	}
	//reset rows
	storeRows = [];
	//process data
	var data = [];
	Alloy.Collections.stores.each(function(store) {
		var row = Alloy.createController("itemTemplates/masterDetailWithLIcon", store.toJSON());
		data.push(row.getView());
		storeRows.push(row);
	});
	$.storeTableView.setData(data);
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
	/**
	 * cancel any existing request
	 */
	if (httpClient) {
		httpClient.abort();
	}
	var value = e.value || e.source.getValue();
	if (value.length >= minSearchLength) {
		httpClient = $.httpClient.request({
			url : Alloy.CFG.geocode_url.concat(value),
			format : "JSON",
			success : didGetGEOCode,
			failure : didGetGEOCode
		});
	} else if (searchRows.length) {
		searchRows = [];
		$.searchTableView.setData([]);
	}
}

function didGetGEOCode(result, passthrough) {
	httpClient = null;
	//check if success
	if (result.status == "OK" && result.results.length) {
		searchRows = [];
		if ($.searchTableView.touchEnabled) {
			var data = [];
			_.each(result.results, function(geoObj) {
				var row = Alloy.createController("itemTemplates/label", {
					title : geoObj.formatted_address,
					latitude : geoObj.geometry.location.lat,
					longitude : geoObj.geometry.location.lng
				});
				data.push(row.getView());
				searchRows.push(row);
			});
			//debug, after enter searchTable is not visible for second search
			console.log(JSON.stringify($.searchTableView));
			$.searchTableView.setData(data);
		} else {
			//reset table
			$.searchTableView.setData([]);
			var location = result.results[0].geometry.location;
			getStores({
				latitude : location.lat,
				longitude : location.lng
			});
		}
	}
}

function didFocusSearch(e) {
	toggleSearchTable(1);
}

function didBlurSearch(e) {
	toggleSearchTable(0);
}

function toggleSearchTable(opacity) {
	if ($.searchTableView.visible) {
		$.searchTableView.touchEnabled = false;
		opacity = 0;
	} else {
		$.searchTableView.applyProperties({
			visible : true,
			touchEnabled : true
		});
	}
	var anim = Ti.UI.createAnimation({
		opacity : opacity,
		duration : 200
	});
	anim.addEventListener("complete", function onComplete() {
		anim.removeEventListener("complete", onComplete);
		$.searchTableView.opacity = opacity;
		if (!opacity) {
			$.searchTableView.visible = false;
		}
	});
	$.searchTableView.animate(anim);
}

function didClickStoreTable(e) {
	var row = storeRows[e.index];
	if (row) {
		handleNavigation(row.getParams());
	}
}

function didClickSearchTable(e) {
	var row = searchRows[e.index];
	if (row) {
		preventGEOSearch = true;
		var params = row.getParams();
		$.searchTxt.setValue(params.title);
		$.searchTxt.blur();
		getStores({
			latitude : params.latitude,
			longitude : params.longitude
		});
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
	if ($.storeTableView.visible) {
		opacity = 0;
	} else {
		$.storeTableView.visible = true;
	}
	var anim = Ti.UI.createAnimation({
		opacity : opacity,
		duration : 200
	});
	anim.addEventListener("complete", function onComplete() {
		anim.removeEventListener("complete", onComplete);
		$.storeTableView.opacity = opacity;
		if (opacity) {
			$.rightNavBtn.getNavButton().applyProperties(mapIconDict);
			//to keep map and list in sync
			prepareList();
		} else {
			$.rightNavBtn.getNavButton().applyProperties(listIconDict);
			$.storeTableView.visible = false;
			//to keep list and map in sync
			prepareMap();
		}
	});
	$.storeTableView.animate(anim);
}

exports.init = init;
