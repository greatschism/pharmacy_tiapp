var Alloy = require("alloy"),
    app = require("core"),
    http = require("requestwrapper");

describe("RequestWrapper Test Suite", function() {

	it("Test Case 1: request", function(done) {
		this.timeout(Alloy.CFG.HTTP_TIMEOUT);
		var showLoader = false,
		    hideLoader = false;
		http.request({
			method : "APPLOAD_GET",
			params : {
				data : [{
					appload : {
						phone_model : Ti.Platform.model,
						phone_os : Ti.Platform.osname,
						phone_platform : app.device.platform,
						device_id : "x",
						carrier : "x",
						app_version : Ti.App.version,
						client_name : Alloy.CFG.CLIENT_NAME
					}
				}]
			},
			forceRetry : false,
			retry : false,
			errorDialogEnabled : false,
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
