function init(config) {

	var Alloy = require("alloy"),
	    resources = require("resources"),
	    localization = require("localization");

	//initialization
	require("apm").init();

	/**
	 * Update local db
	 */
	//theme
	var theme;
	if (_.has(config, "theme")) {
		theme = config.theme;
		resources.set("theme", theme);
	} else {
		theme = resources.get("theme");
	}

	//menu
	var menu;
	if (_.has(config, "menu")) {
		menu = config.menu;
		resources.set("menu", menu);
	} else {
		menu = resources.get("menu");
	}

	//template
	var template;
	if (_.has(config, "template")) {
		template = config.template;
		resources.set("template", template);
	} else {
		template = resources.get("template");
	}

	//languages
	var languages;
	if (_.has(config, "languages")) {
		languages = config.languages.items;
		resources.set("languages", languages);
	} else {
		languages = resources.get("languages");
	}

	//fonts
	var fonts;
	if (_.has(config, "fonts")) {
		resources.set("fonts", config.fonts.items);
	}
	//fonts can be platform specific, calling resources.get("fonts") to get the processed fonts for platform running now
	fonts = resources.get("fonts");

	/**
	 * load into memory
	 */
	//styles
	var style = theme.style;
	for (var i in style) {
		Alloy["_".concat(i)] = style[i];
	}

	//menu items
	Alloy.Collections.menuItems.reset(menu.items);

	//template
	Alloy.Models.template.set(template);

	//language was initialized already from alloy.js

	//fonts
	Alloy._fonts = {};
	for (var i in fonts) {
		/**
		 * Ti.App.registerFont - is a method available only with custom SDK build 3.4.1.mscripts and later
		 */
		Ti.App.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "data/fonts/" + fonts[i].name + ".ttf"));
		Alloy._fonts[fonts[i].code] = fonts[i].name;
	}

	/***
	 * check for files to be downloaded
	 */
}

exports.init = init;
