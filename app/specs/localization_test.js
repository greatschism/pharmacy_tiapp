var localization = require("localization");

describe("Localization Test Suite", function() {

	it("Test Case 1: setLanguage with valid code", function() {
		localization.setLanguage("es").should.be.equal(true);
	});

	it("Test Case 2: currentLanguage", function() {
		localization.currentLanguage.code.should.be.equal("es");
	});

	it("Test Case 3: setLanguage with invalid code", function() {
		localization.setLanguage("esx").should.be.equal(false);
	});

	it("Test Case 4: switch back to en", function() {
		localization.setLanguage("en").should.be.equal(true);
	});

	it("Test Case 5: getString with valid code", function() {
		localization.getString("strOK").should.be.equal("OK");
	});

	it("Test Case 6: getString with invalid code", function() {
		localization.getString("invalid").should.be.equal("");
	});

});
