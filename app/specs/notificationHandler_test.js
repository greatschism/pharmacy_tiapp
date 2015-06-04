var notificationHandler = require("notificationHandler");

describe("NotificationHandler Test Suite", function() {

	it("Test Case 1: init", function(done) {
		this.timeout(Alloy.CFG.location_timeout);
		notificationHandler.init(function(deviceToken) {
			if (!Alloy.Globals.isVirtualDevice) {
				deviceToken.should.be.an.instanceof(String);
			}
			done();
		});
	});

	it("Test Case 2: deviceToken", function() {
		notificationHandler.should.have.property("deviceToken");
	});

});
