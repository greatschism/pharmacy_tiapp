var config = require("config"),
    _ = require("alloy/underscore");

describe("Config Test Suite", function() {

	it("Test Case 1: init", function() {
		config.init({
			theme : {
				version : 100,
				base_version : 1
			}
		}).should.be.an.instanceof(Array);
	});

	it("Test Case 2: check Alloy.TSS before calling load", function() {
		_.isUndefined(Alloy.TSS).should.equal(true);
	});

	it("Test Case 3: load", function(done) {
		config.load(function() {
			done();
		});
	});

	it("Test Case 4: check Alloy.TSS after calling load", function() {
		Alloy.TSS.should.be.an.instanceof(Object).and.have.property("Window");
	});

	it("Test Case 5: updateTSS", function() {
		var indexTSS = require("alloy/styles/appload");
		indexTSS[0].style.version = 0.1;
		config.updateTSS("appload");
		indexTSS[0].style.version.should.be.equal(Alloy.TSS.Theme.version);
	});

});

