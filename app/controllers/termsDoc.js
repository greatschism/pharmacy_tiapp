var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    app = require("core"),
    isHIPAA;

function init() {
	isHIPAA = ($.args.terms.agreement_name === $.strings.accountsAgreementHIPAA ? true : false);
	$.webView.applyProperties({
		top : $.args.registrationFlow === true ? 0 : Alloy.TSS.primary_btn.height,
		bottom : Alloy.TSS.form_dropdown.optionPadding.top * 2 + Alloy.TSS.primary_btn.height + ( isHIPAA ? Alloy.TSS.primary_btn.height + Alloy.TSS.form_dropdown.optionPadding.top : 0), 
		url : args.terms.agreement_url
	});
	if(!$.args.registrationFlow){
		$.acceptedOnLbl.text = $.strings.accountLblAcceptedOn + " " + moment(args.terms.agreement_valid_from).format(Alloy.CFG.date_format);
	}
	else{
		$.successBtn.title = $.strings.registerBtnTermsDone;
	}
}

function didClickSuccess(){
	if($.args.registrationFlow){
		app.navigator.close();
	}
	else{
		/**
		 * todo - call send email API
		 */
	}
}

exports.init = init;
