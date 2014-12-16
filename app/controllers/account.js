var args = arguments[0] || {},
    dialog = require("dialog"),
    languages = Alloy.CFG.languages,
    lngStrs = Alloy.Globals.strings;

function init() {
	_.each(languages, function(obj) {
		obj.title = lngStrs[obj.titleid];
	});
	$.languageDp.setChoices(languages);
}


function setParentViews(view) {
	$.languageDp.setParentView(view);
}

function didClickAbout() {
	dialog.show({
		message : 'Powered by mscripts \n' + "Application Version: " + Ti.App.version + "\n" + "Build Date: " + Ti.App.Properties.getString('buildDate'),
		title : Alloy.Globals.strings.alertTitleAbout
	});
}

function didClickLanguage() {
	
Alert("Hi pratibha");
}

exports.init = init;
exports.setParentViews = setParentViews;

