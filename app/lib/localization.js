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
			var cfgLangs = languages || Alloy.CFG.languages;
			_.each(cfgLangs, function(cfgLang) {

				/**
				 * add / update supported languages
				 */
				if (!_.has(cfgLang, "strings")) {
					_.extend(cfgLang, JSON.parse(Utilities.getFile("languages/" + cfgLang.code + ".json")));
				}

				var langObj = lColl.find({
				code : cfgLang.code
				})[0] || {};

				if (_.isEmpty(langObj)) {

					_.defaults(cfgLang, {
						selected : false
					});

					var created = lColl.save(cfgLang);

					//console.log("language created : ", created);

				} else {

					_.extend(langObj, cfgLang);

					var updated = lColl.update({
						"_id" : langObj["_id"]
					}, {
						$set : langObj
					}, {}, true);

					//console.log("language updated : ", updated);

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
					code : _.findWhere(cfgLangs, {
						selected : true
					}).code
				}, {
					$set : {
						selected : true
					}
				});
			}
			Locale.currentLanguage = selected[0];

			/**
			 * commit changes
			 */
			lColl.commit();

			Ti.App.Properties.setString("updatedLangFileOn", Ti.App.version);

		} else {

			Locale.currentLanguage = lColl.find({
			selected : true
			})[0];

		}

		//console.log("language selected : ", Locale.currentLanguage);
	},

	/**
	 * change selected language
	 * @param {String} _code The language code to enable
	 */
	setLanguage : function(_code) {
		var lColl = Scule.factoryCollection(Locale.path);
		var toSelect = lColl.find({
			code : _code
		});
		if (toSelect.length != 0) {

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
			//console.log("language unselected : ", unselected);

			/**
			 * set selected as true for given language
			 */
			var selected = lColl.update({
				"_id" : toSelect["_id"]
			}, {
				$set : {
					selected : true
				}
			});
			//console.log("language selected : ", selected);

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
		var code = _code || Locale.currentLanguage.code;
		var lColl = Scule.factoryCollection(Locale.path);
		var toUpdate = lColl.find({
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
	 * get value of key;
	 * @param {String} _key The key to fetch
	 */
	getString : function(_key) {
		return Locale.currentLanguage.strings[_key] || "";
	}
};

module.exports = Locale;
