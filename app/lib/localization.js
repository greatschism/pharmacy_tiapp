var Alloy = require("alloy"),
    scule = require("com.scule"),
    resources = require("resources"),
    utilities = require("utilities"),
    logger = require("logger");

/**
 * Does the following actions
 * * load the selected language from Scule DB into Alloy.Globals.strings
 * * allow to switch to different language
 * * get all languages
 * * get value of key pair
 */

var Locale = {

	/**
	 * the language that is being used by app
	 */
	currentLanguage : {},

	/**
	 * initialize localization
	 */
	init : function() {
		var lColl = scule.factoryCollection(resources.pathLanguages);
		Locale.applyLanguage(lColl.find({
		selected : true
		})[0]);
	},

	/**
	 * change selected language
	 * @param {String} _id The language id to enable
	 */
	setLanguage : function(_id) {

		var lColl = scule.factoryCollection(resources.pathLanguages),

		    toSelect = lColl.find({
			id : _id
		});

		if (toSelect.length != 0 && toSelect[0].selected == false) {

			toSelect = toSelect[0];

			/**
			 * unset current language
			 */
			var unselected = lColl.update({
				selected : true
			}, {
				$set : {
					selected : false
				}
			});
			logger.i("language unselected : len " + unselected.length, " = " + unselected[0].id);

			/**
			 * set selected as true for given language
			 */
			var selected = lColl.update({
				id : _id
			}, {
				$set : {
					selected : true
				}
			});
			logger.i("language selected : len " + selected.length, " = " + selected[0].id);

			Locale.applyLanguage(selected[0]);

			lColl.commit();

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
		return scule.factoryCollection(resources.pathLanguages).findAll();
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
		logger.i("language selected : " + Locale.currentLanguage.id);
	}
};

module.exports = Locale;
