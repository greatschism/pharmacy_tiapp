var args = arguments[0] || {},
	utilities = require("utilities");

function init(){
	/**
	 * todo - improve this code if there is a better idea to show accept/ decline buttons within the app rather than HTML
	 * 		  which API to call for HIPAA accept / decline 
	 * 		  get styles from umesh for background color of label text
	 */
	var resourceInfo = {
		dataDirectory : "data",
		dataFile : "HIPAA.html"
	};

	utilities.copyFile(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, resourceInfo.dataDirectory + "/" + resourceInfo.dataFile), Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resourceInfo.dataDirectory + "/" + resourceInfo.dataFile), false);
					
	var HIPAAhtmlFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resourceInfo.dataDirectory + "/" + resourceInfo.dataFile);
	
	Ti.App.addEventListener('app:accept', function(e) {
	    alert(e.message); 
	    /**
	     * todo - call API to record HIPAA-accept & call Text signup screen
	     */
	});
	
	Ti.App.addEventListener('app:decline', function(e) {
	    alert(e.message);
	    /**
	     * todo - call API to record HIPAA-decline & call Text signup screen
	     */
	});
	
	$.webView.applyProperties({ 
		url : HIPAAhtmlFile.resolve() 
	});

}

exports.init = init;
