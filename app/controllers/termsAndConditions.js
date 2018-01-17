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
		notices = Alloy.Models.appload.get("features"),
		section = $.uihelper.createTableViewSection($, args.registrationFlow === true ? $.strings.registerSectionTermsDocuments : $.strings.accountSectionAcceptedDocs),
		noticeSection = $.uihelper.createTableViewSection($, notices.privacy_practices_url || notices.non_discrimination_policy_url ? $.strings.accountAgreementsSectionNotice : "");
		agreementsNotices = JSON.parse(JSON.stringify([
										{ "agreement_name": "mscripts",
										"agreement_text": "Meijer's Notice of Privacy Practices",
										"agreement_valid_from":"",
										"agreement_valid_to":"",
										"agreement_url": notices.privacy_practices_url
										},
										{ "agreement_name": "mscripts",
										"agreement_text": "Non-Discrimination Policy",
										"agreement_valid_from":"",
										"agreement_valid_to":"",
										"agreement_url": notices.non_discrimination_policy_url
										}])),
		termsNotices= terms.concat(agreementsNotices);		
	Alloy.Collections.termsAndConditions.reset(termsNotices);
	_.each(terms, function(term) {
		/**
		 * Hide HIPAA from displaying in the list. HIPAA flow is separate (when user logs in for the 1st time)
		 */
		if( args.registrationFlow){
			if(term.agreement_text != $.strings.accountAgreementHIPAA){
				section.add(Alloy.createController("itemTemplates/label", {
					title : term.agreement_text,
					accessibilityLabel : term.agreement_text + " " + $.strings.loginAttrLabelsAccessibilityHint,
					hasChild : true
				}).getView());
				data.push(term.agreement_text);
			}
		}
		else{
			section.add(Alloy.createController("itemTemplates/label", {
				title : term.agreement_text,
				accessibilityLabel : term.agreement_text + " " + $.strings.loginAttrLabelsAccessibilityHint,
				hasChild : true
			}).getView());
			data.push(term.agreement_text);
		}
	});
			_.each(agreementsNotices, function(notices){
			noticeSection.add(Alloy.createController("itemTemplates/label",{
			title : notices.agreement_text,
			accessibilityLabel : notices.agreement_text + " " + $.strings.loginAttrLabelsAccessibilityHint,
			hasChild : true
			}).getView());
			data.push(notices.agreement_text);
			});
					
	$.tableView.setData([section, noticeSection]);
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
