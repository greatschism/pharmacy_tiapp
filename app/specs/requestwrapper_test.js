var http = require("requestwrapper");

describe("RequestWrapper Test Suite", function() {

	it("Test Case 1: request", function(done) {
		this.timeout(30000);
		var showLoader = false,
		    hideLoader = false;
		http.request({
			method : "APPLOAD_GET",
			data : {
				data : [{
					appload : [{
						phone_model : "x",
						phone_os : "x",
						phone_platform : "x",
						device_id : "x",
						carrier : "x",
						app_version : "x",
						client_name : "x",
						client_param_type : "menu",
						client_param_version : "x",
						client_param_base_version : "x"
					}]
				}]
			},
			passthrough : "APPLOAD_GET",
			showLoaderCallback : function() {
				showLoader = true;
			},
			hideLoaderCallback : function() {
				hideLoader = true;
			},
			success : function(result, passthrough) {
				result.should.be.instanceof(Object);
				passthrough.should.be.equal("APPLOAD_GET");
			},
			failure : function(error, passthrough) {
				error.should.be.instanceof(Object);
				passthrough.should.be.equal("APPLOAD_GET");
			},
			done : function(passthrough) {
				showLoader.should.be.equal(true);
				hideLoader.should.be.equal(true);
				passthrough.should.be.equal("APPLOAD_GET");
				done();
			}
		});
	});

});
