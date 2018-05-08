var args = $.args,
    uihelper = require("uihelper");

(function() {
	var creditCardInfo = args;
	var cardType = creditCardInfo.paymentType.paymentTypeDesc;
	var lastFourDigits = creditCardInfo.lastFourDigits;
	var infoText = String.format(Alloy.Globals.strings.accountInfoCC, cardType, lastFourDigits);
	$.infolbl.text = infoText;
})();

function getParams() {
	return args;
}

function didClickEditCard(e) {
	var source = e.source;
	$.trigger("clickedit", {
		source : $,
		data : args
	});
}

exports.getParams = getParams;
