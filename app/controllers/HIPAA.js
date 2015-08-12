var args = arguments[0] || {},
	http = require("requestwrapper"),
	app = require("core");

function init(){
	/**
	 * If the terms and conditions are already fetched once, re-use them
	 */
	if(Alloy.Collections.termsAndConditions.length){
		Alloy.Collections.termsAndConditions.each(function(term){
			if(term.get("agreement_text") == $.strings.accountAgreementHIPAA){
				applyWebViewProperties(term.get("agreement_url"));
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
		}
	});
	
	applyWebViewProperties(url);
}

function applyWebViewProperties(url){
	$.webView.applyProperties({ 
		url : url
	});
	
	$.webView.addEventListener('load', function (e){
	    var actualHeight = e.source.evalJS('document.height;');
	    e.source.height = parseInt(actualHeight);
    }); 
}

function didClickAccept(){
	http.request({
		method : "terms_accept",
		params : {
			data : [{
				terms: {
				   agreement_type: "1",
				   action: "1",
				}
			}]
		},
		success : didAcceptOrDecline
	});
}

function didClickDecline(){
	http.request({
		method : "terms_accept",
		params : {
			data : [{
				terms: {
				   agreement_type: "1",
				   action: "0",
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
