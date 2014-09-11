var args = arguments[0] || {}, App = require("core"), _http = require("http"), _xmlTools = require("XMLTools");

function init(e) {
	var authorization = Titanium.Geolocation.locationServicesAuthorization || "";
	if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
		alert("You have disallowed Titanium from running geolocation services.");
	} else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
		alert("Your system has disallowed app from running geolocation services.");
	} else {
		Ti.Geolocation.getCurrentPosition(locationCallback);
	}
}

function locationCallback(e) {
	if (e.success && e.coords) {
		var coords = e.coords;
		var data = "<request><advsearchpharmacy><latitude>" + coords.latitude + "</latitude><longitude>" + coords.longitude + "</longitude><storeid></storeid><searchstring></searchstring><fetchalldetails>1</fetchalldetails><pagesize>6</pagesize><pagenumber>1</pagenumber><featurecode>TH054</featurecode></advsearchpharmacy></request>";
		_http.request({
			url : "http://mck.emscripts.com/fvonphonehandlerv1/advsearchpharmacies",
			type : "POST",
			format : "xml",
			success : didSuccess,
			error : didError,
			data : data
		});
	} else {
		alert("Unable to find your location, please check your settings");
	}
}

function didSuccess(doc) {
	var errormessage = doc.getElementsByTagName("errormessage");
	if (errormessage.item(0) != null || errormessage.item(0) != undefined) {
		alert(errormessage.item(0).text);
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
	if (OS_MOBILEWEB) {

	} else {
		loadNativeMap();
	}
}

function didError(http, url) {
	alert("Failed to retrive");
}

function loadNativeMap(e) {
	var annotations = [];
	var Map = Alloy.Globals.Map;
	Alloy.Collections.stores.map(function(model) {
		var data = model.toJSON();
		annotations.push(Map.createAnnotation({
			storeId : data.storeid,
			title : data.addressline1,
			subtitle : data.subtitle,
			latitude : data.latitude,
			longitude : data.longitude
		}));
	});
	$.mapView.annotations = annotations;
}

function didToggle(e) {
	$.searchbar.blur();
	var lVisible = $.listContainer.visible;
	$.listContainer.visible = !lVisible;
	$.mapContainer.visible = lVisible;
	$.toggleBtn.title = lVisible ? "list" : "map";
}

function didAnnotationClick(e) {
	var annotation = e.annotation;
	var clicksource = e.clicksource;
	console.log(clicksource);
	if (annotation && clicksource != "pin" && clicksource != null) {
		openStoreDetail(annotation.storeId);
	}
}

function didItemClick(e) {
	openStoreDetail(e.itemId);
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

function terminate(e) {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
