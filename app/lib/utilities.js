/**
 * Utility functions class
 *
 * @class utilities
 */

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
	 * @param {String} _name Name of the property
	 * @param {String/Bool/Int/Double/Object/List} _default default value to return
	 * @param {String} _type Type of the property such as string (default), int, object, list or bool - (optional)
	 * @param {Boolen} _isEncrypted Whether it is encrypted value, default to true (optional)
	 */
	getProperty : function(_name, _default, _type, _isEncrypted) {
		var type = _type || "string";
		if (type == "object" || type == "list") {
			type = "string";
		} else if (type == "int" || type == "bool") {
			_isEncrypted = false;
		}
		var value = Ti.App.Properties["get" + Utility.ucfirst(type)](_name);
		if (!_.isUndefined(value) && !_.isNull(value)) {
			if (_isEncrypted !== false) {
				value = require("encryptionUtil").decrypt(value);
			}
			if (_type == "object" || _type == "list") {
				value = JSON.parse(value);
			}
			return value;
		} else {
			return !_.isUndefined(_default) ? _default : "";
		}
	},

	/**
	 * Set the property value in Ti.App.Properties
	 * @param {String} _name Name of the property
	 * @param {String} _value Value for the property
	 * @param {String} _type Type of the property such as string (default), int, object, list or bool - (optional)
	 * @param {Boolen} _isEncrypted Whether it is encrypted value, default to true (optional)
	 */
	setProperty : function(_name, _value, _type, _isEncrypted) {
		var type = _type || "string";
		if (type == "object" || type == "list") {
			type = "string";
			_value = JSON.stringify(_value);
		} else if (type == "int" || type == "bool") {
			_isEncrypted = false;
		}
		if (_isEncrypted !== false) {
			_value = require("encryptionUtil").encrypt(_value);
		}
		Ti.App.Properties["set" + Utility.ucfirst(_type)](_name, _value);
	},

	/**
	 * remove the property from Ti.App.Properties
	 * @param {String} _name Name of the property
	 */
	removeProperty : function(_name) {
		Ti.App.Properties.removeProperty(_name);
	},

	/**
	 * Checks to see if a file exists
	 * @param {String} _path The path of the file to check
	 * @param {String} _directory The base directory of the file to check (optional)
	 */
	fileExists : function(_path, _directory) {
		return Ti.Filesystem.getFile(_directory || Ti.Filesystem.resourcesDirectory, _path).exists();
	},

	/**
	 * Get contents of file
	 * @param {String} _path The path of the file to read
	 * @param {String} _directory The base directory of the file to read (optional)
	 */
	getFile : function(_path, _directory) {
		var file = Ti.Filesystem.getFile(_directory || Ti.Filesystem.resourcesDirectory, _path);
		return file.exists() ? file.read().text : false;
	},

	/**
	 * delete file
	 * @param {String} _path The path of the file to read
	 * @param {String} _directory The base directory of the file to read (optional)
	 */
	deleteFile : function(_path, _directory) {
		var file = Ti.Filesystem.getFile(_directory || Ti.Filesystem.applicationDataDirectory, _path);
		return file.exists() ? file.deleteFile() : false;
	},

	/**
	 * Get contents of directory
	 * @param {String} _path The path of the file to read
	 * @param {String} _directory The base directory of the file to read (optional)
	 */
	getFiles : function(_path, _directory) {
		var file = Ti.Filesystem.getFile(_directory || Ti.Filesystem.resourcesDirectory, _path);
		return file.exists() && file.isDirectory() ? file.getDirectoryListing() : [];
	},

	/**
	 * copy source files to destination
	 * @param {File} _sFile The File to copy
	 * @param {File} _dFile The destination file
	 * @param {Boolean} _remoteBackup whether or not to backup on iCloud (ios only)
	 */
	copyFile : function(_sFile, _dFile, _remoteBackup) {
		if (_sFile.exists()) {
			if (OS_IOS) {
				var flag = _dFile.write(_sFile.read());
				if (_remoteBackup === false) {
					_dFile.setRemoteBackup(false);
				}
				return flag;
			} else {
				return _sFile.copy(_dFile.nativePath);
			}
		} else {
			return false;
		}
	},

	/**
	 * write data to file
	 * @param {File} _dFile The destination file
	 * @param {Blob} _blob The blob object
	 * @param {Boolean} _append whether or not to append file
	 * @param {Boolean} _remoteBackup whether or not to backup on iCloud (ios only)
	 */
	writeFile : function(_dFile, _blob, _remoteBackup, _append) {
		var flag = _dFile.write(_blob, _append || false);
		if (OS_IOS && _remoteBackup === false) {
			_dFile.setRemoteBackup(false);
		}
		return flag;
	},

	getFileName : function(_path) {
		return _path.replace(/\\/g, '/').replace(/.*\//, '');
	},

	getFileBaseName : function(_path) {
		_path = Utility.getFileName(_path);
		return _path.substr(0, _path.lastIndexOf('.')) || _path;
	},

	/**
	 * percentage to actual points
	 * @param {String} _percentage
	 * @param {Number} _number
	 * @return {Number} converted value
	 */
	percentageToValue : function(_percentage, _number) {
		if (_.isString(_percentage) && _percentage.indexOf("%") >= 0) {
			_percentage = (_number / 100) * parseInt(_percentage);
		}
		return _percentage;
	},

	/**
	 * Adds thousands separators to a number
	 * @param {Number} _number The number to perform the action on
	 */
	formatNumber : function(_number) {
		_number = _number + "";

		x = _number.split(".");
		x1 = x[0];
		x2 = x.length > 1 ? "." + x[1] : "";

		var expression = /(\d+)(\d{3})/;

		while (expression.test(x1)) {
			x1 = x1.replace(expression, "$1" + "," + "$2");
		}

		return x1 + x2;
	},

	/**
	 * Adds brackets and hyphens to the mobile number (U.S.A)
	 * @param {Srting} _str The mobile number
	 */
	formatMobileNumber : function(_str) {
		return _str.replace(/\D/g, "").replace(/^(\d\d\d)(\d)/g, "($1) $2").replace(/(\d{3})(\d)/, "$1-$2").slice(0, 14);
	},

	/**
	 * @method ucword
	 * Capitalizes the first character of each word in the string.
	 * @param {String} _text String to capitalize.
	 * @param {Boolen} _transform, default to true Whether or not to transform all other characters to lower case.
	 * @return {String} String with first character of each word capitalized.
	 */
	ucword : function(_text, _transform) {
		if (!_text)
			return _text;
		if (_transform !== false) {
			_text = _text.toLowerCase();
		}
		return (_text + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
			return $1.toUpperCase();
		});
	},

	/**
	 * @method ucfirst
	 * Capitalizes the first character in the string.
	 * @param {String} _text String to capitalize.
	 * @param {Boolen} _transform, default to true Whether or not to transform all other characters to lower case.
	 * @return {String} String with first character capitalized.
	 */
	ucfirst : function(_text, _transform) {
		if (!_text)
			return _text;
		if (_transform !== false) {
			_text = _text.toLowerCase();
		}
		return _text[0].toUpperCase() + _text.substr(1);
	},

	/**
	 * @method lcfirst
	 * Lowercases the first character in the string.
	 * @param {String} _text String to lowercase.
	 * @param {Boolen} _transform, default to true Whether or not to transform all other characters to lower case.
	 * @return {String} String with first character lowercased.
	 */
	lcfirst : function(_text, _transform) {
		if (!_text)
			return _text;
		if (_transform !== false) {
			_text = _text.toLowerCase();
		}
		return _text[0].toLowerCase() + _text.substr(1);
	},

	/**
	 * Escapes a string for SQL insertion
	 * @param {String} _string The string to perform the action on
	 */
	escapeString : function(_string) {
		if ( typeof _string !== "string") {
			return "\"" + _string + "\"";
		}
		return "\"" + _string.replace(/"/g, "'") + "\"";
	},

	/**
	 * Removes HTML entities, replaces breaks/paragraphs with newline, strips HTML, trims
	 * @param {String} _string The string to perform the action on
	 */
	cleanString : function(_string) {
		if ( typeof _string !== "string") {
			return _string;
		}
		_string = _string.replace(/&amp;*/ig, "&");
		_string = _string.replace(/\s*<br[^>]*>\s*/ig, "\n");
		_string = _string.replace(/\s*<\/p>*\s*/ig, "\n\n");
		_string = _string.replace(/<a[^h]*href=["']{1}([^'"]*)["']{1}>([^<]*)<\/a>/ig, "$2 [$1]");
		_string = _string.replace(/<[^>]*>/g, "");
		_string = _string.replace(/\s*\n{3,}\s*/g, "\n\n");
		_string = _string.replace(/[^\S\n]{2,}/g, " ");
		_string = _string.replace(/\n[^\S\n]*/g, "\n");
		_string = _string.replace(/^\s+|\s+$/g, "");
		return _string;
	},

	/**
	 * Combination of clean and escape string
	 * @param {String} _string The string to perform the action on
	 */
	cleanEscapeString : function(_string) {
		_string = Utility.cleanString(_string);
		return Utility.escapeString(_string);
	},

	/**
	 * Cleans up nasty XML
	 * @param {String} _string The XML string to perform the action on
	 */
	xmlNormalize : function(_string) {
		_string = _string.replace(/&nbsp;*/ig, " ");
		_string = _string.replace(/&(?!amp;)\s*/g, "&amp;");
		_string = _string.replace(/^\s+|\s+$/g, "");
		_string = _string.replace(/<title>(?!<!\[CDATA\[)/ig, "<title><![CDATA[");
		_string = _string.replace(/<description>(?!<!\[CDATA\[)/ig, "<description><![CDATA[");
		_string = _string.replace(/(\]\]>)?<\/title>/ig, "]]></title>");
		_string = _string.replace(/(\]\]>)?<\/description>/ig, "]]></description>");
		return _string;
	},

	/**
	 * Get random string
	 * @param {Number} _length The length of the string
	 */
	getRandomString : function(_length) {
		var text = "";
		var possible = "0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm";

		for (var i = 0; i < _length; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	},

	/**
	 * Performs a deep clone of an object, returning a pointer to the clone
	 * @param _o the object to clone
	 * @return object
	 */
	clone : function(_o) {
		var c = {};
		if (_.isArray(_o)) {
			c = [];
		}
		for (var a in _o) {
			if ( typeof (_o[a]) === "object") {
				c[a] = Utility.clone(_o[a]);
			} else {
				c[a] = _o[a];
			}
		}
		return c;
	},

	/**
	 * Check if name is valid
	 * @param {String} _str Can be Alphanumeric with only hyphens,apostrophes and spaces and length should be 1-40
	 * returns {Boolean}
	 */
	validateName : function(_str) {
		return /^(?=.*[a-zA-Z])[0-9a-zA-Z-'\s]{1,40}$/.test(_str);
	},

	/**
	 * Check if user name is valid
	 * @param {String} _str Can be Alphanumeric with no special characters and length should be 3-20
	 * returns {Boolean}
	 */
	validateUserName : function(_str) {
		return /^(?=.*[a-zA-Z])[0-9a-zA-Z]{3,20}$/.test(_str);
	},

	/**
	 * Check if email is valid
	 * @param {String} _str
	 * returns {Boolean}
	 */
	validateEmail : function(_str) {
		return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(_str);
	},

	/**
	 * Check whether given string is alphanumeric with at lest 2 numbers and length should be 6-50
	 * @param {String} _str
	 * returns {Boolean}
	 */
	validatePassword : function(_str) {
		return /^(?=(.*\d){2})(?=.*[a-zA-Z])[0-9a-zA-Z_*?-]{6,50}$/.test(_str);
	},

	/**
	 * Check whether given string is a valid mobile number
	 * @param {String} _str
	 * returns {Boolean/String} plain mobile number XXXXXXXXXX if it passes US mobile validation (XXX)XXX-XXXX
	 */
	validateMobileNumber : function(_str) {
		return /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/.test(_str) ? _str.replace(/\D+/g, "") : false;
	},

	/**
	 * Check whether given string is a 10 digit mobile number
	 * @param {String} _str
	 * returns {Boolean}
	 */
	isMobileNumber : function(_str) {
		return /^[0-9]{10}$/.test(_str);
	}
};

module.exports = Utility;
