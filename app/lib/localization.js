/**
 * Does the following actions
 * * load the selected language from Scule DB into Alloy.Globals.strings
 * * allow to switch to different language
 * * get all languages
 * * get value of key pair
 */
var Alloy = require("alloy"),
    _ = require("alloy/underscore")._;

var Locale = {

	/**
	 * the language that is being used by app
	 */
	currentLanguage : {},

	/**
	 * initialize localization
	 */
	init : function() {
		Locale.applyLanguage(require("resources").get("languages",{
		selected : true
		})[0]);
	},

	/**
	 * change selected language
	 * @param {String} id The language id to enable
	 */
	setLanguage : function(id) {
		var resources = require("resources"),
		    toSelect = resources.get("languages",{
		id : id
		})[0] || {};
		if (!_.isEmpty(toSelect) && toSelect.selected === false) {
			toSelect.selected = true;
			resources.set("languages", [toSelect]);
			Locale.applyLanguage(toSelect);
			return true;
		} else {
			return false;
		}
	},

	/**
	 * get languages
	 * return {Array} languages The supported languages
	 */
	getLanguages : function() {
		return require("resources").get("languages");
	},

	/**
	 * get value of key
	 * @param {String} _key The key to fetch
	 */
	getString : function(key) {
		return Locale.currentLanguage.strings[key] || "";
	},

	/**
	 * get languages
	 * @param {Object} _language The current language
	 */
	applyLanguage : function(language) {
		Locale.currentLanguage = language;
		Alloy.Globals.strings = language.strings;
		require("logger").info("language selected : " + Locale.currentLanguage.id);
	}
};

module.exports = Locale;
