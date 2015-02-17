/**
 * Utility functions class
 *
 * @class utilities
 */

/**
 * Converts a hex unicode character into a normal character
 */
String.fromCharCodePoint = function() {
	var codeunits = [];

	for (var i = 0; i < arguments.length; i++) {
		var c = arguments[i];

		if (arguments[i] < 0x10000) {
			codeunits.push(arguments[i]);
		} else if (arguments[i] < 0x110000) {
			c -= 0x10000;
			codeunits.push((c >> 10 & 0x3FF) + 0xD800);
			codeunits.push((c & 0x3FF) + 0xDC00);
		}
	}

	return String.fromCharCode.apply(String, codeunits);
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
		var value = Ti.App.Properties["get" + Utility.ucfirst(_type == "object" || _type == "list" ? "string" : _type)](_name);
		if (!_.isUndefined(value) && !_.isNull(value)) {
			if ((OS_IOS || OS_ANDROID) && _isEncrypted !== false) {
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
		if (_type == "object" || _type == "list") {
			_type = "string";
			_value = JSON.stringify(_value);
		}
		if ((OS_IOS || OS_ANDROID) && _isEncrypted !== false) {
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
	copy : function(_sFile, _dFile, _remoteBackup) {
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
	write : function(_dFile, _blob, _remoteBackup, _append) {
		var flag = _dFile.write(_blob, _append || false);
		if (OS_IOS && _remoteBackup === false) {
			_dFile.setRemoteBackup(false);
		}
		return flag;
	},

	getFileName : function(_path) {
		return _path.replace(/\\/g, '/').replace(/.*\//, '');
	},

	getBaseFileName : function(_path) {
		_path = Utility.getFileName(_path);
		return _path.substr(0, _path.lastIndexOf('.')) || _path;
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
	 * Converts a hex color value to HSB
	 * @param {String} _hex The hex color to convert
	 */
	hexToHsb : function(_hex) {
		var result;

		if (_hex.length < 6) {
			result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(_hex);
		} else {
			result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(_hex);
		}

		var hsb = {
			h : 0,
			s : 0,
			b : 0
		};

		if (!result) {
			return hsb;
		}

		if (result[1].length == 1) {
			result[1] = result[1] + result[1];
			result[2] = result[2] + result[2];
			result[3] = result[3] + result[3];
		}

		var rgb = {
			r : parseInt(result[1], 16),
			g : parseInt(result[2], 16),
			b : parseInt(result[3], 16)
		};

		rgb.r /= 255;
		rgb.g /= 255;
		rgb.b /= 255;

		var minVal = Math.min(rgb.r, rgb.g, rgb.b),
		    maxVal = Math.max(rgb.r, rgb.g, rgb.b),
		    delta = maxVal - minVal,
		    del_r,
		    del_g,
		    del_b;

		hsb.b = maxVal;

		if (delta !== 0) {
			hsb.s = delta / maxVal;

			del_r = (((maxVal - rgb.r) / 6) + (delta / 2)) / delta;
			del_g = (((maxVal - rgb.g) / 6) + (delta / 2)) / delta;
			del_b = (((maxVal - rgb.b) / 6) + (delta / 2)) / delta;

			if (rgb.r === maxVal) {
				hsb.h = del_b - del_g;
			} else if (rgb.g === maxVal) {
				hsb.h = (1 / 3) + del_r - del_b;
			} else if (rgb.b === maxVal) {
				hsb.h = (2 / 3) + del_g - del_r;
			}

			if (hsb.h < 0) {
				hsb.h += 1;
			}

			if (hsb.h > 1) {
				hsb.h -= 1;
			}
		}

		hsb.h = Math.round(hsb.h * 360);
		hsb.s = Math.round(hsb.s * 100);
		hsb.b = Math.round(hsb.b * 100);

		return hsb;
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
		return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
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
		_string = Utility.htmlDecode(_string);
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
	 * Decodes HTML entities
	 * @param {String} _string The string to perform the action on
	 */
	htmlDecode : function(_string) {
		var tmp_str = _string.toString();
		var hash_map = Utility.htmlTranslationTable();

		tmp_str = tmp_str.replace(/&#(\d+);/g, function(_, n) {
			return String.fromCharCodePoint(parseInt(n, 10));
		}).replace(/&#x([0-9a-f]+);/gi, function(_, n) {
			return String.fromCharCodePoint(parseInt(n, 16));
		});

		for (var entity in hash_map) {
			var symbol = String.fromCharCode(hash_map[entity]);

			tmp_str = tmp_str.split(entity).join(symbol);
		}

		return tmp_str;
	},

	/**
	 * The HTML entities table used for decoding
	 */
	htmlTranslationTable : function() {
		var entities = {
			"&#x2013;" : "8211",
			"&#x2014;" : "8212",
			"&#x2018;" : "8216",
			"&#x2019;" : "8217",
			"&#xae;" : "174",
			"&amp;" : "38",
			"&bdquo;" : "8222",
			"&bull;" : "8226",
			"&circ;" : "710",
			"&dagger;" : "8224",
			"&Dagger;" : "8225",
			"&fnof;" : "402",
			"&hellip;" : "8230",
			"&ldquo;" : "8220",
			"&lsaquo;" : "8249",
			"&lsquo;" : "8216",
			"&mdash;" : "8212",
			"&ndash;" : "8211",
			"&OElig;" : "338",
			"&oelig;" : "339",
			"&permil;" : "8240",
			"&rdquo;" : "8221",
			"&rsaquo;" : "8250",
			"&rsquo;" : "8217",
			"&sbquo;" : "8218",
			"&scaron;" : "353",
			"&Scaron;" : "352",
			"&tilde;" : "152",
			"&trade;" : "8482",
			"&Yuml;" : "376",
			"&Igrave;" : "204",
			"&igrave;" : "236",
			"&Iota;" : "921",
			"&iota;" : "953",
			"&Iuml;" : "207",
			"&iuml;" : "239",
			"&larr;" : "8592",
			"&lArr;" : "8656",
			"&Aacute;" : "193",
			"&aacute;" : "225",
			"&Acirc;" : "194",
			"&acirc;" : "226",
			"&acute;" : "180",
			"&AElig;" : "198",
			"&aelig;" : "230",
			"&Agrave;" : "192",
			"&agrave;" : "224",
			"&alefsym;" : "8501",
			"&Alpha;" : "913",
			"&alpha;" : "945",
			"&and;" : "8743",
			"&ang;" : "8736",
			"&Aring;" : "197",
			"&aring;" : "229",
			"&asymp;" : "8776",
			"&Atilde;" : "195",
			"&atilde;" : "227",
			"&Auml;" : "196",
			"&auml;" : "228",
			"&Beta;" : "914",
			"&beta;" : "946",
			"&brvbar;" : "166",
			"&cap;" : "8745",
			"&Ccedil;" : "199",
			"&ccedil;" : "231",
			"&cedil;" : "184",
			"&cent;" : "162",
			"&Chi;" : "935",
			"&chi;" : "967",
			"&clubs;" : "9827",
			"&cong;" : "8773",
			"&copy;" : "169",
			"&crarr;" : "8629",
			"&cup;" : "8746",
			"&curren;" : "164",
			"&darr;" : "8595",
			"&dArr;" : "8659",
			"&deg;" : "176",
			"&Delta;" : "916",
			"&delta;" : "948",
			"&diams;" : "9830",
			"&divide;" : "247",
			"&Eacute;" : "201",
			"&eacute;" : "233",
			"&Ecirc;" : "202",
			"&ecirc;" : "234",
			"&Egrave;" : "200",
			"&egrave;" : "232",
			"&empty;" : "8709",
			"&emsp;" : "8195",
			"&ensp;" : "8194",
			"&Epsilon;" : "917",
			"&epsilon;" : "949",
			"&equiv;" : "8801",
			"&Eta;" : "919",
			"&eta;" : "951",
			"&ETH;" : "208",
			"&eth;" : "240",
			"&Euml;" : "203",
			"&euml;" : "235",
			"&euro;" : "8364",
			"&exist;" : "8707",
			"&forall;" : "8704",
			"&frac12;" : "189",
			"&frac14;" : "188",
			"&frac34;" : "190",
			"&frasl;" : "8260",
			"&Gamma;" : "915",
			"&gamma;" : "947",
			"&ge;" : "8805",
			"&harr;" : "8596",
			"&hArr;" : "8660",
			"&hearts;" : "9829",
			"&Iacute;" : "205",
			"&iacute;" : "237",
			"&Icirc;" : "206",
			"&icirc;" : "238",
			"&iexcl;" : "161",
			"&image;" : "8465",
			"&infin;" : "8734",
			"&int;" : "8747",
			"&iquest;" : "191",
			"&isin;" : "8712",
			"&Kappa;" : "922",
			"&kappa;" : "954",
			"&Lambda;" : "923",
			"&lambda;" : "955",
			"&lang;" : "9001",
			"&laquo;" : "171",
			"&lceil;" : "8968",
			"&le;" : "8804",
			"&lfloor;" : "8970",
			"&lowast;" : "8727",
			"&loz;" : "9674",
			"&lrm;" : "8206",
			"&macr;" : "175",
			"&micro;" : "181",
			"&middot;" : "183",
			"&minus;" : "8722",
			"&Mu;" : "924",
			"&mu;" : "956",
			"&nabla;" : "8711",
			"&nbsp;" : "160",
			"&ne;" : "8800",
			"&ni;" : "8715",
			"&not;" : "172",
			"&notin;" : "8713",
			"&nsub;" : "8836",
			"&Ntilde;" : "209",
			"&ntilde;" : "241",
			"&Nu;" : "925",
			"&nu;" : "957",
			"&Oacute;" : "211",
			"&oacute;" : "243",
			"&Ocirc;" : "212",
			"&ocirc;" : "244",
			"&Ograve;" : "210",
			"&ograve;" : "242",
			"&oline;" : "8254",
			"&Omega;" : "937",
			"&omega;" : "969",
			"&Omicron;" : "927",
			"&omicron;" : "959",
			"&oplus;" : "8853",
			"&or;" : "8744",
			"&ordf;" : "170",
			"&ordm;" : "186",
			"&Oslash;" : "216",
			"&oslash;" : "248",
			"&Otilde;" : "213",
			"&otilde;" : "245",
			"&otimes;" : "8855",
			"&Ouml;" : "214",
			"&ouml;" : "246",
			"&para;" : "182",
			"&part;" : "8706",
			"&perp;" : "8869",
			"&Phi;" : "934",
			"&phi;" : "966",
			"&Pi;" : "928",
			"&pi;" : "960",
			"&piv;" : "982",
			"&plusmn;" : "177",
			"&pound;" : "163",
			"&prime;" : "8242",
			"&Prime;" : "8243",
			"&prod;" : "8719",
			"&prop;" : "8733",
			"&Psi;" : "936",
			"&psi;" : "968",
			"&radic;" : "8730",
			"&rang;" : "9002",
			"&raquo;" : "187",
			"&rarr;" : "8594",
			"&rArr;" : "8658",
			"&rceil;" : "8969",
			"&real;" : "8476",
			"&reg;" : "174",
			"&rfloor;" : "8971",
			"&Rho;" : "929",
			"&rho;" : "961",
			"&rlm;" : "8207",
			"&sdot;" : "8901",
			"&sect;" : "167",
			"&shy;" : "173",
			"&Sigma;" : "931",
			"&sigma;" : "963",
			"&sigmaf;" : "962",
			"&sim;" : "8764",
			"&spades;" : "9824",
			"&sub;" : "8834",
			"&sube;" : "8838",
			"&sum;" : "8721",
			"&sup;" : "8835",
			"&sup1;" : "185",
			"&sup2;" : "178",
			"&sup3;" : "179",
			"&supe;" : "8839",
			"&szlig;" : "223",
			"&Tau;" : "932",
			"&tau;" : "964",
			"&there4;" : "8756",
			"&Theta;" : "920",
			"&theta;" : "952",
			"&thetasym;" : "977",
			"&thinsp;" : "8201",
			"&THORN;" : "222",
			"&thorn;" : "254",
			"&tilde;" : "732",
			"&times;" : "215",
			"&Uacute;" : "218",
			"&uacute;" : "250",
			"&uarr;" : "8593",
			"&uArr;" : "8657",
			"&Ucirc;" : "219",
			"&ucirc;" : "251",
			"&Ugrave;" : "217",
			"&ugrave;" : "249",
			"&uml;" : "168",
			"&upsih;" : "978",
			"&Upsilon;" : "933",
			"&upsilon;" : "965",
			"&Uuml;" : "220",
			"&uuml;" : "252",
			"&weierp;" : "8472",
			"&#xA;" : "10",
			"&#xD;" : "13",
			"&Xi;" : "926",
			"&xi;" : "958",
			"&Yacute;" : "221",
			"&yacute;" : "253",
			"&yen;" : "165",
			"&yuml;" : "255",
			"&Zeta;" : "918",
			"&zeta;" : "950",
			"&zwj;" : "8205",
			"&zwnj;" : "8204",
			"&quot;" : "34",
			"&lt;" : "60",
			"&gt;" : "62"
		};

		return entities;
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
				if (_o[a] instanceof RegExp) {
					c[a] = new RegExp(_o[a].toString());
				} else {
					c[a] = Utility.clone(_o[a]);
				}
			} else {
				c[a] = _o[a];
			}
		}
		return c;
	}
};

module.exports = Utility;
