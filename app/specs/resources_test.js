var Alloy = require("alloy"),
    resources = require("resources"),
    utilities = require("utilities");

describe("Resources Test Suite", function() {

	it("Test Case 1: init", function() {
		//data manipulation might take time
		this.timeout(Alloy.CFG.HTTP_TIMEOUT);
		resources.init();
		utilities.getProperty(Alloy.CFG.RESOURCES_UPDATED_ON, "", "string", false).should.be.equal(Ti.App.version);
	});

	it("Test Case 2: getCollection for theme", function() {
		resources.get("themes", {
			selected : true
		}).should.be.instanceof(Array).and.have.lengthOf(1);
	});

	it("Test Case 3: getCollection for templates", function() {
		resources.get("templates", {
			selected : true
		}).should.be.instanceof(Array).and.have.lengthOf(1);
	});

	it("Test Case 4: getCollection for menus", function() {
		resources.get("menus", {
			selected : true
		}).should.be.instanceof(Array).and.have.lengthOf(1);
	});

	it("Test Case 5: getCollection for fonts", function() {
		resources.get("fonts", {
			file : {
				$exists : true
			}
		}).should.be.instanceof(Array);
	});

	it("Test Case 6: getCollection for images", function() {
		resources.get("images", {
			file : {
				$exists : true
			}
		}).should.be.instanceof(Array);
	});

});
