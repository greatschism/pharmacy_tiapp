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
	 Ti.App.Properties.setString('lang', $.languageDp.getSelectedRow(0).value);
	if(Ti.App.Properties.getString('lang') == 'undefined')
    {
        if(Titanium.Locale.getCurrentLanguage() == 'ja')
        {
            Ti.App.Properties.setString('lang', 'ja');
        }
        else
        {
            Ti.App.Properties.setString('lang', 'en');
        }
    }   
    else
    {
        Ti.App.Properties.setString('lang', Ti.App.Properties.getString('lang'));
    }

}

exports.init = init;
exports.setParentViews = setParentViews;

