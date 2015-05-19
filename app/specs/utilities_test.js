var utilities = require("utilities");

describe("Utility Test Suite", function() {

	it("Test Case 1: setProperty / getProperty with type boolean", function() {
		utilities.setProperty("testBool", false, "bool", false);
		utilities.getProperty("testBool", true, "bool", false).should.be.equal(false);
	});

	it("Test Case 2: setProperty / getProperty with type int", function() {
		utilities.setProperty("testInt", 100, "int", false);
		utilities.getProperty("testInt", 1, "int", false).should.be.equal(100);
	});

	it("Test Case 3: setProperty / getProperty with type int and encryption as ture. Encryption not supported for int & bool type, so should be handled and stored as unencrypted.", function() {
		utilities.setProperty("testIntEncrypted", 100, "int", true);
		utilities.getProperty("testIntEncrypted", 1, "int", false).should.be.equal(100);
	});

	it("Test Case 4: setProperty / getProperty with type string and no encryption", function() {
		utilities.setProperty("testString", "test", "string", false);
		utilities.getProperty("testString", "default", "string", false).should.be.equal("test");
	});

	it("Test Case 5: setProperty / getProperty with type string and encryption enabled", function() {
		utilities.setProperty("testStringEncrypted", "test", "string", true);
		utilities.getProperty("testStringEncrypted", "default", "string", true).should.be.equal("test");
	});

	it("Test Case 6: setProperty / getProperty with type object and no encryption", function() {
		utilities.setProperty("testObject", {
			name : "test"
		}, "object", false);
		utilities.getProperty("testObject", {}, "object", false).should.have.property("name", "test");
	});

	it("Test Case 7: setProperty / getProperty with type object and encryption enabled", function() {
		utilities.setProperty("testObjectEncrypted", {
			name : "test"
		}, "object", true);
		utilities.getProperty("testObjectEncrypted", {}, "object", true).should.have.property("name", "test");
	});

	it("Test Case 8: removeProperty", function() {
		utilities.removeProperty("testObjectEncrypted");
		utilities.getProperty("testObjectEncrypted", {}, "object", true).should.not.have.property("name", "test");
	});

	it("Test Case 9: writeFile", function() {
		utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "test.txt"), "Unit testing is running").should.be.equal(true);
	});

	it("Test Case 10: getFile", function() {
		utilities.getFile("test.txt", Ti.Filesystem.applicationDataDirectory).should.be.equal("Unit testing is running");
	});

	it("Test Case 11: copyFile", function() {
		if (utilities.fileExists("test_copied.txt", Ti.Filesystem.applicationDataDirectory)) {
			utilities.deleteFile("test_copied.txt", Ti.Filesystem.applicationDataDirectory);
		}
		utilities.copyFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "test.txt"), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "test_copied.txt"), false).should.be.equal(true);
	});

	it("Test Case 12: getFileName", function() {
		utilities.getFileName(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "test.txt").nativePath).should.be.equal("test.txt");
	});

	it("Test Case 13: getFileBaseName", function() {
		utilities.getFileBaseName(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "test.txt").nativePath).should.be.equal("test");
	});

	it("Test Case 14: deleteFile", function() {
		utilities.deleteFile("test.txt", Ti.Filesystem.applicationDataDirectory).should.be.equal(true);
	});

	it("Test Case 15: getFiles", function() {
		utilities.getFiles("/", Ti.Filesystem.applicationDataDirectory).should.be.instanceof(Array);
	});

	it("Test Case 16: fileExists with valid path", function() {
		utilities.fileExists("test_copied.txt", Ti.Filesystem.applicationDataDirectory).should.be.equal(true);
	});

	it("Test Case 17: fileExists with invalid path", function() {
		utilities.fileExists("copied.txt", Ti.Filesystem.applicationDataDirectory).should.be.equal(false);
	});

	it("Test Case 18: percentageToValue", function() {
		utilities.percentageToValue("50%", 640).should.be.equal(320);
	});

	it("Test Case 19: formatNumber", function() {
		utilities.formatNumber(1250000).should.be.equal("1,250,000");
	});

	it("Test Case 20: formatMobileNumber", function() {
		utilities.formatMobileNumber(1234567890).should.be.equal("(123) 456-7890");
	});

	it("Test Case 21: ucword", function() {
		utilities.ucword("unit testing").should.be.equal("Unit Testing");
	});

	it("Test Case 22: ucfirst", function() {
		utilities.ucfirst("unit testing").should.be.equal("Unit testing");
	});

	it("Test Case 23: lcfirst", function() {
		utilities.lcfirst("Unit testing").should.be.equal("unit testing");
	});

	it("Test Case 24: cleanString", function() {
		utilities.cleanString("A&ampB").should.be.equal("A&B");
	});

	it("Test Case 24: cleanString", function() {
		utilities.cleanString("A&ampB").should.be.equal("A&B");
	});

	it("Test Case 25: getRandomString", function() {
		utilities.getRandomString(10).should.have.lengthOf(10);
	});

	it("Test Case 26: clone", function() {
		var obj = {
			name : "ABC",
			properties : {
				height : 100
			}
		};
		var clonedObj = utilities.clone(obj);
		delete obj.properties;
		clonedObj.should.be.an.instanceOf(Object).and.have.property("properties");
	});

	it("Test Case 27: validateName with valid name", function() {
		utilities.validateName("Sample's NameE1").should.be.equal(true);
	});

	it("Test Case 28: validateName with invalid name", function() {
		utilities.validateName("sabc.jkjk").should.be.equal(false);
	});

	it("Test Case 29: validateUserName with valid username", function() {
		utilities.validateUserName("abc123").should.be.equal(true);
	});

	it("Test Case 30: validateUserName with invalid username", function() {
		utilities.validateUserName("abc-123").should.be.equal(false);
	});

	it("Test Case 31: validateEmail with valid email", function() {
		utilities.validateEmail("abc123@gmail.com").should.be.equal(true);
	});

	it("Test Case 32: validateEmail with invalid email", function() {
		utilities.validateEmail("abc-123").should.be.equal(false);
	});

	it("Test Case 33: validatePassword with valid password", function() {
		utilities.validatePassword("pass?123").should.be.equal(true);
	});

	it("Test Case 34: validatePassword with invalid password", function() {
		utilities.validatePassword("easypassword").should.be.equal(false);
	});

	it("Test Case 35: validateMobileNumber with valid mobile number", function() {
		utilities.validateMobileNumber("(123) 456-7890").should.be.equal("1234567890");
	});

	it("Test Case 36: validateMobileNumber with invalid mobile number", function() {
		utilities.validateMobileNumber("(123) 456-789").should.be.equal(false);
	});

	it("Test Case 37: isMobileNumber with valid mobile number", function() {
		utilities.isMobileNumber("1234567890").should.be.equal(true);
	});

	it("Test Case 38: isMobileNumber with invalid mobile number", function() {
		utilities.isMobileNumber("123456a").should.be.equal(false);
	});

});