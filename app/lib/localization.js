var Alloy = require("alloy"),
    scule = require("com.scule"),
    resources = require("resources"),
    utilities = require("utilities"),
    logger = require("logger");

/**
 * * load the selected language from Scule DB into Alloy.Globals.strings
 * * allow to switch to new language
 * * get all languages
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
	 * @param {String} _code The language code to enable
	 */
	setLanguage : function(_code) {

		var lColl = scule.factoryCollection(resources.pathLanguages),

		    toSelect = lColl.find({
			code : _code
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
			logger.i("language unselected : len " + unselected.length, " = " + unselected[0].code);

			/**
			 * set selected as true for given language
			 */
			var selected = lColl.update({
				code : _code
			}, {
				$set : {
					selected : true
				}
			});
			logger.i("language selected : len " + selected.length, " = " + selected[0].code);

			Locale.applyLanguage(selected[0]);

			lColl.commit();

			return true;

		} else {
			return false;
		}
	},

	/**
	 * updates the version of language
	 * @param {Function} _callback function to be called once update is done
	 * @param {String} _code code of the language to update, (optional) if not specified current language will be updated
	 */
	update : function(_callback, _code) {

		var code = _code || Locale.currentLanguage.code,

		    lColl = scule.factoryCollection(resources.pathLanguages),

		    toUpdate = lColl.find({
			code : code,
			update : true
		});

		if (toUpdate.length != 0) {
			toUpdate = toUpdate[0];
			//code to update language
		} else {
			if (_callback) {
				_callback(false);
			}
		}
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
	 * return {Array} languages The supported languages
	 */
	getLanguages : function(_key) {
		return scule.factoryCollection(resources.pathLanguages).findAll();
	},

	/**
	 * get languages
	 * @param {Object} _language The current language
	 */
	applyLanguage : function(_language) {
		Locale.currentLanguage = _language;
		Alloy.Globals.strings = _language.strings;
		logger.i("language selected : " + Locale.currentLanguage.code);
	}
};

module.exports = Locale;
