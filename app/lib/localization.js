/**
 * Does the following actions
 * * load the selected language from Scule DB into Alloy.Globals.strings
 * * allow to switch to different language
 * * get all languages
 * * get value of key pair
 */
var Alloy = require("alloy"),
    _ = Alloy._;

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
	 * @param {String} _id The language id to enable
	 */
	setLanguage : function(_id) {
		var resources = require("resources"),
		    toSelect = resources.get("languages",{
		id : _id
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
	getLanguages : function(_key) {
		return require("resources").get("languages");
	},

	/**
	 * get value of key
	 * @param {String} _key The key to fetch
	 */
	getString : function(_key) {
		return Locale.currentLanguage.strings[_key] || "";
	},

	/**
	 * get languages
	 * @param {Object} _language The current language
	 */
	applyLanguage : function(_language) {
		Locale.currentLanguage = _language;
		Alloy.Globals.strings = _language.strings;
		require("logger").info("language selected : " + Locale.currentLanguage.id);
	}
};

module.exports = Locale;
