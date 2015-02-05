var args = arguments[0] || {},
    app = require("core"),
    config = require("config"),
    resources = require("resources"),
    dialog = require("dialog"),
    colls = [{
	key : "themes",
	selectedItem : {}
}, {
	key : "templates",
	selectedItem : {}
}, {
	key : "languages",
	selectedItem : {}
}],
    lngStrs = Alloy.Globals.strings;

function init() {
	for (var i in colls) {
		var key = colls[i].key,
		    items = resources.get(key),
		    selectedIndex = -1;
		items.forEach(function(item, index) {
			if (_.has(item, "titleid")) {
				item.title = lngStrs[item.titleid];
			} else {
				item.title = item.id;
			}
			if (item.selected) {
				selectedIndex = index;
			}
		});
		colls[i].selectedItem = items[selectedIndex] || {};
		$[key + "Dp"].setChoices(items);
		$[key + "Dp"].setSelectedIndex(selectedIndex);
	}
}

function setParentViews(view) {
	$.themesDp.setParentView(view);
	$.templatesDp.setParentView(view);
	$.languagesDp.setParentView(view);
}

function didReturnThemes(e) {
	colls[0].selectedItem = $.themesDp.getSelectedItem();
}

function didReturnTemplates(e) {
	colls[1].selectedItem = $.templatesDp.getSelectedItem();
}

function didReturnLanguages(e) {
	colls[2].selectedItem = $.languagesDp.getSelectedItem();
}

function didClickApply(e) {
	for (var i in colls) {
		colls[i].selectedItem.selected = true;
		resources.set(colls[i].key, [colls[i].selectedItem]);
	}
	config.load(function() {
		app.navigator.open({
			ctrl : "home",
			titleid : "titleHome"
		});
	});
}

function didClickAbout() {
	dialog.show({
		message : 'Powered by mscripts \n' + "Application Version: " + Ti.App.version + "\n" + "Build Date: " + Ti.App.Properties.getString(Alloy.CFG.BUILD_DATE),
		title : Alloy.Globals.strings.strAbout
	});
}

exports.init = init;
exports.setParentViews = setParentViews;

