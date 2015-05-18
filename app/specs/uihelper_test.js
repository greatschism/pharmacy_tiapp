var uihelper = require("uihelper");
var imageView;

 describe("Uihelper Test Suite", function() {
	 it("Uihelper - Creating Tableview section", function() {
	 	 var Alloy = require('alloy');
 		var $ = Alloy.createController('account', {});
 		 var result;
 		 result = uihelper.createTableViewSection($, "title");
		 (typeof(result) == "object").should.be.true;
 	 });
	it("Uihelper - Getting Image", function() {
		 var Alloy = require('alloy');
 		var $ = Alloy.createController('account', {});
			imageView = $.UI.create("ImageView", {
			apiName : "ImageView",
			image : "/images/logo_white_pl.png"
		});
		uihelper.getImage("logo_white", imageView).should.be.ok;
		(typeof(uihelper.getImage("logo_white", imageView)) == "object").should.be.true;
	});
});

