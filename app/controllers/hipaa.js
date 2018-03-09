var args = $.args,
	http = require("requestwrapper"),
	app = require("core"),
	utilities = require('utilities'),
	logger = require("logger"),
	agreement_type,
	currentPatient;

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
		actualHeight = e.source.evalJS('document.documentElement.scrollHeight;');
    	e.source.height = parseInt(actualHeight);
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
	
	if (Alloy.CFG.is_express_checkout_enabled) {
		$.app.navigator.open({
			titleid : "titleExpressPickupBenefits",
			ctrl : "expressPickupBenefits",
			stack : false
		});
	} else {
		currentPatient = Alloy.Collections.patients.findWhere({
			selected : true
		});
		
		if (currentPatient.get("mobile_number") && currentPatient.get("is_mobile_verified") === "1") {
			app.navigator.open({
				titleid : "titleHomePage",
				ctrl : "home",
				stack : false
			});
		} else{
			app.navigator.open({
				titleid : "titleTextBenefits",
				ctrl : "textBenefits",
				stack : false
			});
		};
	}
}

function showLoader() {
	$.loader.show();
}

function hideLoader() {
	$.loader.hide(false);
}

exports.init = init;
