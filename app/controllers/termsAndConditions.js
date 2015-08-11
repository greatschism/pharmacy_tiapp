var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper");

function init() {
	if(args.registrationFlow)
	{
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
	else{
		http.request({
			method : "terms_get",
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
		data = [],
		section = $.uihelper.createTableViewSection($, args.registrationFlow === true ? $.strings.registerSectionTermsDocuments : $.strings.accountSectionAcceptedDocs);
		
	Alloy.Collections.termsAndConditions.reset(terms);
	
	_.each(terms, function(term) {
		/**
		 * Hide HIPAA from displaying in the list. HIPAA flow is separate (when user logs in for the 1st time)
		 */
		if( args.registrationFlow){
			if(term.agreement_text != $.strings.accountAgreementHIPAA){
				section.add(Alloy.createController("itemTemplates/labelWithChild", {
					title : term.agreement_text
				}).getView());
			}
		}
		else{
			section.add(Alloy.createController("itemTemplates/labelWithChild", {
				title : term.agreement_text
			}).getView());
		}
	});
	$.tableView.setData([section]); 
}

function didClickItem(e) {
	var item = Alloy.Collections.termsAndConditions.at(e.index).toJSON();
	$.app.navigator.open({
		ctrl : "termsDoc",
		title : item.agreement_text,
		stack : true,
		ctrlArguments : {
			terms : item,
			registrationFlow : args.registrationFlow
		}
	});	
}

function didClickDone(e) {
	app.navigator.close();
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
