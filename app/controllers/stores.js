var args = arguments[0] || {},
    app = require("core"),
    http = require("httpwrapper"),
    dialog = require("dialog");

function init() {
	if (OS_ANDROID) {
		$.searchbar.blur();
	}
	var authorization = Titanium.Geolocation.locationServicesAuthorization || "";
	if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
		dialog.show({
			message : "You have disallowed Titanium from running geolocation services."
		});
	} else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
		dialog.show({
			message : "Your system has disallowed app from running geolocation services."
		});
	} else {
		if (OS_MOBILEWEB) {
			Ti.Geolocation.MobileWeb.locationTimeout = 10000;
		}
		if (OS_IOS) {
			Ti.Geolocation.purpose = "Help you to locate the nearest pharmacies.";
		}
		app.navigator.showLoader({
			message : Alloy.Globals.Strings.msgPleaseWait
		});
		Ti.Geolocation.getCurrentPosition(locationCallback);
	}
}

function locationCallback(e) {
	var coords = e.coords || {};
	coords = {
		latitude : 12.9739156,
		longitude : 77.6172187
	};
	if (coords.latitude) {
		http.request({
			method : "advsearchpharmacies",
			data : {
				request : {
					advsearchpharmacy : {
						searchstring : $.searchbar.getValue(),
						storeid : "",
						latitude : coords.latitude,
						longitude : coords.longitude,
						fetchalldetails : 1,
						pagenumber : "",
						pagesize : "",
						featurecode : Alloy.CFG.featurecode
					}
				}
			},
			success : didGetPharmacies
		});
	} else {
		app.navigator.hideLoader();
		dialog.show({
			message : Alloy.Globals.Strings.msgUnableToFindYourGEO
		});
	}
}

function didGetPharmacies(result) {
	var pharmacies = result.advsearchpharmacy.pharmacy;
	for (var i in pharmacies) {
		var pahamacy = pharmacies[i];
		pahamacy.bookmarked = Number(pahamacy.bookmarked);
		pahamacy.template = pahamacy.bookmarked ? "favourite" : "nearby";
		pahamacy.subtitle = pahamacy.city + ", " + pahamacy.state + " " + pahamacy.zip;
		pahamacy.distance = pahamacy.distance + " mi away";
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
			image : "/images/store/annotation.png",
			storeId : data.storeid,
			title : data.addressline1,
			subtitle : data.subtitle,
			latitude : latitude,
			longitude : longitude
		};

		if (OS_IOS) {
			_.extend(properties, {
				leftView : getMapIcon("/images/store/left_button.png", "leftPane", data.storeid),
				rightView : getMapIcon("/images/store/right_button.png", "rightPane", data.storeid)
			});
		} else {
			_.extend(properties, {
				leftButton : "/images/store/left_button.png",
				rightButton : "/images/store/right_button.png"
			});
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
	$.toggleImg.image = lVisible ? "/images/store/list.png" : "/images/store/map.png";
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
			break;
		}
	}
}

function didItemClick(e) {
	var itemId = OS_MOBILEWEB ? e.row.itemId : e.itemId;
	if (args.orgin == "fullSignup") {
		fullsignup(itemId);
	} else {
		openStoreDetail(itemId);
	}
}

function fullsignup(storeId) {
	Alloy.Models.store.set(Alloy.Collections.stores.where({
	storeid: storeId
	})[0].toJSON());
	app.navigator.close();
}

function openStoreDetail(storeId) {
	app.navigator.open({
		ctrl : "storeDetail",
		titleid : "titleFindStore",
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
