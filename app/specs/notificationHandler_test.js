var notificationHandler = require("notificationHandler");

describe("NotificationHandler Test Suite", function() {

	it("Test Case 1: init", function(done) {
		this.timeout(Alloy.CFG.location_timeout);
		/**
		 * project id is generated only on appload.
		 * Without a gcm project id app might crash.
		 * To avoid crash while running test cases
		 * hard coded a gcm project id
		 */
		Alloy.Models.appload.set("gcmproject_id", "756245245050");
		notificationHandler.init(function(deviceToken) {
			deviceToken.should.be.an.instanceof(String);
			done();
		});
	});

	it("Test Case 2: deviceToken", function() {
		notificationHandler.should.have.property("deviceToken");
	});

});
