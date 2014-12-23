var Alloy = require("alloy"),
    Scule = require("com.scule"),
    Utilities = require("utilities");

var Locale = {

	/**
	 * storage engine & path to scule collection
	 */
	path : "scule+titanium://languages",

	/**
	 * the language that is being used by app
	 */
	currentLanguage : {},

	/**
	 * initialize localization
	 */
	init : function(languages) {

		var lColl = Scule.factoryCollection(Locale.path);

		/**
		 * check whether there is a change in app version
		 */
		if (Ti.App.Properties.getString("updatedLangFileOn", "") != Ti.App.version || Ti.App.deployType != "production") {

			/**
			 * get the languages supported by app from Alloy.CFG
			 */
			var cfgLangs = languages || Alloy.CFG.languages,

			    defaultLng = _.clone(_.findWhere(cfgLangs, {
				selected : true
			}) || cfgLangs[0]);

			_.each(cfgLangs, function(cfgLang) {

				/**
				 * add / update supported languages
				 */
				if (!_.has(cfgLang, "strings")) {
					_.extend(cfgLang, JSON.parse(Utilities.getFile("languages/" + cfgLang.code + ".json") || "{}"));
				}

				var langObj = lColl.find({
				code : cfgLang.code
				})[0] || {};

				//console.log("check collection : ", langObj.code);

				if (_.isEmpty(langObj)) {

					_.extend(cfgLang, {
						selected : false
					});

					var created = lColl.save(cfgLang);

					//console.log("language created : ", cfgLang._id);

				} else {

					_.extend(langObj, _.omit(cfgLang, ["selected"]));

					var updated = lColl.update({
						code : langObj.code
					}, {
						$set : _.omit(langObj, ["_id"])
					}, {}, true);

					//console.log("language updated : ", updated[0].code);

				}

			});

			/**
			 * remove unsupported languages
			 */
			var supported = _.pluck(cfgLangs, "code");
			//console.log("language supported : ", supported);

			var removed = lColl.remove({
				code : {
					$nin : supported
				}
			});
			//console.log("language removed : ", removed);

			/**
			 * check for selected language, if nothing select default
			 */
			var selected = lColl.find({
				selected : true
			});
			if (selected.length == 0) {
				selected = lColl.update({
					code : defaultLng.code
				}, {
					$set : {
						selected : true
					}
				});
			}
			Locale.applyLanguage(selected[0]);

			/**
			 * commit changes
			 */
			lColl.commit();

			Ti.App.Properties.setString("updatedLangFileOn", Ti.App.version);

		} else {

			Locale.applyLanguage(lColl.find({
			selected : true
			})[0]);

		}

	},

	/**
	 * change selected language
	 * @param {String} _code The language code to enable
	 */
	setLanguage : function(_code) {

		var lColl = Scule.factoryCollection(Locale.path),

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
			//console.log("language unselected : len ", unselected.length, " = ", unselected[0].code);

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
			//console.log("language selected : len ", selected.length, " = ", selected[0].code);

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

		    lColl = Scule.factoryCollection(Locale.path),

		    toUpdate = lColl.find({
			code : code
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
		return Scule.factoryCollection(Locale.path).findAll();
	},

	/**
	 * get languages
	 * @param {Object} _language The current language
	 */
	applyLanguage : function(_language) {
		Locale.currentLanguage = _language;
		Alloy.Globals.strings = _language.strings;
		//console.log("language selected : ", Locale.currentLanguage);
	}
};

module.exports = Locale;
