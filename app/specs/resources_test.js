var Alloy = require("alloy"),
    resources = require("resources"),
    utilities = require("utilities");

describe("Resources Test Suite", function() {

	it("Test Case 1: init", function() {
		//data manipulation might take time
		this.timeout(Alloy.CFG.http_timeout);
		resources.init();
		utilities.getProperty(Alloy.CFG.resources_updated_on, "", "string", false).should.be.equal(Ti.App.version);
	});

	it("Test Case 2: verify for theme", function() {
		resources.collection.find({
			type : "theme",
			selected : true
		}).should.be.instanceof(Array).and.have.lengthOf(1);
	});

	it("Test Case 3: verify for template", function() {
		resources.collection.find({
			type : "template",
			selected : true
		}).should.be.instanceof(Array).and.have.lengthOf(1);
	});

	it("Test Case 4: verify for menu", function() {
		resources.collection.find({
			type : "menu",
			selected : true
		}).should.be.instanceof(Array).and.have.lengthOf(1);
	});

	it("Test Case 5: verify for fonts", function() {
		resources.collection.find({
			type : "fonts",
			selected : true
		}).should.be.instanceof(Array).and.have.lengthOf(1);
	});

	it("Test Case 6: verify for font", function() {
		resources.collection.find({
			type : "font",
			selected : true
		}).should.be.instanceof(Array);
	});

	it("Test Case 7: verify for images", function() {
		resources.collection.find({
			type : "images",
			selected : true
		}).should.be.instanceof(Array).and.have.lengthOf(1);
	});

	it("Test Case 8: verify for image", function() {
		resources.collection.find({
			type : "image",
			selected : true
		}).should.be.instanceof(Array);
	});

});
