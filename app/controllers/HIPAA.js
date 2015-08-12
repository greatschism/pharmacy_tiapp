var args = arguments[0] || {},
	http = require("requestwrapper"),
	app = require("core"),
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
				feature_code : "THXXX",
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
	$.webView.applyProperties({ 
		url : url
	});
	
	$.webView.addEventListener('load', function (e){
		var actualHeight = 0;
		if (OS_ANDROID) {
			actualHeight = Math.max(e.source.evalJS('document.body.scrollHeight;'), 
									e.source.evalJS('document.body.offsetHeight;'),
								    e.source.evalJS('document.documentElement.scrollHeight;'),
								    e.source.evalJS('document.documentElement.clientHeight;'),
								    e.source.evalJS('document.documentElement.offsetHeight;'));
								    
		}
		else{
	    	actualHeight = e.source.evalJS('document.height;');
	   	}
	    
	    e.source.height = parseInt(actualHeight);
    }); 
}

function didClickAccept(){
	http.request({
		method : "terms_accept",
		params : {
			feature_code : "THXXX",
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
			feature_code : "THXXX",
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
	app.navigator.open({
		titleid : "titleTextBenefits",
		ctrl : "textBenefits",
		stack : true
	});
}

exports.init = init;
