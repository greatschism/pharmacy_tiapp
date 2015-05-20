var apm = require("apm"),
    utilities = require("utilities");

describe("APM Test Suite", function() {

	it("Test Case 1: init with APM disabled", function(_done) {
		//for android wait for serviceready event
		this.timeout(30000);
		Alloy.CFG.APM_ENABLED = false;
		apm.init(function(_enabled) {
			_enabled.should.be.equal(false);
			_done();
		});
	});

	it("Test Case 2: init with APM enabled", function(_done) {
		//for android wait for serviceready event
		this.timeout(30000);
		Alloy.CFG.APM_ENABLED = true;
		apm.init(function(_enabled) {
			_enabled.should.be.equal(true);
			_done();
		}, utilities.getProperty("com-appcelerator-apm-id", "", "string", false), {
			notificationTitle : "UnitTest",
			shouldCollectLogcat : true
		});
	});

	it("Test Case 3: didCrashOnLastAppLoad", function() {
		apm.didCrashOnLastAppLoad().should.be.equal(require("com.appcelerator.apm").didCrashOnLastAppLoad());
	});

	it("Test Case 4: getUUID", function(_done) {
		if (OS_ANDROID) {
			apm.getUUID().should.be.type("string");
		}
		_done();
	});

	it("Test Case 5: setUsername", function(_done) {
		apm.setUsername("ti-mocha");
		_done();
	});

	it("Test Case 6: setOptOutStatus with true", function(_done) {
		apm.setOptOutStatus(true);
		_done();
	});

	it("Test Case 7: setOptOutStatus with false", function(_done) {
		apm.setOptOutStatus(false);
		_done();
	});

	it("Test Case 8: setMetadata", function(_done) {
		apm.setMetadata("testKey", "testValue");
		_done();
	});

	it("Test Case 9: leaveBreadcrumb", function(_done) {
		apm.leaveBreadcrumb("testing leaveBreadcrumb");
		_done();
	});

	it("Test Case 10: logHandledException with valid Error Object", function() {
		apm.logHandledException(new Error("unit test logHandledException")).should.be.equal(true);
	});

	it("Test Case 11: logHandledException with invalid Error Object", function() {
		apm.logHandledException({
			message : "unit test logHandledException"
		}).should.be.equal(false);
	});

});

