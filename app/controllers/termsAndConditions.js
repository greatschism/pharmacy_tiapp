var args = $.args,
    app = require("core"),
    http = require("requestwrapper"),
    logger = require("logger"),
    data = [];

function init() {
	if(args.registrationFlow)
	{
		http.request({
			method : "terms_get_all",
			params : {
				data : [{
					terms : "some"
				}]
			},
			success : didSuccess
		});
	}
	else{
		getTerms();
	}
}

function focus(){
	if(!args.registrationFlow)
		getTerms();
}

function getTerms(){
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

function didSuccess(result) {
	
	var terms = result.data,
		section = $.uihelper.createTableViewSection($, args.registrationFlow === true ? $.strings.registerSectionTermsDocuments : $.strings.accountSectionAcceptedDocs);
		
	Alloy.Collections.termsAndConditions.reset(terms);
	
	_.each(terms, function(term) {
		/**
		 * Hide HIPAA from displaying in the list. HIPAA flow is separate (when user logs in for the 1st time)
		 */
		if( args.registrationFlow){
			if(term.agreement_text != $.strings.accountAgreementHIPAA){
				section.add(Alloy.createController("itemTemplates/label", {
					title : term.agreement_text,
					hasChild : true
				}).getView());
				data.push(term.agreement_text);
			}
		}
		else{
			section.add(Alloy.createController("itemTemplates/label", {
				title : term.agreement_text,
				hasChild : true
			}).getView());
			data.push(term.agreement_text);
		}
	});
	$.tableView.setData([section]); 
}

function didClickItem(e) {
	var item = Alloy.Collections.termsAndConditions.findWhere({
			agreement_text : data[e.index]
		}).toJSON();
		logger.debug("\n\n\n item = ", JSON.stringify(item), "\n\n\n");
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
exports.focus = focus;
exports.terminate = terminate;
