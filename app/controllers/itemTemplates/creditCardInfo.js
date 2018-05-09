var args = $.args,
    uihelper = require("uihelper");

(function() {
	
	if (args.hasCard) {
		var creditCardInfo = args.creditCardInfo;
		var cardType = creditCardInfo.paymentType.paymentTypeDesc;
		var lastFourDigits = creditCardInfo.lastFourDigits;
		var infoText = String.format(Alloy.Globals.strings.accountInfoCC, cardType, lastFourDigits);
		$.infolbl.text = infoText;
	} else{
		$.infolbl.text = Alloy.Globals.strings.accountNoCC;
	};

	var rightButtonText = args.rightButtonText;
	$.iconEditLbl.text = rightButtonText;
	
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
