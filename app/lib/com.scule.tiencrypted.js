var TAG = "com.scule.tiencrypted",

    logger = require("logger"),

    Scule = require("com.scule"),

    encryptionUtil = require("encryptionUtil"),

    TiEncryptedStorageEngine = function(configuration) {

	Scule.db.classes.StorageEngine.call(this, configuration);

	if (!this.configuration.path) {
		var dbDir = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "db");
		if (!dbDir.exists()) {
			dbDir.createDirectory();
		}
		this.configuration.path = dbDir.nativePath;
	}

	this.setConfiguration = function(configuration) {
		this.configuration = configuration;
		if (!this.configuration.path) {
			var dbDir = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "db");
			if (!dbDir.exists()) {
				dbDir.createDirectory();
			}
			this.configuration.path = dbDir.nativePath;
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
			/**
			 * Decrypt may return invalid json string
			 * incase of any change in encryption key.
			 * (Specifically on android)
			 */
			try {
				var o = JSON.parse(encryptionUtil.decrypt(file.read().text) || "{}");
				if (callback) {
					callback(o);
				}
				return o;
			} catch(error) {
				logger.error(TAG, "Unable to decrypt", error);
				return false;
			}
		}
		return false;
	};

};

try {
	Scule.registerStorageEngine(Alloy.CFG.storage_engine, TiEncryptedStorageEngine);
} catch(error) {
	require("logger").error(TAG, Alloy.CFG.storage_engine, error);
}