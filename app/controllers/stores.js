var args = arguments[0] || {},
    TAG = "stores",
    googleApiSuccess = "OK",
    Map = Alloy.Globals.Map,
    currentViewType = Alloy.CFG.apiCodes.store_view_type_list,
    viewTypeList = Alloy.CFG.apiCodes.store_view_type_list,
    viewTypeMap = Alloy.CFG.apiCodes.store_view_type_map,
    searchLenMin = Alloy.CFG.geo_search_length_min,
    radiusMin = Alloy.CFG.store_map_radius_min,
    radiusMax = Alloy.CFG.store_map_radius_max,
    radiusIncrement = Alloy.CFG.store_map_radius_increment,
    isListPrepared = false,
    isMapPrepared = false,
    isFocused = false,
    isChangedAfterFocus = false,
    isDirectionEnabled = false,
    shouldIgnoreRegion = true,
    currentLocation = {},
    currentRadiusMax = 0,
    storeRows = [],
    geoRows = [],
    lastRegion,
    pinImg,
    leftBtnDict,
    rightBtnDict,
    listIconDict,
    mapIconDict,
    httpClient,
    currentStore,
    isWindowOpen;

function init() {
	/**
	 * on ios region changed event triggered
	 * multiple times when the app pause
	 * and resume back. to prevent that
	 * remove region change event on pause
	 * and add back on reumed event
	 */
	if (OS_IOS) {
		Ti.App.addEventListener("pause", didPauseApp);
		Ti.App.addEventListener("resumed", didResumedApp);
	}
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
	/**
	 * to avoid incorrect alignment on ios
	 * when keep chaning visibility of this view
	 */
	if (OS_IOS) {
		$.loader.getView().addEventListener("postlayout", didPostlayout);
	}
}

function didPostlayout(e) {
	var view = e.source;
	view.removeEventListener("postlayout", didPostlayout);
	view.applyProperties({
		top : view.rect.y,
		left : view.rect.x
	});
}

function didPauseApp(e) {
	$.mapView.removeEventListener("regionchanged", didRegionchanged);
}

function didResumedApp(e) {
	$.mapView.addEventListener("regionchanged", didRegionchanged);
}

function didGetLocation(userLocation) {
	/**
	 *  case 1:
	 * 		when location service is turned off and user logged in call api for listing home and  book marked stores
	 *  case 2:
	 * 		when location service is turned off and user is not logged in do nothing
	 *  note : iOS simulator may fail to give location often
	 *  just updating the location in simulator settings would help
	 */
	if (Alloy.Globals.isLoggedIn || !_.isEmpty(userLocation)) {
		getStores(null, false);
	} else {
		/**
		 * if above fails and
		 * if view type is list show empty list (if not empty already)
		 * if view type is map show the default region
		 */
		if (currentViewType == viewTypeList && storeRows.length) {
			storeRows = [];
			$.storeTableView.setData([]);
		} else if (currentViewType == viewTypeMap) {
			shouldIgnoreRegion = true;
			$.mapView.applyProperties({
				annotations : [],
				region : Alloy.CFG.store_map_default_region
			});
		}
		/**
		 * hide loading indicator
		 * (this may requried for first call
		 * 	 of this function from init)
		 */
		$.loader.hide(false);
	}
}

/**
 * shouldUpdateRegion - whether or not to update region (default to true)
 * errorDialogEnabled - whetehr or not to show error alert (default to true)
 */
