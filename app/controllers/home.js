var args = arguments[0] || {}, App = require("core");

(function() {
	/*var image = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "/images/my_prescriptions.png");
	 var blob = image.read();
	 var ratio = blob.width / blob.height;
	 console.log(ratio);
	 var width = Ti.Platform.displayCaps.platformWidth;
	 console.log(width);
	 $.image.setImage(blob.imageAsResized(width, Math.round(width / ratio)));*/
})();

function didPrescriptionClick(e) {
	console.log("go to prescription clicked!!!");
	App.Navigator.open(Alloy.Collections.menuItems.at(1).toJSON());
}

function didRefilClick(e) {
	App.Navigator.open({
		ctrl : "refill",
		title : "Order a refill",
		stack : true,
		ctrlArguments : {
			message : "Refill"
		}
	});
}