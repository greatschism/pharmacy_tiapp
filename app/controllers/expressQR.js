var args = $.args,
    qrcode = require('ti-qrcode-master/qrcode');

function init() {
	var qrCodeView = new qrcode(args.checkout);
	$.qrHolderView.add(qrCodeView);
}


function didClickDone() {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function backButtonHandler() {
	didClickDone();
}

exports.init = init;
exports.backButtonHandler = backButtonHandler;