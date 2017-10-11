var args = $.args,
    qrcode = require('ti-qrcode-master/qrcode');

function init() {
	// Ti.API.info("xpress  " + JSON.stringify($.xpressView));
	var qrCodeView = new qrcode('This holds the data of the qr code we are supposed to render');
	// Ti.API.info("qrCodeView  " + JSON.stringify($.qrCodeView));
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