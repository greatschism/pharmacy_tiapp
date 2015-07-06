var args = arguments[0] || {},
    app = require("core"),
    logger = require("logger"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    icons = Alloy.CFG.icons,
    rows = [];

function init() {
	//app.navigator.showLoader(Alloy.Globals.strings.msgPleaseWait);
	//uihelper.getLocation(didSearch);

	//temp fix until API is available
	result = '{"status":"Success","code":"200","message":"x","description":"x","data":{"stores":[{"id":"1234","store_identifier":"12345","store_ncpdp_id":"12345","store_name":"TEST STORE 1","addressline1":"TEST1","addressline2":"TEST1","state":"CA","city":"SF","zip":"04003","email_address":"x","phone":"6172837737","fax":"6172837737","latitude":"37.774929","longitude":"-122.419416","timezone":"US/Central","distance":"234.23","searchdistance":"234.234","isbookmarked":"0","ishomepharmacy":"1"},{"id":"1235","store_identifier":"12346","store_ncpdp_id":"12346","store_name":"TEST STORE 2","addressline1":"TEST2","addressline2":"TEST2","state":"CA","city":"SF","zip":"04003","email_address":"x","phone":"6172837737","fax":"6172837737","latitude":"34.052234","longitude":"-118.243685","timezone":"US/Central","distance":"234.23","searchdistance":"234.234","isbookmarked":"1","ishomepharmacy":"0"}]}}';
	didGetAllStores(JSON.parse(result));
	//getStoresList();
}

function getStoresList() {
	$.searchbar.setValue("");
	$.http.request({
		method : "stores_list",
		data : {
			filter : [{
				"sort_order" : "asc",
				"sort_by" : "userDistance"
			}],
			data : [{
				"stores" : {
					"search_criteria" : "x"
				}
			}]
		},
		success : didGetAllStores
	});
	//todo - check if location services is enabled. If yes, send the 'sort-by' accordingly
}

function didGetAllStores(result) {
	//reset all the rows
	if (rows.length) {
		resetTable();
		rows = [];
	}

	//process data from server
	Alloy.Collections.stores.reset(result.data.stores);

	//loop data for rows
	Alloy.Collections.stores.each(function(store) {
		store.set({
			title : store.get("addressline1"),
			subtitle : store.get("addressline2"),
		    detailTitle : store.get("searchdistance") + " mi",
		    iconClass : Number(store.get("ishomepharmacy")) ? "icon-favorite" : Number(store.get("isbookmarked")) ? "content-positive-left-icon" : ""
		});  
		var row = Alloy.createController("itemTemplates/masterDetailWithLIcon", store.toJSON()).getView();	
		rows.push(row);
	});

	updateTable();
	uihelper.getLocation(loadMap);	
}

function updateTable() {
	//add valid rows to table
	/*var data = [];
	_.each(rows, function(row)
	{
		data.push(row);
	});*/
	
	$.tableView.setData(rows, {
		animated : true
	});
}

function resetTable() {
	//remove all rows from table
	$.tableView.setData([], {
		animated : true
	});
}

function didReturn(e) {
	if (OS_ANDROID) {
		$.searchbar.blur();
	}
	if ($.searchbar.getValue() != "") {
		uihelper.getLocation(didSearch);
	}
}

function didSearch(currentLocation) {
	http.request({
		method : "stores_advanced_search",
		data : {
			request : {
				advsearchpharmacy : {
					searchstring : $.searchbar.getValue(),
					storeid : "",
					fetchalldetails : 1,
					pagesize : 15,
					pagenumber : 1,
					latitude : currentLocation.latitude || "",
					longitude : currentLocation.longitude || "",
					fetchalldetails : 1,
					featurecode : "TH054"
				}
			}
		},
		passthrough : currentLocation,
		format : "xml",
		success : didGetStores,
		failure : didFailure
	});
}

function didFailure() {
	Alloy.Collections.stores.reset([]);
	loadMap();
}

function didGetStores(result, currentLocation) {
	var distanceEnabled = !_.isEmpty(currentLocation),
	    pharmacies = result.pharmacy;
	for (var i in pharmacies) {
		var pharmacy = pharmacies[i];
		pharmacy.addressline1 = utilities.ucword(pharmacy.addressline1);
		pharmacy.favorite = Number(pharmacy.ishomepharmacy) ? icons.home : Number(pharmacy.bookmarked) ? icons.favorite : "";
		pharmacy.subtitle = utilities.ucfirst(pharmacy.city) + ", " + pharmacy.state + " " + pharmacy.zip;
		pharmacy.distance_enabled = distanceEnabled;
		if (distanceEnabled) {
			pharmacy.distance = pharmacy.distance + " mi";
		}
	}
	Alloy.Collections.stores.reset(pharmacies);
	loadMap(distanceEnabled);
}

function didClickRightNavBtn() {
	uihelper.getLocation(loadMap);	
}

function loadMap(directionEnabled) {

	var Map = Alloy.Globals.Map,
	    totalLocations = Alloy.Collections.stores.length,
	    annotations = [],
	    minLongi = null,
	    minLati = null,
	    maxLongi = null,
	    maxLati = null;

	Alloy.Collections.stores.map(function(model) {
		var data = model.toJSON(),
		    latitude = Number(data.latitude),
		    longitude = Number(data.longitude);
		if (minLati == null || minLati > latitude) {
			minLati = latitude;
		} else if (maxLati == null || maxLati < latitude) {
			maxLati = latitude;
		}

		if (minLongi == null || minLongi > longitude) {
			minLongi = longitude;
		} else if (maxLongi == null || maxLongi < longitude) {
			maxLongi = longitude;
		}

		var properties = {
			image : uihelper.getImage("map_pin").image,
			storeId : data.storeid,
			title : data.addressline1,
			subtitle : data.subtitle,
			latitude : latitude,
			longitude : longitude
		};

		if (OS_IOS) {
			_.extend(properties, {
				rightView : getMapIcon("/images/map_right_button.png", "rightPane", data.storeid)
			});
			if (directionEnabled) {
				_.extend(properties, {
					leftView : getMapIcon("/images/map_left_button.png", "leftPane", data.storeid)
				});
			}
		} else {
			_.extend(properties, {
				rightButton : "/images/map_right_button.png"
			});
			if (directionEnabled) {
				_.extend(properties, {
					leftButton : "/images/map_left_button.png"
				});
			}
		}

		annotations.push(Map.createAnnotation(properties));

	});

	$.mapView.annotations = annotations;
	var ltDiff = (maxLati || minLati) - minLati,
	    lgDiff = (maxLongi || minLongi) - minLongi,
	    delta = ltDiff > lgDiff ? ltDiff : lgDiff;
	if (totalLocations > 0 && delta > 0) {
		$.mapView.setLocation({
			animate : true,
			latitude : ((maxLati + minLati) / 2),
			longitude : ((maxLongi + minLongi) / 2),
			latitudeDelta : delta,
			longitudeDelta : delta,
		});
	}
}

function getMapIcon(image, clicksource, storeId) {
	var view = Ti.UI.createView({
		width : 30,
		height : 30,
		backgroundImage : image,
		clicksource : clicksource,
		storeId : storeId
	});
	view.addEventListener("click", didAnnotationClick);
	return view;
}

function didToggle(e) {
	$.searchbar.blur();
	var lVisible = $.tableView.visible;
	$.tableView.visible = !lVisible;
	$.mapView.visible = lVisible;
	$.toggleBtn.title = lVisible ? icons.list : icons.map;
	
}

function didAnnotationClick(e) {
	var annotation = e.annotation || e.source;
	if (annotation) {
		var clicksource = e.clicksource || annotation.clicksource;
		switch(clicksource) {
		case "rightPane":
		case "infoWindow":
		case "title":
		case "subtitle":
			if (args.orgin) {
				updateStoreAndClose(annotation.storeId);
			} else {
				openStoreDetail(annotation.storeId);
			}
			break;
		case "leftPane":
			var stores = Alloy.Collections.stores.where({
				storeid : annotation.storeId
			});
			if (stores.length) {
				uihelper.getDirection(stores[0].get("latitude") + "," + stores[0].get("longitude"));
			}
			break;
		}
	}
}

function didItemClick(e) {
	var rowId = e.row.rowId;
	if (args.orgin) {
		updateStoreAndClose(rowId);
	} else {
		openStoreDetail(rowId);
	}
}

function updateStoreAndClose(storeId) {
	Alloy.Models.store.set(Alloy.Collections.stores.where({
	storeid: storeId
	})[0].toJSON());
	app.navigator.close();
}

function openStoreDetail(storeId) {
	app.navigator.open({
		ctrl : "storeDetail",
		titleid : "titleStoreDetails",
		ctrlArguments : {
			storeId : storeId
		},
		stack : true
	});
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
