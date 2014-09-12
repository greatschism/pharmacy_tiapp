var Alloy = require("alloy");

exports.analytics = function(type, typeDetails1, typeDetails2) 
{
	var returnCode = 0;
	
	if (Alloy.CFG.enableAnalytic) {
		switch(type) 
		{
			case "breadcrumb":
				Alloy.Globals.apm.leaveBreadcrumb(typeDetails1);
				returnCode = 1;
				break;
			case "featureEvent":
				Titanium.Analytics.featureEvent(typeDetails1);
				returnCode = 2;
				break;
			case "navEvent":
				Titanium.Analytics.navEvent(typeDetails1, typeDetails2);
				returnCode = 3;
				break;
			case "default":
				returnCode = -1;
				break;
		}
	}
	
	return returnCode;
};