var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    locale = require("localization"),
    languages = locale.getLanguages(),
    lngStrs = Alloy.Globals.strings;

function init() {
	var templates = [],
	    lngs = [],
	    i = 0,
	    selectedIndex = 0;
	_.each(Alloy.Globals.homePageTemplates, function(obj) {
		var template = _.pick(obj, ["title"]);
		template.index = i;
		templates.push(template);
		i++;
	});
	$.templateDp.setChoices(templates);
	$.templateDp.setSelectedIndex(Alloy.Globals.templateIndex);
	i = 0;
	_.each(languages, function(obj) {
		var lng = _.pick(obj, ["titleid"]);
		_.extend(lng, {
			title : lngStrs[lng.titleid]
		});
		lngs.push(lng);
		if (obj.selected) {
			selectedIndex = i;
		}
		i++;
	});
	$.languageDp.setChoices(lngs);
	$.languageDp.setSelectedIndex(selectedIndex);
}

function setParentViews(view) {
	$.templateDp.setParentView(view);
	$.languageDp.setParentView(view);
}

function didReturnTemplate(e) {
	Alloy.Globals.templateIndex = $.templateDp.getSelectedIndex();
}

function didReturnLanguage(e) {
	locale.setLanguage($.languageDp.getSelectedItem().code);
	app.navigator.open({
		titleid : "titleHome",
		ctrl : "home"
	});
}

function didClickAbout() {
	dialog.show({
		message : 'Powered by mscripts \n' + "Application Version: " + Ti.App.version + "\n" + "Build Date: " + Ti.App.Properties.getString('buildDate'),
		title : Alloy.Globals.strings.strAbout
	});
}

exports.init = init;
exports.setParentViews = setParentViews;

