var TAG = "ENUT",
    CryptoJS = require("crypto/crypto-js"),
    logger = require("logger"),
    utilities = require("utilities"),
    STATIC_KEY_LENGTH = 8,
    DYNAMIC_KEY_LENGTH = 8,
    IV_LENGTH = 16,
    STATIC_KEY_LENGTH_IN_BYTES = STATIC_KEY_LENGTH * 2,
    DYNAMIC_KEY_LENGTH_IN_BYTES = DYNAMIC_KEY_LENGTH * 2,
    IV_LENGTH_IN_BYTES = IV_LENGTH * 2,
    IV_BYTES_LAST_INDEX = DYNAMIC_KEY_LENGTH_IN_BYTES + IV_LENGTH_IN_BYTES,
    STATIC_KEY = generateStaticKey();

function generateStaticKey() {
	//	ascii to string
	var keys = Alloy.CFG.static_encryption_key;
	for (var i in keys) {
		keys[i] = String.fromCharCode(keys[i]);
	}
	return keys.reverse().join("").hexEncode();
}

function encrypt(plainText) {
	var encryptDynamicKey = CryptoJS.enc.Utf8.parse(utilities.getRandomString(DYNAMIC_KEY_LENGTH)),
	    encryptIV = CryptoJS.lib.WordArray.random(IV_LENGTH),
	    encryptFinalKey = CryptoJS.enc.Hex.parse(STATIC_KEY).concat(encryptDynamicKey),
	    encryptedData = CryptoJS.AES.encrypt(plainText, encryptFinalKey, {
		iv : encryptIV
	}).ciphertext;
	return CryptoJS.enc.Base64.stringify(encryptDynamicKey.concat(encryptIV).concat(encryptedData));
}

function decrypt(cipherText) {
	try {
		cipherText = CryptoJS.enc.Base64.parse(cipherText).toString();
		var decryptFinalKey = CryptoJS.enc.Hex.parse(STATIC_KEY.concat(cipherText.substring(0, DYNAMIC_KEY_LENGTH_IN_BYTES))),
		    decryptIV = CryptoJS.enc.Hex.parse(cipherText.substring(DYNAMIC_KEY_LENGTH_IN_BYTES, IV_BYTES_LAST_INDEX));
		return CryptoJS.AES.decrypt({
			ciphertext : CryptoJS.enc.Hex.parse(cipherText.substring(IV_BYTES_LAST_INDEX))
		}, decryptFinalKey, {
			iv : decryptIV
		}).toString(CryptoJS.enc.Utf8);
	} catch(error) {
		logger.error(TAG, "Unable to decrypt");
		return "";
	}
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
