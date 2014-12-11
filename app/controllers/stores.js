var args = arguments[0] || {},
    app = require("core"),
    icons = Alloy.CFG.icons,
    isBusy = false,
    utilities = require("utilities"),
    http = require("httpwrapper"),
    dialog = require("dialog");

function getLocation(callback) {
	var authorization = Titanium.Geolocation.locationServicesAuthorization || "";
	if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
		dialog.show({
			message : Alloy.Globals.strings.msgGeoAuthorizationDenied
		});
	} else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
		dialog.show({
			message : Alloy.Globals.strings.msgGeoAuthorizationRestricted
		});
	} else {
		if (OS_MOBILEWEB) {
			Ti.Geolocation.MobileWeb.locationTimeout = 10000;
		}
		if (OS_IOS) {
			Ti.Geolocation.purpose = Alloy.Globals.strings.msgGeoPurpose;
		}
		app.navigator.showLoader({
			message : Alloy.Globals.strings.msgPleaseWait
		});
		Ti.Geolocation.getCurrentPosition(function(e) {
			if (e.success && _.isEmpty(e.coords) == false) {
				Alloy.Globals.currentLocation = e.coords;
			}
			if (callback) {
				callback();
			} else {
				didSearch();
			}
		});
	}
}

function didReturn(e) {
	if (OS_ANDROID) {
		$.searchbar.blur();
	}
	if ($.searchbar.getValue() != "") {
		didSearch();
	}
}

function didSearch() {
	http.request({
		method : "advsearchpharmacies",
		data : {
			request : {
				advsearchpharmacy : {
					searchstring : $.searchbar.getValue(),
					storeid : "",
					latitude : Alloy.Globals.currentLocation.latitude || "",
					longitude : Alloy.Globals.currentLocation.longitude || "",
					fetchalldetails : 1,
					pagenumber : "",
					pagesize : "",
					featurecode : "TH054"
				}
			}
		},
		success : didGetPharmacies,
		failure : function() {
			Alloy.Collections.stores.reset([]);
			loadMap();
		}
	});
}

function didGetPharmacies(result) {
	var showDistance = !_.isEmpty(Alloy.Globals.currentLocation);
	var pharmacies = result.advsearchpharmacy.pharmacy;
	for (var i in pharmacies) {
		var pahamacy = pharmacies[i];
		pahamacy.favorite = Number(pahamacy.bookmarked) ? icons.favorite : "";
		pahamacy.subtitle = pahamacy.city + ", " + pahamacy.state + " " + pahamacy.zip;
		pahamacy.showDistance = showDistance;
		if (showDistance) {
			pahamacy.distance = pahamacy.distance + " mi away";
		}
	}
	Alloy.Collections.stores.reset(pharmacies);
	loadMap();
}

function loadMap(e) {

	var Map = Alloy.Globals.Map,
	    annotations = [];

	var totalLocations = Alloy.Collections.stores.length,
	    minLongi = null,
	    minLati = null,
	    maxLongi = null,
	    maxLati = null;

	Alloy.Collections.stores.map(function(model) {

		var data = model.toJSON();

		var latitude = Number(data.latitude);
		var longitude = Number(data.longitude);

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
			image : "/images/annotation.png",
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
			if (!_.isEmpty(Alloy.Globals.currentLocation)) {
				_.extend(properties, {
					leftView : getMapIcon("/images/map_left_button.png", "leftPane", data.storeid)
				});
			}
		} else {
			_.extend(properties, {
				rightButton : "/images/map_right_button.png"
			});
			if (!_.isEmpty(Alloy.Globals.currentLocation)) {
				_.extend(properties, {
					leftButton : "/images/map_left_button.png"
				});
			}
		}

		annotations.push(Map.createAnnotation(properties));

	});

	$.mapView.annotations = annotations;

	var ltDiff = (maxLati || minLati) - minLati;
	var lgDiff = (maxLongi || minLongi) - minLongi;
	var delta = ltDiff > lgDiff ? ltDiff : lgDiff;
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
	var lVisible = $.listContainer.visible;
	$.listContainer.visible = !lVisible;
	$.mapContainer.visible = lVisible;
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
			if (args.orgin == "fullSignup") {
				fullsignup(annotation.storeId);
			} else {
				openStoreDetail(annotation.storeId);
			}
			break;
		case "leftPane":
			var stores = Alloy.Collections.stores.where({
				storeid : annotation.storeId
			});
			if (stores.length) {
				utilities.getDirection(Alloy.Globals.currentLocation, (stores[0].get("latitude") + "," + stores[0].get("longitude")));
			}
			break;
		}
	}
}

function didItemClick(e) {
	var rowId = e.row.rowId;
	if (args.orgin == "fullSignup") {
		fullsignup(rowId);
	} else {
		openStoreDetail(rowId);
	}
}

function fullsignup(storeId) {
	if (!isBusy) {
		isBusy = true;
		Alloy.Models.store.set(Alloy.Collections.stores.where({
		storeid: storeId
		})[0].toJSON());
		app.navigator.close();
	}
}

function openStoreDetail(storeId) {
	if (!isBusy) {
		isBusy = true;
		app.navigator.open({
			ctrl : "storeDetail",
			titleid : "titleStoreDetails",
			ctrlArguments : {
				storeId : storeId
			},
			stack : true
		}, function() {
			isBusy = false;
		});
	}
}

function terminate() {
	$.destroy();
}

exports.init = getLocation;
exports.terminate = terminate;
