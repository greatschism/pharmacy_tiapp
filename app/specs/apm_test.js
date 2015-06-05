var Alloy = require("alloy"),
    apm = require("apm"),
    utilities = require("utilities");

describe("APM Test Suite", function() {

	it("Test Case 1: init with APM disabled", function(done) {
		//for android wait for serviceready event
		this.timeout(Alloy.CFG.http_timeout);
		Alloy.CFG.apm_enabled = false;
		apm.init(function(enabled) {
			enabled.should.be.equal(false);
			done();
		});
	});

	it("Test Case 2: init with APM enabled", function(done) {
		//for android wait for serviceready event
		this.timeout(Alloy.CFG.http_timeout);
		Alloy.CFG.apm_enabled = true;
		apm.init(function(enabled) {
			enabled.should.be.equal(true);
			done();
		}, utilities.getProperty("com-appcelerator-apm-id", "", "string", false), {
			notificationTitle : "UnitTest",
			shouldCollectLogcat : true
		});
	});

	it("Test Case 3: didCrashOnLastAppLoad", function() {
		apm.didCrashOnLastAppLoad().should.be.equal(require("com.appcelerator.apm").didCrashOnLastAppLoad());
	});

	it("Test Case 4: getUUID", function() {
		apm.getUUID().should.be.ok;
	});

	it("Test Case 5: setUsername", function(done) {
		apm.setUsername("ti-mocha");
		done();
	});

	it("Test Case 6: setOptOutStatus with true", function(done) {
		apm.setOptOutStatus(true);
		done();
	});

	it("Test Case 7: setOptOutStatus with false", function(done) {
		apm.setOptOutStatus(false);
		done();
	});

	it("Test Case 8: setMetadata", function(done) {
		apm.setMetadata("testKey", "testValue");
		done();
	});

	it("Test Case 9: leaveBreadcrumb", function(done) {
		apm.leaveBreadcrumb("testing leaveBreadcrumb");
		done();
	});

	it("Test Case 10: logHandledException", function() {
		apm.logHandledException(new Error("unit test logHandledException")).should.be.equal(true);
	});

});

