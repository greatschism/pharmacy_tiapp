var http = require("http");

describe("HTTP Test Suite", function() {

	it("Test Case 1: request", function(_done) {
		this.timeout(30000);
		http.request({
			url : "https://api.github.com/users/mano-mykingdom",
			type : "GET",
			format : "JSON",
			passthrough : "Github",
			success : function(_result, _passthrough) {
				_result.should.be.instanceof(Object);
				_passthrough.should.be.equal("Github");
			},
			failure : function(_error, _passthrough) {
				_error.should.be.instanceof(Object);
				_passthrough.should.be.equal("Github");
			},
			done : function(_passthrough) {
				_passthrough.should.be.equal("Github");
				_done();
			}
		});
	});

});
