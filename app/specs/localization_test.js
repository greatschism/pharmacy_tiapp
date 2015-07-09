var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    data = require("data/resources").data,
    localization = require("localization");

describe("Localization Test Suite", function() {

	it("Test Case 1: setLanguage with valid code", function() {
		localization.setLanguage("es", (_.findWhere(data, {
			code : "es"
		}) || {}).version || 1);
		localization.currentLanguage.code.should.be.equal("es");
	});

	it("Test Case 2: setLanguage with invalid code", function() {
		localization.setLanguage("esx", (_.findWhere(data, {
			code : "esx"
		}) || {}).version || 1);
		localization.currentLanguage.code.should.be.equal("es");
	});

	it("Test Case 4: switch back to en", function() {
		localization.setLanguage("en", (_.findWhere(data, {
			code : "en"
		}) || {}).version || 1);
		localization.currentLanguage.code.should.be.equal("en");
	});

	it("Test Case 5: getString with strPrefixRx code", function() {
		localization.getString("strNil").should.be.equal("-");
	});

	it("Test Case 6: getString with invalid code", function() {
		localization.getString("invalid").should.be.equal("");
	});

});
