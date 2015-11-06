var Alloy = require("alloy"),
    crashreporter = require("crashreporter"),
    utilities = require("utilities");

describe("CrashReporter Test Suite", function() {

	it("Test Case 1: init with CrashReporter disabled", function(done) {
		//for android wait for serviceready event
		this.timeout(Alloy.CFG.http_timeout);
		Alloy.CFG.crashreporter_enabled = false;
		crashreporter.init(function(enabled) {
			enabled.should.be.equal(false);
			done();
		});
	});

	it("Test Case 2: init with CrashReporter enabled", function(done) {
		//for android wait for serviceready event
		this.timeout(Alloy.CFG.http_timeout);
		Alloy.CFG.crashreporter_enabled = true;
		crashreporter.init(function(enabled) {
			enabled.should.be.equal(true);
			done();
		});
	});

	it("Test Case 3: didCrashOnLastAppLoad", function() {
		crashreporter.didCrashOnLastAppLoad().should.be.equal(require("com.appcelerator.apm").didCrashOnLastAppLoad());
	});

	it("Test Case 4: getUUID", function() {
		//could be null
		crashreporter.getUUID();
		done();
	});

	it("Test Case 5: setUsername", function(done) {
		crashreporter.setUsername("ti-mocha");
		done();
	});

	it("Test Case 6: setOptOutStatus with true", function(done) {
		crashreporter.setOptOutStatus(true);
		done();
	});

	it("Test Case 7: getOptOutStatus should be ture", function(done) {
		crashreporter.getOptOutStatus().should.be.equal(true);
	});

	it("Test Case 8: setMetadata", function(done) {
		crashreporter.setMetadata("testKey", "testValue");
		done();
	});

	it("Test Case 9: leaveBreadcrumb", function(done) {
		crashreporter.leaveBreadcrumb("testing leaveBreadcrumb");
		done();
	});

	it("Test Case 10: logHandledException", function() {
		crashreporter.logHandledException(new Error("unit test logHandledException")).should.be.equal(true);
	});

});

