var args = $.args,
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    app = require("core"),
    http = require("requestwrapper"),
    isHIPAA;

function init() {
	isHIPAA = ($.args.terms ? ($.args.terms.agreement_text === $.strings.accountsAgreementHIPAA ? true : false) : false);
	isMonthlySpecials = ($.strings.titleCouponsUrl ? true : false);
	$.webView.enableZoomControls = false;
	$.webView.applyProperties({
		top : ($.args.registrationFlow === true || !args.terms) ? 0 : "10%",
		bottom : isHIPAA ? "25%" : (args.terms ? "15%" : "0%"),
		url : (args.terms ? args.terms.agreement_url || args.terms : $.strings.titleCouponsUrl),
		borderRadius: 1,
		willHandleTouches: false
	});
	if(!$.args.registrationFlow && args.terms){
		$.acceptedOnLbl.text = $.strings.accountLblAcceptedOn + " " + moment(args.terms.agreement_valid_from).format(Alloy.CFG.date_format);
		if(isHIPAA) 
			$.successBtn.title = $.strings.accountSuccessBtnDone;
	}
	else{
		$.successBtn.title = $.strings.registerBtnTermsDone;
	}
	
	if(isHIPAA){
		$.revokeBtn.show();
	}
	
	if(!args.terms) {
		$.successBtn.hide();
	}	
}

function didClickSuccess(){
	if($.args.registrationFlow){
		app.navigator.close();
	}
	else{
		/**
		 * There is no option for sending HIPAA contents by email. Hence take care of it
		 */
		if(isHIPAA) 
		{
			app.navigator.close();
		}
		else
		{
			http.request({
				method : "terms_email",
				params : {
					filter:null,
					data:[{
					 }]
				},
				success : didSendEmail
			});
		}
	}
}

function didSendEmail(result){
	$.uihelper.showDialog({
		message : result.message,
		buttonNames : [$.strings.dialogBtnOK],
		success : function(){
			$.app.navigator.close();
		}
	});	
}

function didClickRevoke(){
	http.request({
		method : "terms_revoke",
		params : {
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

function didRevoke(){
	$.uihelper.showDialog({
		message : $.strings.msgAccountHIPAARevoked,
		buttonNames : [$.strings.dialogBtnOK],
		success : function(){
			$.app.navigator.close();
		}
	});	
}

exports.init = init;
