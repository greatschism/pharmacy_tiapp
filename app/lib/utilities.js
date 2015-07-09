/**
 * Utility functions class
 *
 * @class utilities
 */

var Alloy = require("alloy"),
    _ = require("alloy/underscore")._;

/**
 * String to Hex
 */
String.prototype.hexEncode = function() {
	var i,
	    result = "";
	for ( i = 0; i < this.length; i++) {
		result += this.charCodeAt(i).toString(16);
	}
	return result;
};

/**
 * Hex to String
 */
String.prototype.hexDecode = function() {
	var j,
	    result = "";
	for ( j = 0; j < this.length; j = j + 2) {
		result += String.fromCharCode(parseInt(this.substring(j, j + 2), 16));
	}
	return result;
};

var Utility = {

	/**
	 * Get the property value from Ti.App.Properties
	 * @param {String} name Name of the property
	 * @param {String/Bool/Int/Double/Object/List} defaultValue defaultValue value to return
	 * @param {String} dataType Type of the property such as string (defaultValue), int, object, list or bool - (optional)
	 * @param {Boolen} isEncrypted Whether it is encrypted value, defaultValue to true (optional)
	 */
	getProperty : function(name, defaultValue, dataType, isEncrypted) {
		var type = dataType || "string";
		if (type == "object" || type == "list") {
			type = "string";
		} else if (type == "int" || type == "bool") {
			isEncrypted = false;
		}
		var value = Ti.App.Properties["get" + Utility.ucfirst(type)](name);
		if (!_.isUndefined(value) && !_.isNull(value)) {
			if (isEncrypted !== false) {
				value = require("encryptionUtil").decrypt(value);
			}
			if (dataType == "object" || dataType == "list") {
				value = JSON.parse(value);
			}
			return value;
		} else {
			return !_.isUndefined(defaultValue) ? defaultValue : "";
		}
	},

	/**
	 * Set the property value in Ti.App.Properties
	 * @param {String} name Name of the property
	 * @param {String} value Value for the property
	 * @param {String} dataType Type of the property such as string (defaultValue), int, object, list or bool - (optional)
	 * @param {Boolen} isEncrypted Whether it is encrypted value, defaultValue to true (optional)
	 */
	setProperty : function(name, value, dataType, isEncrypted) {
		var type = dataType || "string";
		if (type == "object" || type == "list") {
			type = "string";
			value = JSON.stringify(value);
		} else if (type == "int" || type == "bool") {
			isEncrypted = false;
		}
		if (isEncrypted !== false) {
			value = require("encryptionUtil").encrypt(value);
		}
		Ti.App.Properties["set" + Utility.ucfirst(type)](name, value);
	},

	/**
	 * remove the property from Ti.App.Properties
	 * @param {String} name Name of the property
	 */
	removeProperty : function(name) {
		Ti.App.Properties.removeProperty(name);
	},

	/**
	 * Checks to see if a file exists
	 * @param {String} path The path of the file to check
	 * @param {String} directory The base directory of the file to check (optional)
	 */
	fileExists : function(path, directory) {
		return Ti.Filesystem.getFile(directory || Ti.Filesystem.resourcesDirectory, path).exists();
	},

	/**
	 * Get contents of file
	 * @param {String} path The path of the file to read
	 * @param {String} directory The base directory of the file to read (optional)
	 */
	getFile : function(path, directory) {
		var file = Ti.Filesystem.getFile(directory || Ti.Filesystem.resourcesDirectory, path);
		return file.exists() ? file.read().text : false;
	},

	/**
	 * delete file
	 * @param {String} path The path of the file to read
	 * @param {String} directory The base directory of the file to read (optional)
	 */
	deleteFile : function(path, directory) {
		var file = Ti.Filesystem.getFile(directory || Ti.Filesystem.applicationDataDirectory, path);
		return file.exists() ? file.deleteFile() : false;
	},

	/**
	 * Get contents of directory
	 * @param {String} path The path of the file to read
	 * @param {String} directory The base directory of the file to read (optional)
	 */
	getFiles : function(path, directory) {
		var file = Ti.Filesystem.getFile(directory || Ti.Filesystem.resourcesDirectory, path);
		return file.exists() && file.isDirectory() ? file.getDirectoryListing() : [];
	},

	/**
	 * copy source files to destination
	 * @param {File} sFile The File to copy
	 * @param {File} dFile The destination file
	 * @param {Boolean} remoteBackup whether or not to backup on iCloud (ios only)
	 */
	copyFile : function(sFile, dFile, remoteBackup) {
		if (sFile.exists()) {
			if (OS_IOS) {
				dFile.write(sFile.read());
				var flag = dFile.exists();
				if (flag && remoteBackup === false) {
					dFile.setRemoteBackup(false);
				}
				return flag;
			} else {
				return sFile.copy(dFile.nativePath);
			}
		} else {
			return false;
		}
	},

	/**
	 * write data to file
	 * @param {File} dFile The destination file
	 * @param {Blob} blob The blob object
	 * @param {Boolean} append whether or not to append file
	 * @param {Boolean} remoteBackup whether or not to backup on iCloud (ios only)
	 */
	writeFile : function(dFile, blob, remoteBackup, append) {
		dFile.write(blob, append || false);
		var flag = dFile.exists();
		if (OS_IOS && flag && remoteBackup === false) {
			dFile.setRemoteBackup(false);
		}
		return flag;
	},

	getFileName : function(path) {
		return path.replace(/\\/g, '/').replace(/.*\//, '');
	},

	getFileBaseName : function(path) {
		path = Utility.getFileName(path);
		return path.substr(0, path.lastIndexOf('.')) || path;
	},

	/**
	 * percentage to actual points
	 * @param {String} percentage
	 * @param {Number} number
	 * @return {Number} converted value
	 */
	percentageToValue : function(percentage, number) {
		if (_.isString(percentage) && percentage.indexOf("%") >= 0) {
			percentage = (number / 100) * parseInt(percentage);
		}
		return percentage;
	},

	/**
	 * Adds thousands separators to a number
	 * @param {Number} number The number to perform the action on
	 */
	formatNumber : function(number) {
		number = number + "";

		x = number.split(".");
		x1 = x[0];
		x2 = x.length > 1 ? "." + x[1] : "";

		var expression = /(\d+)(\d{3})/;

		while (expression.test(x1)) {
			x1 = x1.replace(expression, "$1" + "," + "$2");
		}

		return x1 + x2;
	},

	/**
	 * Adds brackets and hyphens to the phone number (U.S.A)
	 * @param {Srting} str The phone number
	 */
	formatPhoneNumber : function(str) {
		if (!_.isString(str)) {
			str += "";
		}
		return str.replace(/\D/g, "").replace(/^(\d\d\d)(\d)/g, "($1) $2").replace(/(\d{3})(\d)/, "$1-$2").slice(0, 14);
	},

	/**
	 * @method ucword
	 * Capitalizes the first character of each word in the string.
	 * @param {String} text String to capitalize.
	 * @param {Boolen} transform, defaultValue to true Whether or not to transform all other characters to lower case.
	 * @return {String} String with first character of each word capitalized.
	 */
	ucword : function(text, transform) {
		if (!text)
			return text;
		if (transform !== false) {
			text = text.toLowerCase();
		}
		return (text + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
			return $1.toUpperCase();
		});
	},

	/**
	 * @method ucfirst
	 * Capitalizes the first character in the string.
	 * @param {String} text String to capitalize.
	 * @param {Boolen} transform, defaultValue to true Whether or not to transform all other characters to lower case.
	 * @return {String} String with first character capitalized.
	 */
	ucfirst : function(text, transform) {
		if (!text)
			return text;
		if (transform !== false) {
			text = text.toLowerCase();
		}
		return text[0].toUpperCase() + text.substr(1);
	},

	/**
	 * @method lcfirst
	 * Lowercases the first character in the string.
	 * @param {String} text String to lowercase.
	 * @param {Boolen} transform, defaultValue to true Whether or not to transform all other characters to lower case.
	 * @return {String} String with first character lowercased.
	 */
	lcfirst : function(text, transform) {
		if (!text)
			return text;
		if (transform !== false) {
			text = text.toLowerCase();
		}
		return text[0].toLowerCase() + text.substr(1);
	},

	/**
	 * Removes HTML entities, replaces breaks/paragraphs with newline, strips HTML, trims
	 * @param {String} string The string to perform the action on
	 */
	cleanString : function(string) {
		if (!_.isString(string)) {
			return string;
		}
		string = string.replace(/&amp;*/ig, "&");
		string = string.replace(/\s*<br[^>]*>\s*/ig, "\n");
		string = string.replace(/\s*<\/p>*\s*/ig, "\n\n");
		string = string.replace(/<a[^h]*href=["']{1}([^'"]*)["']{1}>([^<]*)<\/a>/ig, "$2 [$1]");
		string = string.replace(/<[^>]*>/g, "");
		string = string.replace(/\s*\n{3,}\s*/g, "\n\n");
		string = string.replace(/[^\S\n]{2,}/g, " ");
		string = string.replace(/\n[^\S\n]*/g, "\n");
		string = string.replace(/^\s+|\s+$/g, "");
		return string;
	},

	/**
	 * Cleans up nasty XML
	 * @param {String} string The XML string to perform the action on
	 */
	xmlNormalize : function(string) {
		string = string.replace(/&nbsp;*/ig, " ");
		string = string.replace(/&(?!amp;)\s*/g, "&amp;");
		string = string.replace(/^\s+|\s+$/g, "");
		string = string.replace(/<title>(?!<!\[CDATA\[)/ig, "<title><![CDATA[");
		string = string.replace(/<description>(?!<!\[CDATA\[)/ig, "<description><![CDATA[");
		string = string.replace(/(\]\]>)?<\/title>/ig, "]]></title>");
		string = string.replace(/(\]\]>)?<\/description>/ig, "]]></description>");
		return string;
	},

	/**
	 * Get random string
	 * @param {Number} length The length of the string
	 */
	getRandomString : function(length) {
		var text = "";
		var possible = "0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm";

		for (var i = 0; i < length; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	},

	/**
	 * Performs a deep clone of an object, returning a pointer to the clone
	 * @param o the object to clone
	 * @return object
	 */
	clone : function(o) {
		var c = {};
		if (_.isArray(o)) {
			c = [];
		}
		for (var a in o) {
			if ( typeof (o[a]) === "object") {
				c[a] = Utility.clone(o[a]);
			} else {
				c[a] = o[a];
			}
		}
		return c;
	},

	/**
	 * Check if name is valid
	 * @param {String} str Can be Alphanumeric with only hyphens,apostrophes and spaces and length should be 1-40
	 * returns {Boolean}
	 */
	validateName : function(str) {
		return /^(?=.*[a-zA-Z])[0-9a-zA-Z-'\s]{1,40}$/.test(str);
	},

	/**
	 * Check if user name is valid
	 * @param {String} str Can be Alphanumeric with no special characters and length should be 3-20
	 * returns {Boolean}
	 */
	validateUserName : function(str) {
		return /^(?=.*[a-zA-Z])[0-9a-zA-Z]{3,20}$/.test(str);
	},

	/**
	 * Check if email is valid
	 * @param {String} str
	 * returns {Boolean}
	 */
	validateEmail : function(str) {
		return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(str);
	},

	/**
	 * Check whether given string is alphanumeric with at lest 2 numbers and length should be 6-50
	 * @param {String} str
	 * returns {Boolean}
	 */
	validatePassword : function(str) {
		return /^(?=(.*\d){2})(?=.*[a-zA-Z])[0-9a-zA-Z_*?-]{6,50}$/.test(str);
	},

	/**
	 * Check whether given string is a valid phone number
	 * @param {String} str
	 * returns {Boolean/String} plain phone number XXXXXXXXXX if it passes US phone validation (XXX)XXX-XXXX
	 */
	validatePhoneNumber : function(str) {
		return /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/.test(str) ? str.replace(/\D+/g, "") : false;
	},

	/**
	 * Check whether given string is a 10 digit phone number
	 * @param {String} str
	 * returns {Boolean}
	 */
	isPhoneNumber : function(str) {
		return /^[0-9]{10}$/.test(str);
	},

	/**
	 * check if object is instanceof Error
	 * Current underscore version 1.6.0 from Alloy 1.6 doesn't support _.isError (Was introduced in underscore 1.8.0)
	 */
	isError : function(obj) {
		return Object.prototype.toString.call(obj) === "[object Error]";
	}
};

module.exports = Utility;
