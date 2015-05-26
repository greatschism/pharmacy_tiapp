var http = require("http");

describe("HTTP Test Suite", function() {

	it("Test Case 1: request", function(done) {
		this.timeout(30000);
		http.request({
			url : "https://api.github.com/users/mano-mykingdom",
			type : "GET",
			format : "JSON",
			passthrough : "Github",
			success : function(result, passthrough) {
				result.should.be.instanceof(Object);
				passthrough.should.be.equal("Github");
			},
			failure : function(error, passthrough) {
				error.should.be.instanceof(Object);
				passthrough.should.be.equal("Github");
			},
			done : function(passthrough) {
				passthrough.should.be.equal("Github");
				done();
			}
		});
	});

});