function getStores(param, errorDialogEnabled, shouldUpdateRegion) {

	/**
	 * abort any pending http requests
	 */
	if (httpClient) {
		httpClient.abort();
	}

	$.loader.show();

	var reqStoreObj = {
		view_type : currentViewType
	};

	/*
	 * check whether it is a search
	 */
	if (param) {

		if (_.isString(param)) {
			currentLocation = {};
			reqStoreObj.search_criteria = param;
		} else {
			currentLocation = _.pick(param, ["latitude", "longitude"]);
			_.extend(reqStoreObj, {
				search_lat : param.latitude,
				search_long : param.longitude
			});
		}

	} else {

		currentLocation = _.pick($.uihelper.userLocation, ["latitude", "longitude"]);
		_.extend(reqStoreObj, {
			user_lat : $.uihelper.userLocation.latitude,
			user_long : $.uihelper.userLocation.longitude
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

	/**
	 * passthrough can be a boolean|undefined
	 * if undefined considered as true
	 * when it is true update region
	 */
	httpClient = $.http.request({
		method : "stores_list",
		params : {
			feature_code : "THXXX",
			data : [{
				stores : reqStoreObj
			}]
		},
		passthrough : _.isUndefined(shouldUpdateRegion) ? true : shouldUpdateRegion,
		errorDialogEnabled : _.isUndefined(errorDialogEnabled) ? true : errorDialogEnabled,
		showLoader : false,
		success : didGetStores,
		failure : didGetStores
	});
}

function didGetStores(result, passthrough) {

	/**
	 * reset http client to ensure no pending api
	 */
	httpClient = null;

	/*
	 * handle failure cases
	 */
	if (!result.data) {
		//this resets the list populated already
		result.data = {
			stores : {
				stores_list : []
			}
		};
	}

	var location = _.pick(result.data.stores, ["latitude", "longitude"]),
	    destinations = "";
	if (!_.isEmpty(location)) {
		_.each(result.data.stores.stores_list, function(store) {
			if (destinations) {
				destinations += "|";
			}
			destinations += store.latitude + "," + store.longitude;
		});
	}

	if (destinations) {
		httpClient = $.httpClient.request({
			url : String.format(Alloy.CFG.distancematrix_url, (location.latitude + "," + location.longitude), destinations),
			format : "JSON",
			passthrough : {
				result : result,
				passthrough : passthrough
			},
			success : didGetDistance,
			failure : didGetDistance
		});
	} else {
		prepareData(result, passthrough);
	}
}

function didGetDistance(result, passthrough) {
	/**
	 * reset http client to ensure no pending api
	 */
	httpClient = null;
	if (result.status === googleApiSuccess) {
		var stores = passthrough.result.data.stores.stores_list,
		    elements = result.rows[0].elements,
		    min,
		    max;
		min = radiusMax;
		_.each(stores, function(store, index) {
			/**
			 * order of elements and stores
			 * should be same as per api docs
			 * but there are chances for api
			 * to not return a particular element
			 * due to limitation
			 */
			var element = elements[index] || {};
			if (element.status === googleApiSuccess) {
				/**
				 * meters to miles
				 * conversion
				 */
				var distance = (element.distance.value / 1609.34).toFixed(2);
				_.extend(store, {
					distance : Number(distance),
					detailSubtitle : distance + $.strings.strSuffixDistance
				});
				min = Math.min(min, store.distance);
			}
		});
		/**
		 * as per requirements
		 * zoom rules are applied
		 * only for MAP
		 */
		if (currentViewType == viewTypeMap) {
			/**
			 * distance calculation
			 * ignore items that falls after the selected / most nearest slab
			 * example:
			 * actual result:
			 * 	store1 - 7
			 * 	store2 - 12
			 * 	store3 - 18
			 * min = 7
			 * max = 15
			 * remove any store that cross 15 miles radius
			 */
			for ( max = radiusMin; max <= radiusMax; max += radiusIncrement) {
				if (min <= max) {
					break;
				}
			}
		} else {
			/**
			 * for list view max radius
			 * is radiusMax, no need to restrict
			 * with radiusMin - radiusMax stepper
			 * Note: this is required in case
			 * a store that is not home or favourite
			 * and distance > radiusMax with direction maxrix
			 * should be removed
			 */
			max = radiusMax;
		}
		/**
		 * removing as per
		 * distance validations explained above
		 * Note: if currentViewType === viewTypeList, no mater
		 * if distance is > max home and favourite
		 * will remain on the list
		 */
		stores = _.reject(stores, function(store) {
			if (store.distance <= max || (currentViewType == viewTypeList && ((parseInt(store.ishomepharmacy) || 0) || (parseInt(store.isbookmarked) || 0)))) {
				return false;
			}
			return true;
		});
		/**
		 * now sort it based on distance
		 * home pharmacy and bookmarked will
		 * always be on top
		 */
		passthrough.result.data.stores.stores_list = _.sortBy(stores, function(store) {
			if (parseInt(store.ishomepharmacy) || 0) {
				return -2;
			}
			if (parseInt(store.isbookmarked) || 0) {
				return -1;
			}
			return store.distance;
		});
	} else {
		$.logger.warn(TAG, "direction matrix api failed");
	}
	prepareData(passthrough.result, passthrough.passthrough);
}

function prepareData(result, passthrough) {

	/**
	 * need to set here
	 *  when search criteria is passed
	 */
	if (_.isEmpty(currentLocation)) {
		currentLocation = _.pick(result.data.stores, ["latitude", "longitude"]);
	}
	/**
	 * check whether or not to enable
	 * direction button for this result set
	 */
	isDirectionEnabled = !_.isEmpty(currentLocation);

	/*
	 *  we are making a new api call
	 *  the data of this api call should sync when switching between list and map
	 */
	isListPrepared = false;
	isMapPrepared = false;

	//common parsing logics
	var loggedIn = Alloy.Globals.isLoggedIn;
	/**
	 * setting max distance for current region
	 * based on this distance will trigger api call
	 * on region change
	 */
	currentRadiusMax = 0;
	_.each(result.data.stores.stores_list, function(store) {
		var iconClasses;
		store.ishomepharmacy = parseInt(store.ishomepharmacy) || 0;
		store.isbookmarked = parseInt(store.isbookmarked) || 0;
		if (loggedIn && (store.ishomepharmacy || store.isbookmarked)) {
			iconClasses = ["content-left-icon", (store.ishomepharmacy ? "icon-home" : "icon-filled-star")];
		}
		var distance = store.distance || 0;
		/**
		 * when a sync happens from list to map
		 * home & favourites pharmacies will also loaded
		 * no mater how far it is
		 * ignore them from currentRadiusMax calculation
		 */
		if (radiusMax >= distance) {
			currentRadiusMax = Math.max(currentRadiusMax, distance);
		}
		/**
		 * latitude and longitude
		 * is being string some times
		 * to avoid that, convert them into
		 * Number
		 */
		_.extend(store, {
			title : $.utilities.ucword(store.addressline1),
			subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip,
			detailType : "inactive",
			iconClasses : iconClasses,
			latitude : Number(store.latitude),
			longitude : Number(store.longitude)
		});
	});

	/**
	 * update collection
	 * with validated stores
	 */
	Alloy.Collections.stores.reset(result.data.stores.stores_list);

	/**
	 *  load list or map based on the view type
	 */
	if (currentViewType == viewTypeList) {
		prepareList();
	} else {
		/**
		 * whether or not to update region
		 * is determined by the passthrough (true|false)
		 */
		prepareMap(passthrough);
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

/**
 * shouldUpdateRegion - Boolean
 * whether or not to update map region
 */
function prepareMap(shouldUpdateRegion) {

	/**
	 *  check whether list and map is already in sync
	 *  since this function can called when switching between list and map
	 */
	if (isMapPrepared) {
		return false;
	}

	isMapPrepared = true;

	//process data
	var len = Alloy.Collections.stores.length,
	    data = [],
	    region;
	if (len) {
		/**
		 * only update region to
		 * focus all annotation
		 * if it is a sync from list (when isListPrepared is true)
		 * or a search (when search bar is not empty)
		 */
		if (shouldUpdateRegion) {
			/**
			 * cache lat and lon for finding region
			 * get the lat and lon of a store which is not a
			 * home / favourite store if nothing is availble as such,
			 * cache home / favourite only
			 */
			var firstStore = Alloy.Collections.stores.findWhere({
				ishomepharmacy : 0,
				isbookmarked : 0
			}) || Alloy.Collections.stores.at(0),
			    firstLat = firstStore.get("latitude"),
			    firstLon = firstStore.get("longitude");
			region = {
				latitude : {
					min : firstLat,
					max : firstLat
				},
				longitude : {
					min : firstLon,
					max : firstLon
				}
			};
		}
		Alloy.Collections.stores.each(function(store) {
			/**
			 * only update region to
			 * focus all annotation
			 * if it is a sync from list
			 * or a search
			 */
			if (region) {
				/**
				 * ignore annotations that exceeds the max radius
				 */
				if (radiusMax >= (store.get("distance") || 0)) {
					/**
					 * geo calculation
					 * for finding region
					 */
					region.latitude.min = Math.min(store.get("latitude"), region.latitude.min);
					region.latitude.max = Math.max(store.get("latitude"), region.latitude.max);
					region.longitude.min = Math.min(store.get("longitude"), region.longitude.min);
					region.longitude.max = Math.max(store.get("longitude"), region.longitude.max);
				}
			}
			//process annotations
			var storeId = store.get("id"),
			    leftBtn = isDirectionEnabled ? Ti.UI.createButton(leftBtnDict) : null,
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
				/**
				 * show direction button
				 * only if current location (which is search / user location)
				 *  is available
				 */
				if (leftBtn) {
					leftBtn.applyProperties({
						clicksource : "leftPane",
						storeId : storeId
					});
					leftBtn.addEventListener("click", didClickMap);
				}
				rightBtn.applyProperties({
					clicksource : "rightPane",
					storeId : storeId
				});
				rightBtn.addEventListener("click", didClickMap);
			}
			data.push(annotation);
		});
		/**
		 * only update region to
		 * focus all annotation
		 * if it is a sync from list
		 * or a search
		 */
		if (region) {
			/**
			 * calculate delta / zoom level for annotation
			 */
			if (len > 1) {
				region.latitude.delta = region.latitude.max - region.latitude.min;
				region.longitude.delta = region.longitude.max - region.longitude.min;
				region.delta = Math.max(region.latitude.delta, region.longitude.delta);
			} else {
				region.delta = 0.05;
			}
			/**
			 * ignores the region change event
			 * that would cause by the programmatic
			 * region change below
			 */
			shouldIgnoreRegion = true;
			region = {
				latitude : (region.latitude.min + region.latitude.max) / 2,
				longitude : (region.longitude.min + region.longitude.max) / 2,
				latitudeDelta : region.delta,
				longitudeDelta : region.delta
			};
		}
	} else if (shouldUpdateRegion) {
		/**
		 * should show the current location's or default region
		 * when no stores found with shouldUpdateRegion true
		 */
		shouldIgnoreRegion = true;
		if (_.isEmpty(currentLocation)) {
			region = Alloy.CFG.store_map_default_region;
		} else {
			region = {
				latitude : currentLocation.latitude,
				longitude : currentLocation.longitude,
				latitudeDelta : 0.05,
				longitudeDelta : 0.05
			};
		}
	}
	$.mapView.applyProperties({
		annotations : data,
		region : region
	});
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
		$.searchTxt.setValue(params.title);
		getStores({
			latitude : params.latitude,
			longitude : params.longitude
		});
	}
}

function clearLastGeoSearch() {
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

function didFocusSearch(e) {
	isFocused = true;
	isChangedAfterFocus = false;
	/**
	 * show last geo search
	 * if any
	 */
	if (geoRows.length) {
		setVisibleForSearchTable(true);
	}
}

function didClearSearch(e) {
	clearLastGeoSearch();
	/**
	 * only call api is text box is not focused
	 * on clear, user may want to type something again now
	 */
	if (isFocused) {
		/**
		 * this call api after return
		 * event if nothing entered
		 */
		isChangedAfterFocus = true;
	} else {
		/**
		 * disable error dialog and force updates
		 */
		$.uihelper.getLocation(didGetLocation, false, false);
	}
}

function didChangeSearch(e) {
	/**
	 * cancel any existing request
	 */
	if (httpClient) {
		httpClient.abort();
	}
	/**
	 * change event triggered
	 * after a focus
	 */
	isChangedAfterFocus = true;
	/**
	 * if search string length >= geo_search_min_length
	 * call geo api to show suggestions
	 * otherwise directly call store api here
	 */
	var value = e.value;
	if (value.length >= searchLenMin) {
		httpClient = $.httpClient.request({
			url : Alloy.CFG.geocode_url.concat(value),
			format : "JSON",
			passthrough : value,
			success : didGetGeoCode,
			failure : didGetGeoCode
		});
	} else {
		/**
		 * clear last geo search
		 * went down from minimum search chars
		 */
		clearLastGeoSearch();
	}
}

function didReturnSearch(e) {
	/**
	 * force text field to blur
	 * on android, otherwise
	 * the focus may still there
	 * and no further focus events
	 * will be fired
	 */
	if (OS_ANDROID) {
		$.searchTxt.blur();
	}
	isFocused = false;
	/**
	 * no change in search string
	 * after the last focus
	 */
	var value = e.source.getValue();
	if (!isChangedAfterFocus) {
		/**
		 * just hide search table as there is no change
		 */
		setVisibleForSearchTable(false);
		return false;
	}
	/**
	 * if search string length >= geo_search_min_length
	 * geo api would have been called in
	 * change event to show suggestions
	 * otherwise directly call store api here
	 */
	if (value.length < searchLenMin) {
		getStores(value);
		//clear geo search results if any
		clearLastGeoSearch();
	} else if (!httpClient && geoRows.length == 1) {
		/**
		 * making sure no http client
		 * is in progress and has only
		 * one row
		 */
		if (geoRows[0].getParams().invalid) {
			/**
			 * result set has invalid row
			 * so trigger search cretiria
			 */
			getStores(value);
			//clear geo search results if any
			clearLastGeoSearch();
		} else {
			/**
			 * result set has a valid row
			 */
			triggerSearchForFirst();
		}
	}
}

function didGetGeoCode(result, passthrough) {
	httpClient = null;
	/**
	 * check if success
	 * zero results are avoided
	 * by checking status for "OK"
	 */
	geoRows = [];
	var data = [];
	if (result.status === googleApiSuccess && result.results) {
		_.each(result.results, function(geoObj) {
			var row = Alloy.createController("itemTemplates/label", {
				title : geoObj.formatted_address,
				latitude : geoObj.geometry.location.lat,
				longitude : geoObj.geometry.location.lng
			});
			data.push(row.getView());
			geoRows.push(row);
		});
		$.geoTableView.setData(data);
		/*
		 * if return event is already fired
		 * search bar not focused now
		 * and only one result from geo api
		 * then call api directly
		 */
		if (!isFocused && geoRows.length == 1) {
			triggerSearchForFirst();
		} else {
			setVisibleForSearchTable(true);
		}
	} else {
		if (isFocused) {
			/**
			 * show when zero results
			 * since text field is still
			 * focused
			 */
			var row = Alloy.createController("itemTemplates/label", {
				title : $.strings.storesGeoZeroResults,
				invalid : true
			});
			data.push(row.getView());
			geoRows.push(row);
			$.geoTableView.setData(data);
			setVisibleForSearchTable(true);
		} else {
			/**
			 * text field is not focused now
			 * so trigger a search criteria
			 */
			$.geoTableView.setData(data);
			setVisibleForSearchTable(false);
			/**
			 * use search criteria
			 * passthrough will have the
			 * search string
			 */
			getStores(passthrough);
			//clear geo search results if any
			clearLastGeoSearch();
		}
	}
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

function didClickGeoTable(e) {
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
			/**
			 * force text field to blur
			 * on android, otherwise
			 * the focus may still there
			 * and no further focus events
			 * will be fired
			 */
			if (OS_ANDROID) {
				$.searchTxt.blur();
			}
			/**
			 * return or blur event
			 * might not be triggered
			 * as above is a explicit call to
			 * blur
			 */
			isFocused = false;
			setVisibleForSearchTable(false);
			getStores({
				latitude : params.latitude,
				longitude : params.longitude
			});
		}
	}
}

function didClickStoreTable(e) {
	/**
	 * when httpClient is valid
	 * a call is in progress
	 * so let's not allow user
	 * to do any action on existing list
	 */
	if (httpClient) {
		return false;
	}
	var row = storeRows[e.index];
	if (row) {
		handleNavigation(row.getParams());
	}
}

function didClickMap(e) {
	/**
	 * when httpClient is valid
	 * a call is in progress
	 * so let's not allow user
	 * to do any action on existing map
	 */
	if (httpClient) {
		return false;
	}
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
				}, currentLocation);
				break;
			}
		}
	}
}

