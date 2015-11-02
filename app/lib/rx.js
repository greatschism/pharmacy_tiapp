/**
 * Validations for Rx Number
 */
var TAG = "RX",
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

/**
 *
 * @param {Number} reminderId
 * @param {Object} prescription
 * @param {Function} success
 * @param {Function} cancel
 *
 * While setting up multiple reminders for
 * same prescription a alert should be thrown
 */
function hasMedReminder(reminderId, prescription, success, cancel) {
	var exists = false,
	    prescId = prescription.id;
	Alloy.Collections.remindersMed.some(function(model) {
		exists = model.get("id") != reminderId && _.indexOf(_.pluck(model.get("prescriptions"), "id"), prescId) != -1;
		return exists;
	});
	if (exists) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgPrescriptionHasMedReminder,
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
exports.canRefill = canRefill;
exports.hasMedReminder = hasMedReminder;
