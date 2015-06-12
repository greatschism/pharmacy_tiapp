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
		type : "language",
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
		type : "language",
		selected : false,
		code : code,
		version : version
		})[0] || {};
		if (!_.isEmpty(document)) {
			document.selected = true;
			collection.update({
				type : "language",
				selected : true,
				$or : [{
					code : {
						$ne : code
					}
				}, {
					version : {
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
	 * @param {Object} where query object (optional)
	 * return {Array} languages available languages stored in the local db
	 */
	getLanguages : function(where) {
		return require("resources").collection.find(_.extend(where || {}, {
			type : "language"
		}));
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
