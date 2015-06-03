function init() {

	var Scule = require("com.scule"),

	    encryptionUtil = require("encryptionUtil"),

	    TiEncryptedStorageEngine = function(configuration) {

		Scule.db.classes.StorageEngine.call(this, configuration);

		if (!this.configuration.path) {
			this.configuration.path = Ti.Filesystem.applicationDataDirectory;
		}

		this.setConfiguration = function(configuration) {
			this.configuration = configuration;
			if (!this.configuration.path) {
				this.configuration.path = Ti.Filesystem.applicationDataDirectory;
			}
		};

		/**
		 * Writes data to storage
		 * @public
		 * @param {String} name the name of the file to write data to
		 * @param {Object} object the data to write
		 * @param {Function} callback the callback to execute once writing to storage is complete
		 * @returns {Void}
		 */
		this.write = function(name, object, callback) {
			var file = Ti.Filesystem.getFile(this.configuration.path, name);
			file.write(encryptionUtil.encrypt(JSON.stringify(object)));
			if (OS_IOS) {
				file.setRemoteBackup(false);
			}
			if (callback) {
				callback(object);
			}
			return true;
		};

		/**
		 * Reads data from storage
		 * @public
		 * @param {String} name the name of the file to read data from
		 * @param {Function} callback the callback to execute one reading from storage is complete
		 * @returns {Object}
		 */
		this.read = function(name, callback) {
			var file = Ti.Filesystem.getFile(this.configuration.path, name);
			if (file.exists()) {
				var o = JSON.parse(encryptionUtil.decrypt(file.read().text) || "{}");
				if (callback) {
					callback(o);
				}
				return o;
			}
			return false;
		};

	};

	try {
		Scule.registerStorageEngine("tiencrypted", TiEncryptedStorageEngine);
	} catch(error) {
		require("logger").error("tiencrypted:", error);
	}

};

exports.init = init;
