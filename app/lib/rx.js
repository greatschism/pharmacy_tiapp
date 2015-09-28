/**
 * Validations for Rx Number
 */
var TAG = "rx",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    moment = require("alloy/moment"),
    uihelper = require("uihelper");

function format(str) {
	if (!_.isString(str)) {
		str += "";
	}
	/**
	 *  reg exp configurable from theme
	 *  as it depends on client
	 */
	_.each(Alloy.CFG.rx_formatters, function(formatter) {
		str = str.replace(formatter.exp, formatter.value);
	});
	return str.slice(0, Alloy.CFG.rx_length);
}

/**
 * Check whether given string is valid rx number
 * @param {String} str
 * returns {String|Boolean}
 */
function validate(str) {
	/**
	 *  reg exp configurable from theme
	 *  as it depends on client
	 */
	return Alloy.CFG.rx_validator.test(str) ? str.replace(/\D+/g, "") : false;
}

/**
 * Check whether given rx number is a schedule to drug
 * @param {String} str
 * returns {Boolean}
 */
function isSchedule2(str) {
	return Alloy.CFG.rx_schedule_2_validator.test(str);
}

function canRefill(prescription, success, cancel) {
	if (isSchedule2(prescription.rx_number)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgPrescriptionSchedule2,
			cancelIndex : 0,
			cancel : cancel
		});
	} else if (parseInt(prescription.refill_left || 0) === 0) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgPrescriptionRefillLeftNone,
			buttonNames : [Alloy.Globals.strings.dialogBtnContinue, Alloy.Globals.strings.dialogBtnCancel],
			cancelIndex : 1,
			success : success,
			cancel : cancel
		});
	} else if (moment(prescription.expiration_date, Alloy.CFG.apiCodes.date_format).diff(moment(), "days") < 0) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgPrescriptionExpired,
			buttonNames : [Alloy.Globals.strings.dialogBtnContinue, Alloy.Globals.strings.dialogBtnCancel],
			cancelIndex : 1,
			success : success,
			cancel : cancel
		});
	} else if (success) {
		success();
	}
}

exports.format = format;
exports.validate = validate;
exports.isSchedule2 = isSchedule2;
exports.canRefill = canRefill;
