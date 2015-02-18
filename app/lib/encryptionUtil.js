var utilities = require("utilities"),
    logger = require("logger"),
    c = require("crypto/core"),
    aes = require("crypto/aes"),
    STATIC_KEY_LENGTH = 8,
    DYNAMIC_KEY_LENGTH = 8,
    IV_LENGTH = 16,
    STATIC_KEY_LENGTH_IN_BYTES = STATIC_KEY_LENGTH * 2,
    DYNAMIC_KEY_LENGTH_IN_BYTES = DYNAMIC_KEY_LENGTH * 2,
    IV_LENGTH_IN_BYTES = IV_LENGTH * 2,
    IV_BYTES_LAST_INDEX = DYNAMIC_KEY_LENGTH_IN_BYTES + IV_LENGTH_IN_BYTES,
    STATIC_KEY = generateStaticKey();

function generateStaticKey() {
	var keys = [48, 51, 57, 54, 91, 55, 82, 50];
	for (var i in keys) {
		keys[i] = String.fromCharCode(keys[i]);
	}
	return keys.reverse().join("").hexEncode();
}

function encrypt(_plainText) {
	var encryptDynamicKey = c.enc.Utf8.parse(utilities.getRandomString(DYNAMIC_KEY_LENGTH)),
	    encryptIV = c.lib.WordArray.random(IV_LENGTH),
	    encryptFinalKey = c.enc.Hex.parse(STATIC_KEY).concat(encryptDynamicKey),
	    encryptedData = aes.encrypt(_plainText, encryptFinalKey, {
		iv : encryptIV
	}).ciphertext;
	return c.enc.Base64.stringify(encryptDynamicKey.concat(encryptIV).concat(encryptedData));
}

function decrypt(_cipherText) {
	try {
		_cipherText = c.enc.Base64.parse(_cipherText).toString();
		var decryptFinalKey = c.enc.Hex.parse(STATIC_KEY.concat(_cipherText.substring(0, DYNAMIC_KEY_LENGTH_IN_BYTES))),
		    decryptIV = c.enc.Hex.parse(_cipherText.substring(DYNAMIC_KEY_LENGTH_IN_BYTES, IV_BYTES_LAST_INDEX));
		return aes.decrypt({
			ciphertext : c.enc.Hex.parse(_cipherText.substring(IV_BYTES_LAST_INDEX))
		}, decryptFinalKey, {
			iv : decryptIV
		}).toString(c.enc.Utf8);
	} catch(ex) {
		logger.e("Unable to decrypt : " + ex);
		return "";
	}
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
