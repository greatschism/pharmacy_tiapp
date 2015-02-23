var args = arguments[0] || {},
    app = require("core");

function init() {
	if (args.agreement_name == "HIPAA") {
		$.addClass($.scrollView, ["vgroup"]);
		$.webView.applyProperties({
			top : 0,
			height : Ti.UI.SIZE,
			url : args.agreement_url
		});
	} else {
		$.addClass($.footerView, ["bottom"]);
		$.webView.applyProperties({
			top : 0,
			bottom : Alloy.TSS.btn_padding_top.top + Alloy.TSS.margin_bottom.bottom + Alloy.TSS.primary_btn.height,
			url : args.agreement_url
		});
	}
}

function didClickDone(e) {
	app.navigator.close();
}

exports.init = init;
