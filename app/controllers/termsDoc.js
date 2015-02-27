var args = arguments[0] || {},
    app = require("core");

function init() {
	$.webView.applyProperties({
		top : 0,
		bottom : Alloy.TSS.btn_padding_top.top + Alloy.TSS.margin_bottom.bottom + Alloy.TSS.primary_btn.height,
		url : args.agreement_url
	});
}

function didClickDone(e) {
	app.navigator.close();
}

exports.init = init;
