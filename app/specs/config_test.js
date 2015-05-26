var config = require("config"),
    _ = require("alloy/underscore");

describe("Config Test Suite", function() {

	it("Test Case 1: init", function() {
		var result = config.init({
			"theme" : {
				"id" : "newTheme",
				"version" : 1,
				"url" : "https://staging.remscripts.com/nativemia/newTheme.json"
			}
		});
		if (Alloy.CFG.OVERRIDE_REMOTE_RESOURCES) {
			result.should.be.an.instanceof(Array);
		} else {
			result.should.be.an.instanceof(Array).and.have.lengthOf(1);
		}
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
		indexTSS[0].style.id = "ToSomethingElse";
		config.updateTSS("appload");
		indexTSS[0].style.id.should.be.equal(Alloy.TSS.Theme.id);
	});

});

