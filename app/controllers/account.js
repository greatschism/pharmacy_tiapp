var args = arguments[0] || {};



var didClickAbout = function()
{
	 var dialog = Ti.UI.createAlertDialog({
			    message: 'Powered by mscripts \n' + 
			    		 "Application Version: " + Ti.App.version + "\n" + 
			    		 "Build Date: " + Ti.App.Properties.getString('buildDate'),
			    ok: 'Ok',
			    title: Alloy.Globals.strings.alertTitleAbout
			  });
	 dialog.show();
};