function handleNavigation(params) {
	//store module opened for selecting a store
	if (args.selectable) {
		if (args.navigation) {
			_.extend(args.navigation.ctrlArguments.store, params);
			$.app.navigator.open(args.navigation);
		} else {
			_.extend(args.store, params);
			/**
			 *  let the caller of this screen know
			 *  store has been changed
			 */
			args.store.shouldUpdate = true;
			$.app.navigator.close();
		}
		return true;
	}
	/**
	 * keep object in currentStore
	 * to check for changes in focus event
	 */
	currentStore = params;
	//open detail screen
	$.app.navigator.open({
		titleid : "titleStoreDetails",
		ctrl : "storeDetails",
		ctrlArguments : {
			store : currentStore,
			currentLocation : currentLocation,
			direction : isDirectionEnabled
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
		/**
		 * to keep list and map in sync
		 * should update region as it is a sync from map
		 */
		prepareMap(true);
	} else {
		$.storeTableView.visible = true;
		currentViewType = viewTypeList;
		//to keep map and list in sync
		prepareList();
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
		} else {
			$.rightNavBtn.getNavButton().applyProperties(listIconDict);
			$.storeTableView.visible = false;
		}
	});
	$.storeTableView.animate(anim);
}

function didRegionchanged(e) {
	if (shouldIgnoreRegion) {
		shouldIgnoreRegion = false;
		return false;
	}
	/**
	 * check whether this region is covered by last search
	 * if then ignore
	 * else call api
	 */
	if (lastRegion && $.utilities.getDistance(lastRegion, e) < currentRadiusMax) {
		return false;
	}
	/**
	 * cancel any pending request
	 */
	if (httpClient) {
		httpClient.abort();
	}
	/**
	 * search for actual address
	 * to be displayed on search bar
	 */
	var latitude = e.latitude,
	    longitude = e.longitude;
	httpClient = $.httpClient.request({
		url : Alloy.CFG.reverse_geocode_url.concat((latitude + "," + longitude)),
		format : "JSON",
		passthrough : {
			latitude : latitude,
			longitude : longitude
		},
		success : didGetAddress,
		failure : didGetAddress
	});
}

