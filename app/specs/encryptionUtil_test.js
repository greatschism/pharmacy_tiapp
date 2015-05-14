var Alloy = require("alloy"),
    encryptionUtil = require("encryptionUtil");

describe("EncryptionUtil Test Suite", function() {

	it("Test Case 1: encrypt / decrypt", function() {
		var strEncrypt = encryptionUtil.encrypt("test string");
		encryptionUtil.decrypt(strEncrypt).should.be.equal("test string");
	});

	it("Test Case 2: decrypt with invalid string", function() {
		encryptionUtil.decrypt("test string").should.be.equal("");
	});

});
