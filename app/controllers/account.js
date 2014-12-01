var args = arguments[0] || {},
    dialog = require("dialog");

function didClickAbout(e) {
	dialog.show({
		title : Alloy.Globals.strings.strAbout,
		message : "Powered by mscripts \nBuild Version: " + Alloy.CFG.buildVersion + "\nBuild Date: " + Alloy.CFG.buildDate + "\nBuild Number: " + Alloy.CFG.buildNumber
	});
}