var localization = require('localization');
var alloy = require("alloy");

describe("Localization Test Suite", function() {
	it("Get the current language - English (Test Case 1)", function() {
		localization.currentLanguage.id="en";
		localization.currentLanguage.id.should.be.equal("en");
	});
	it("Get the current language - Spanish (Test Case 2)", function() {
		localization.currentLanguage.id.should.not.equal("es");
	});
});
