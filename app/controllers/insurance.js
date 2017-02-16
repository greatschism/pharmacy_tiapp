// Arguments passed into this controller can be accessed off of the `$.args` object directly or:
var args = $.args,
    utilities = require('utilities');


function didClickPhoto(e) {
	$.uihelper.getPhoto(didGetPhoto, $.window);
}

function didGetPhoto(blob) {
	/**
	 * keeping this blob in memory around the process
	 * is not a good idea, let's keep it in a file until
	 * we need this back
	 *
	 * image path is used throughout this module
	 * should not be changed
	 */
	
	var smallBlob = blob.imageAsResized(blob.getWidth()*0.4, blob.getHeight()*0.4); 
	$.utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "insurancecard.jpg"), smallBlob, false);
	
	blob = null;
	smallBlob = null;
	
		$.app.navigator.open({
			titleid : "titleInsuranceCard",
			ctrl : "insuranceProfile",
			stack : true
		});
	
}