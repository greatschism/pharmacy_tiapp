var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    app = require("core"),
    http = require("requestwrapper"),
    isHIPAA;

function init() {
	isHIPAA = ($.args.terms.agreement_text === $.strings.accountsAgreementHIPAA ? true : false);
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
	
	if(isHIPAA){
		$.revokeBtn.show();
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

function didClickRevoke(){
	http.request({
		method : "terms_revoke",
		params : {
			feature_code : "THXXX",
			filter:null,
			data:[{
				terms: {
			   		agreement_type: $.args.terms.agreement_type		   
			   	}
			 }]
		},
		success : didRevoke
	});
}

function didRevoke(result){
	$.uihelper.showDialog({
		message : result.message,
		buttonNames : [$.strings.dialogBtnOK],
		success : function(){
			$.app.navigator.close();
		}
	});	
}

exports.init = init;
