var args = arguments[0] || {},
    app = require("core");

function init() {
	$.webView.applyProperties({
		top : 0,
		bottom : Alloy.TSS.form_dropdown.optionPadding.top * 3 + Alloy.TSS.primary_btn.height * 2, //twice the size of the button plus thrice the size of padding
		url : args.agreement_url
	});
	
	$.emailBtn.applyProperties({
		bottom: Alloy.TSS.form_dropdown.optionPadding.top *2 + Alloy.TSS.primary_btn.height
	});
}

function didClickEmail(e) {
	
}

function didClickRevoke(){
	
}

exports.init = init;
