var args = arguments[0] || {};



var didClickAbout = function()
{
	 var dialog = Ti.UI.createAlertDialog({
			    message: 'Powered by mscripts \n' + 
			    		 "Build Version: " + Alloy.CFG.buildVersion + "\n" + 
			    		 "Build Date: " + Alloy.CFG.buildDate + "\n" + 
			    		 "Build Number: " + Alloy.CFG.buildNumber,
			    ok: 'Ok',
			    title: Alloy.Globals.Strings.alertTitleAbout
			  });
	 dialog.show();
};

