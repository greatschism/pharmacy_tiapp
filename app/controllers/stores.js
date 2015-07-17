var args = arguments[0] || {},
    Map = Alloy.Globals.Map,
    currentViewType = Alloy.CFG.apiCodes.store_view_type_list,
    viewTypeList = Alloy.CFG.apiCodes.store_view_type_list,
    viewTypeMap = Alloy.CFG.apiCodes.store_view_type_map,
    minSearchLength = Alloy.CFG.geo_search_min_length,
    isListPrepared = false,
    isMapPrepared = false,
    isSearchFocused = false,
    storeRows = [],
    geoRows = [],
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

function getStores(param) {

	/**
	 * abort any pending http requests
	 */
	if (geoHttpClient) {
		geoHttpClient.abort();
	}
	if (storeHttpClient) {
		storeHttpClient.abort();
	}

	/**
	 * if search is on map let's don't block ui
	 */
	$.loader.show();

	var reqStoreObj = {
		view_type : currentViewType
	};

	/*
	 * check whether it is a search
	 */
	if (param) {

		if (_.isString(param)) {
			reqStoreObj.search_criteria = param;
		} else {
			_.extend(reqStoreObj, {
				user_lat : param.latitude,
				user_long : param.longitude
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

		if (geoRows.length) {
			geoRows = [];
			$.geoTableView.setData([]);
		}
	}

	storeHttpClient = $.http.request({
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

	/**
	 * reset http client to ensure no pending api
	 */
	storeHttpClient = null;

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

	/**
	 *  load list or map based on the view type
	 */
	if (currentViewType == viewTypeList) {
		prepareList();
	} else {
		prepareMap();
	}

	/*
	 * hide loader
	 */
	$.loader.hide(false);
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

function getRegion() {
	// cache the answers
	var region = {
		lat : {
			min : json[0].lat,
			max : json[0].lat
		},
		lon : {
			min : json[0].lon,
			max : json[0].lon
		},
	};
	// loop the data
	// can be done in your existing loop
	// intItems = number of items in the array
	for ( intItem = 0; intItem < intItems; intItem = intItem + 1) {
		item = json[intItem];
		region.lat.min = Math.min(item.lat, region.lat.min);
		region.lat.max = Math.max(item.lat, region.lat.max);
		region.lon.min = Math.min(item.lon, region.lon.min);
		region.lon.max = Math.max(item.lon, region.lon.max);
	}
	// work out the difference
	region.lat.diff = region.lat.max - region.lat.min;
	region.lon.diff = region.lon.max - region.lon.min;
	// account for single entries
	if (intItems > 1) {
		region.diff = Math.max(region.lat.diff, region.lon.diff);
	} else {
		region.diff = 0.05;
	}
	// values you use with the map

	// latitudeDelta: region.diff
	// longitudeDelta: region.diff
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

	//process data
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

/**
 * trigger search for the first row object
 * called when only one row exists
 * user need not to click on it
 */
function triggerSearchForFirst() {
	/**
	 * should be called only
	 * when there are rows
	 */
	var params = geoRows[0].getParams();
	/**
	 * by pass zero search results
	 */
	if (params.invalid !== true) {
		setVisibleForSearchTable(false);
		getStores({
			latitude : params.latitude,
			longitude : params.longitude
		});
	}
}

function didFocusSearch(e) {
	isSearchFocused = true;
	/**
	 * show previous search hisotry
	 * if any
	 */
	if (geoRows.length) {
		setVisibleForSearchTable(true);
	}
}

function didClearSearch(e) {
	/**
	 * when search box is cleared
	 * clear all geo results and hide it
	 */
	if (geoRows.length) {
		setVisibleForSearchTable(false);
		geoRows = [];
		$.geoTableView.setData([]);
	}
}

function didChangeSearch(e) {
	/**
	 * cancel any existing request
	 */
	if (geoHttpClient) {
		geoHttpClient.abort();
	}
	/**
	 * if search string length >= geo_search_min_length
	 * call geo api to show suggestions
	 * otherwise directly call store api here
	 */
	var value = e.value;
	if (value.length >= minSearchLength) {
		geoHttpClient = $.httpClient.request({
			url : Alloy.CFG.geocode_url.concat(value),
			format : "JSON",
			success : didGetGEOCode,
			failure : didGetGEOCode
		});
	} else {
		/**
		 * clear previous search
		 * went down from minimum search chars
		 */
		didClearSearch();
	}
}

function didReturnSearch(e) {
	isSearchFocused = false;
	var value = e.source.getValue();
	/**
	 * if search string length >= geo_search_min_length
	 * geo api would have been called in
	 * change event to show suggestions
	 * otherwise directly call store api here
	 */
	if (value.length < minSearchLength) {
		getStores(value);
		//clear geo search results if any
		didClearSearch();
	} else if (!geoHttpClient && geoRows.length == 1) {
		triggerSearchForFirst();
	}
}

function didGetGEOCode(result, passthrough) {
	geoHttpClient = null;
	/**
	 * check if success
	 * zero results are avoided
	 * by checking status for "OK"
	 */
	geoRows = [];
	var data = [];
	if (result.status === "OK" && result.results) {
		_.each(result.results, function(geoObj) {
			var row = Alloy.createController("itemTemplates/label", {
				title : geoObj.formatted_address,
				latitude : geoObj.geometry.location.lat,
				longitude : geoObj.geometry.location.lng
			});
			data.push(row.getView());
			geoRows.push(row);
		});
		/*
		 * if return event is already fired
		 * search bar not focused now
		 * and only one result from geo api
		 * then call api directly
		 */
		if (!isSearchFocused && geoRows.length == 1) {
			triggerSearchForFirst();
		} else {
			setVisibleForSearchTable(true);
		}
	} else {
		/**
		 * show when zero results
		 */
		var row = Alloy.createController("itemTemplates/label", {
			title : $.strings.storeGEOZeroResults,
			invalid : true
		});
		data.push(row.getView());
		geoRows.push(row);
		setVisibleForSearchTable(true);
	}
	$.geoTableView.setData(data);
}

function setVisibleForSearchTable(value) {
	if ($.geoTableView.visible === value) {
		return false;
	}
	var opacity = value ? 1 : 0;
	if (value) {
		$.geoTableView.visible = true;
	}
	var anim = Ti.UI.createAnimation({
		opacity : opacity,
		duration : 200
	});
	anim.addEventListener("complete", function onComplete() {
		anim.removeEventListener("complete", onComplete);
		$.geoTableView.opacity = opacity;
		if (!value) {
			$.geoTableView.visible = false;
		}
	});
	$.geoTableView.animate(anim);
}

function didClickGEOTable(e) {
	var row = geoRows[e.index];
	if (row) {
		var params = row.getParams();
		/**
		 * prevent click from
		 * zero results row
		 */
		if (params.invalid !== true) {
			$.searchTxt.setValue(params.title);
			$.searchTxt.blur();
			setVisibleForSearchTable(false);
			getStores({
				latitude : params.latitude,
				longitude : params.longitude
			});
		}
	}
}

function didClickStoreTable(e) {
	var row = storeRows[e.index];
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
	//open detail screen
	$.app.navigator.open({
		titleid : "titleStoreDetails",
		ctrl : "storeDetails",
		ctrlArguments : {
			store : params
		},
		stack : true
	});
}

function didClickRightNavBtn(e) {
	/**
	 * currentViewType determines the
	 * view_type parameter of store api
	 */
	var opacity = 1;
	if ($.storeTableView.visible) {
		opacity = 0;
		currentViewType = viewTypeMap;
	} else {
		$.storeTableView.visible = true;
		currentViewType = viewTypeList;
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
