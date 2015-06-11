/**
 * Does the following actions
 * * load the selected language from Scule DB into Alloy.Globals.strings
 * * allow to switch to different language
 * * get all languages
 * * get value of key pair
 */
var TAG = "localization",
    Alloy = require("alloy"),
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
		Locale.currentLanguage = require("resources").collection.find({
		param_type : "language",
		selected : true
		})[0];
		Alloy.Globals.strings = Locale.currentLanguage.data;
		require("logger").debug(TAG, "language selected", Locale.currentLanguage.code);
	},

	/**
	 * change selected language
	 * @param {String} code of the language to enable
	 * @param {Number} version of the language to enable
	 */
	setLanguage : function(code, version) {
		var collection = require("resources").collection,
		    document = collection.find({
		param_type : "language",
		selected : false,
		code : code,
		param_version : version
		})[0] || {};
		if (!_.isEmpty(document)) {
			document.selected = true;
			collection.update({
				param_type : "language",
				selected : true,
				$or : [{
					code : {
						$ne : code
					}
				}, {
					param_version : {
						$ne : version
					}
				}]
			}, {
				$set : {
					selected : false,
					revert : false
				}
			});
			collection.commit();
			Locale.init();
		}
	},

	/**
	 * get languages
	 * return {Array} languages available languages stored in the local db
	 */
	getLanguages : function() {
		return require("resources").collection.find({
			param_type : "language"
		});
	},

	/**
	 * get value of key
	 * @param {String} key The key to fetch
	 */
	getString : function(key) {
		return Locale.currentLanguage.data[key] || "";
	}
};

module.exports = Locale;
