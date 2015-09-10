/**
 * created to avoid duplication code / logic
 * PHA-799 | PHA-892
 */
var TAG = "refillValidator",
    Alloy = require("alloy"),
    moment = require("alloy/moment"),
    utilities = require("utilities"),
    uihelper = require("uihelper");

function validate(prescription, success, cancel) {
	if (utilities.isRxSchedule2(prescription.rx_number)) {
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

exports.validate = validate;
