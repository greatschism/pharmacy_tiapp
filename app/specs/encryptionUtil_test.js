var encryptionUtil = require("encryptionUtil");
var alloy = require("alloy");

describe("EncryptionUtil Test Suite", function() {
	it("Enryption Util (Test Case 1)", function() {
		var strEncrypt = encryptionUtil.encrypt("testString");
		encryptionUtil.decrypt(strEncrypt).should.be.equal("testString");
	});
	it("Enryption Util (Test Case 2)", function() {
		encryptionUtil.encrypt("").should.be.ok;
	});
	it("Enryption Util (Test Case 3)", function() {
		encryptionUtil.decrypt("").should.not.be.ok;
	});
}); 