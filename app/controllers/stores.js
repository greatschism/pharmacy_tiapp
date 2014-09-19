var args = arguments[0] || {}, App = require("core"), _http = require("http"), _xmlTools = require("XMLTools");

function init() {
	var authorization = Titanium.Geolocation.locationServicesAuthorization || "";
	if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
		alert("You have disallowed Titanium from running geolocation services.");
	} else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
		alert("Your system has disallowed app from running geolocation services.");
	} else {
		if (OS_MOBILEWEB) {
			Ti.Geolocation.MobileWeb.locationTimeout = 10000;
		}
		if (OS_IOS) {
			Ti.Geolocation.purpose = "find nearby pharmacies";
		}
		App.Navigator.showLoader({
			message : "Processing. Please wait"
		});
		Ti.Geolocation.getCurrentPosition(locationCallback);
	}
}

function locationCallback(e) {
	var coords = e.coords || {};
	/*coords = {
	 latitude : 12.9739156,
	 longitude : 77.6172187
	 };*/
	if (coords.latitude) {
		var data = "<request><advsearchpharmacy>";
		var searchStr = $.searchbar.getValue();
		if (searchStr != "") {
			data += "<searchstring>" + searchStr + "</searchstring>";
		}
		data += "<latitude>" + coords.latitude + "</latitude><longitude>" + coords.longitude + "</longitude><storeid></storeid><searchstring></searchstring><fetchalldetails>1</fetchalldetails><pagesize>6</pagesize><pagenumber>1</pagenumber><featurecode>TH054</featurecode></advsearchpharmacy></request>";
		_http.request({
			url : "https://staging.remscripts.com/pdxonphonehandlerv6_3/advsearchpharmacies",
			type : "POST",
			format : "xml",
			success : didSuccess,
			failure : didError,
			done : didFinish,
			data : data
		});
	} else {
		alert("Unable to find your location, please check your settings");
		didFinish();
	}
}

function didSuccess(doc) {
	var errormessage = doc.getElementsByTagName("errormessage");
	if (errormessage.item(0) != null || errormessage.item(0) != undefined) {
		alert(errormessage.item(0).text);
		Alloy.Collections.stores.reset([]);
		return;
	}
	var xmlTools = new _xmlTools(doc);
	var pharmacies = xmlTools.toObject().advsearchpharmacy.pharmacy;
	pharmacies[0].favourite = true;
	for (var i in pharmacies) {
		var pahamacy = pharmacies[i];
		pahamacy.template = pahamacy.favourite ? "favourites" : "nearby";
		pahamacy.subtitle = pahamacy.city + ", " + pahamacy.state + " " + pahamacy.zip;
		pahamacy.distance = pahamacy.distance + " mi away";
	}
	Alloy.Collections.stores.reset(pharmacies);
	loadMap();
}

function didError(http, url) {
	alert("Failed to retrive");
}

function didFinish() {
	App.Navigator.hideLoader();
}

function loadMap(e) {

	var Map = Alloy.Globals.Map, annotations = [];

	var totalLocations = Alloy.Collections.stores.length, minLongi = null, minLati = null, maxLongi = null, maxLati = null;

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
			openStoreDetail(annotation.storeId);
			break;
		case "leftPane":
			break;
		}
	}
}

function didItemClick(e) {
	openStoreDetail( OS_MOBILEWEB ? e.row.itemId : e.itemId);
}

function openStoreDetail(storeId) {
	App.Navigator.open({
		ctrl : "storeDetail",
		title : "Find a store",
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
