var Alloy = require("alloy"),
    uihelper = require("uihelper");

describe("UIHelper Test Suite", function() {

	it("Test Case 1: validate accessibility constants", function(done) {
		var consts;
		if (OS_IOS) {
			consts = [Ti.App.iOS.EVENT_ACCESSIBILITY_SCREEN_CHANGED, Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED];
		}
		if (OS_ANDROID) {
			consts = [Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, Ti.App.Android.EVENT_ACCESSIBILITY_FOCUS_CHANGED];
		}
		consts.should.be.instanceof(Array);
	});

	it("Test Case 2: currentLocation before calling getLocation", function() {
		uihelper.currentLocation.should.be.instanceof(Object);
	});

	it("Test Case 3: getLocation", function(done) {
		//getting location first time may be delayed
		this.timeout(Alloy.CFG.http_timeout);
		var locationTimeout;
		//consider as pass when locationServicesAuthorization is AUTHORIZATION_UNKNOWN on iOS
		if (OS_IOS) {
			locationTimeout = setTimeout(function() {
				Ti.Geolocation.locationServicesAuthorization.should.be.equal(Ti.Geolocation.AUTHORIZATION_UNKNOWN);
				done();
			}, Alloy.CFG.location_timeout);
		}
		uihelper.getLocation(function(location) {
			if (locationTimeout) {
				clearTimeout(locationTimeout);
			}
			//object can be empty when location services are not enabled
			location.should.be.instanceof(Object);
			done();
		});
	});

	it("Test Case 4: currentLocation after calling getLocation", function() {
		uihelper.currentLocation.should.be.instanceof(Object);
	});

	it("Test Case 5: getImage with valid image name", function() {
		//uihelper.getImage only works when device width and height at core are set
		require("core").getDeviceDimensions();
		uihelper.getImage("logo").should.be.instanceof(Object).and.have.property("image");
	});

	it("Test Case 6: getImage with invalid image name", function() {
		uihelper.getImage("invalid").should.be.instanceof(Object).and.not.have.property("image");
	});

	it("Test Case 7: getHeightFromChildren", function() {
		var view = Ti.UI.createView({
			top : 10,
			bottom : 10,
			height : Ti.UI.SIZE,
			layout : "vertical"
		});
		for (var i = 1; i <= 2; i++) {
			view.add(Ti.UI.createButton({
				top : 10,
				height : 50
			}));
		}
		uihelper.getHeightFromChildren(view).should.be.equal(120);
		uihelper.getHeightFromChildren(view, true).should.be.equal(140);
		view.layout = "horizontal";
		uihelper.getHeightFromChildren(view).should.be.equal(60);
		uihelper.getHeightFromChildren(view, true).should.be.equal(80);
	});

});

