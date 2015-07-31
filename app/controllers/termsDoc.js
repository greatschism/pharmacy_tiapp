var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    isHIPAA;

function init() {
	isHIPAA = ($.args.agreement_name === $.strings.accountsAgreementHIPAA ? true : false);
	$.webView.applyProperties({
		top : Alloy.TSS.primary_btn.height,
		bottom : Alloy.TSS.form_dropdown.optionPadding.top * 2 + Alloy.TSS.primary_btn.height + ( isHIPAA ? Alloy.TSS.primary_btn.height + Alloy.TSS.form_dropdown.optionPadding.top : 0), 
		url : args.agreement_url
	});
	$.acceptedOnLbl.text = $.strings.accountLblAcceptedOn + " " + moment(args.agreement_valid_from).format(Alloy.CFG.date_format);
}

function didClickEmail(){
	
}

exports.init = init;
