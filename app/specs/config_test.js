var config = require("config");

describe("Config Test Suite", function() {

	it("Test Case 1: check Alloy.TSS (assuming config.load is called before running this test case)", function() {
		Alloy.TSS.should.be.an.instanceof(Object).and.have.property("Window");
	});

});

