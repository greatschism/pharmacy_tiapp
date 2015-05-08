var encryptionUtil = require("encryptionUtil");
var alloy = require("alloy");

describe("EncryptionUtil Test Suite", function() {
	it("Enryption Util (Test Case 1)", function() {
		var strEncrypt = encryptionUtil.encrypt("testString");
		encryptionUtil.decrypt(strEncrypt).should.be.equal("testString");
	});
}); 