function didGetAddress(result, passthrough) {
	/**
	 * reset http
	 */
	httpClient = null;
	/**
	 * check if success
	 */
	if (result.status === googleApiSuccess && result.results) {
		/**
		 * clear last geo search
		 * if any
		 */
		clearLastGeoSearch();
		/**
		 * populate new result
		 * don't have to show the geo table
		 * as it is just a region change
		 */
		var geoObj = result.results[0] || {},
		    row = Alloy.createController("itemTemplates/label", {
			title : geoObj.formatted_address,
			latitude : geoObj.geometry.location.lat,
			longitude : geoObj.geometry.location.lng
		});
		geoRows.push(row);
		$.geoTableView.setData([row.getView()]);
		$.searchTxt.setValue(geoObj.formatted_address);
		/**
		 * update last region
		 */
		lastRegion = {
			latitude : geoObj.geometry.location.lat,
			longitude : geoObj.geometry.location.lng
		};
	} else {
		$.logger.warn(TAG, "geo code api failed");
		/**
		 * update last region
		 * when geo coder
		 * fails, hanlde it
		 */
		lastRegion = passthrough;
	}
	/**
	 * don't update map region
	 * after setting search results
	 */
	getStores({
		latitude : lastRegion.latitude,
		longitude : lastRegion.longitude
	}, false, false);
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		$.uihelper.getLocation(didGetLocation);
	} else if (currentStore && currentStore.shouldUpdate) {
		currentStore = null;
		getStores(currentLocation, true, false);
	}
}

function terminate() {
	/**
	 * removing app event listeners
	 * added on init
	 */
	if (OS_IOS) {
		Ti.App.removeEventListener("pause", didPauseApp);
		Ti.App.removeEventListener("resumed", didResumedApp);
	}
	if (httpClient) {
		httpClient.abort();
	}
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
