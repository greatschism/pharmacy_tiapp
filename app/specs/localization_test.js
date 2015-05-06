var localization = require('localization');
var alloy = require("alloy");
var currentLanguage = localization.currentLanguage.id;
describe("Localization Test Suite", function() {
	it("Get the current language - Success (Test Case 1)", function() {
		currentLanguage.should.be.equal("en");
	});
	it("Get the current language - Failure (Test Case 2)", function() {
		currentLanguage.should.be.equal("es");
	});
});
