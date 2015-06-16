var Alloy = require("alloy"),
    app = require("core"),
    http = require("requestwrapper");

describe("RequestWrapper Test Suite", function() {

	it("Test Case 1: request", function(done) {
		this.timeout(Alloy.CFG.http_timeout);
		var showLoader = false,
		    hideLoader = false;
		http.request({
			method : "appload_get",
			params : {
				data : [{
					appload : {
						phone_model : Ti.Platform.model,
						phone_os : Ti.Platform.osname,
						phone_platform : app.device.platformCode,
						device_id : "x",
						carrier : Ti.Platform.carrier,
						app_version : Ti.App.version,
						client_name : Alloy.CFG.client_name
					}
				}]
			},
			forceRetry : false,
			retry : false,
			errorDialogEnabled : false,
			passthrough : "appload_get",
			showLoaderCallback : function() {
				showLoader = true;
			},
			hideLoaderCallback : function() {
				hideLoader = true;
			},
			success : function(result, passthrough) {
				result.should.be.instanceof(Object);
				passthrough.should.be.equal("appload_get");
			},
			failure : function(error, passthrough) {
				error.should.be.instanceof(Object);
				passthrough.should.be.equal("appload_get");
			},
			done : function(passthrough) {
				showLoader.should.be.equal(true);
				hideLoader.should.be.equal(true);
				passthrough.should.be.equal("appload_get");
				done();
			}
		});
	});

});
