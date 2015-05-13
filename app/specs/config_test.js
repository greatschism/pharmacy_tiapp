var config = require("config");
var resources = require("resources");

describe("Configuration Test Suite", function() {
	it("Configuration (Test Case 1)", function() {
		resources.checkForUpdates().should.be.empty;
	});
	it("Configuration (Test Case 2)", function() {
		config.updateImageProperties.should.be.ok;
	});
	it("Configuration (Test Case 3)", function() {
		config.updateResources.should.be.ok;
	});
	it("Configuration (Test Case 4)", function() {
		config.updateTSS.should.be.ok;
	});
	it("Configuration (Test Case 5)",function(){
		config.load.should.be.ok;
	});
});

