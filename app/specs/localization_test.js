var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    data = require("data/resources").data,
    localization = require("localization");

describe("Localization Test Suite", function() {

	it("Test Case 1: setLanguage with valid code", function() {
		localization.setLanguage("es", (_.findWhere(data, {
			code : "es"
		}) || {}).param_version || 1);
		localization.currentLanguage.code.should.be.equal("es");
	});

	it("Test Case 2: setLanguage with invalid code", function() {
		localization.setLanguage("esx", (_.findWhere(data, {
			code : "esx"
		}) || {}).param_version || 1);
		localization.currentLanguage.code.should.be.equal("es");
	});

	it("Test Case 4: switch back to en", function() {
		localization.setLanguage("en", (_.findWhere(data, {
			code : "en"
		}) || {}).param_version || 1);
		localization.currentLanguage.code.should.be.equal("en");
	});

	it("Test Case 5: getString with valid code", function() {
		localization.getString("strOK").should.be.equal("OK");
	});

	it("Test Case 6: getString with invalid code", function() {
		localization.getString("invalid").should.be.equal("");
	});

});
