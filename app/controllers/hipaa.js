var args = $.args,
	http = require("requestwrapper"),
	app = require("core"),
	utilities = require('utilities'),
	agreement_type;

function init(){
	/**
	 * If the terms and conditions are already fetched once, re-use them
	 */
	if(Alloy.Collections.termsAndConditions.length){
		Alloy.Collections.termsAndConditions.each(function(term){
			if(term.get("agreement_text") == $.strings.accountAgreementHIPAA){
				applyWebViewProperties(term.get("agreement_url"));
				agreement_type = term.get("agreement_type");
			}
		});
	}
	else{
		http.request({
			method : "terms_get_all",
			params : {
				data : [{
					terms : ""
				}]
			},
			success : didSuccess
		});
	}
}

function didSuccess(result) {
	
	var terms = result.data,
		url;
	
	_.each(terms, function(term) {
		if(term.agreement_text == $.strings.accountAgreementHIPAA){
			url = term.agreement_url;
			agreement_type = term.agreement_type;
		}
	});
	
	applyWebViewProperties(url);
}

function applyWebViewProperties(url){
	showLoader();
	$.webView.applyProperties({ 
		url : url
	});
	
	$.webView.addEventListener('load', function (e){
		var actualHeight = 0;
		if (OS_ANDROID) {
			actualHeight = e.source.evalJS('document.documentElement.scrollHeight;') - e.source.evalJS('document.documentElement.clientHeight;');
		}
		else{
	    	actualHeight = e.source.evalJS('document.height;');
	   	}
	    
	    e.source.height = parseInt(actualHeight) + 50;
	    hideLoader();
    }); 
    
    
}

function didClickAccept(){
	http.request({
		method : "terms_accept",
		params : {
			filter : [],
			data : [{
				terms: {
				   agreement_type: agreement_type,
				   action: "1"
				}
			}]
		},
		success : didAcceptOrDecline
	});
}

function didClickDecline(){
	http.request({
		method : "terms_decline",
		params : {
			filter : [],
			data : [{
				terms: {
				   agreement_type: agreement_type,
				   action: "0"
				}
			}]
		},
		success : didAcceptOrDecline
	});
}

function didAcceptOrDecline(){
	
	/**
	 * remove the entry from the properties so that HIPAA is not displayed to the user next time
	 */
	utilities.removeProperty(Alloy.Collections.patients.at(0).get("email_address"));
	
	app.navigator.open({
		titleid : "titleTextBenefits",
		ctrl : "textBenefits",
		stack : false
	});
}

function showLoader() {
	$.loader.show();
}

function hideLoader() {
	$.loader.hide(false);
}

exports.init = init;
