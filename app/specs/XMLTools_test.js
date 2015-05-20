var XMLTools = require("XMLTools");

describe("XMLTools Test Suite", function() {

	it("Test Case 1: toJSON with Object at top level", function() {
		XMLTools.toJSON("<response><name>ti-mocha</name></response>").should.be.an.instanceOf(Object).and.have.property("name", "ti-mocha");
	});

	it("Test Case 2: toJSON with Array at top level", function() {
		XMLTools.toJSON("<response><names><name>a</name><name>b</name><name>c</name><name>d</name></names></response>").names.name.should.be.an.instanceOf(Array).and.have.lengthOf(4);
	});

	it("Test Case 3: toXML with Object at top level", function() {
		XMLTools.toXML({
			data : {
				name : "ti-mocha"
			}
		}).should.equal("<data><name>ti-mocha</name></data>");
	});

	it("Test Case 4: toXML with Array at top level", function() {
		XMLTools.toXML({
			data : {
				names : ["a", "b", "c", "d"]
			}
		}).should.equal("<data><names>a</names><names>b</names><names>c</names><names>d</names></data>");
	});

});

