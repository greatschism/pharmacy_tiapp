var http = require("requestwrapper");
var alloy = require("alloy"),
    CFG = Alloy.CFG;
//Added test cases for requestwrapper
describe("requestwrapper Test Suite", function() {
	it("requestwrapper for validating http request - positive test case", function() {
		callHttp("DOCTORS_LIST");
	});

	it("requestwrapper for validating http request - negative test case", function() {
		callHttp("junk_method");
	});	
	
	it("requestwrapper for validating http request done method", function() {
		callHttp("DOCTORS_LIST");
	});		
});

function callHttp(method) {
	http.request({
		method : method,
		success : didSuccess,
		failure : didFail,
		done : didComplete,
		passthrough : {
			"status" : "1"
		}
	});
}

function didSuccess(_result) {
	_result.should.be.ok;
	_result.status.should.equal("Success");
}

function didFail(_result) {
	_result.should.be.ok;
}

function didComplete(_result) {
	_result.should.be.ok;
}

