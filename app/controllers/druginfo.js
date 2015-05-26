var drugDetails,
    effects,
    conditions,
    sideEffects,
    drugDetailsDescription,
    drugEffectsDescription,
    drugConditionDescription,
    drugInteractionDescription,
    drugSideeffectDescription,
    genericNameLabel,
    genericName,
    drugDetailsInfoView,
    drugEffectsInfoView,
    http = require('http'),
    XMLTools = require("XMLTools"),
    app = require("core"),
    xml,
    my_object;

function didFailure() {
	console.error(JSON.stringify(this));
};

function didSuccess(data) {
	xml = new XMLTools(data);
	my_object = xml.toObject();
	drugDetails = my_object["SOAP-ENV:Body"]["gsdd:ContentPatientEducation"]["gsdd:PatientEducationSheet"]["gsdd:Description"];
	conditions = my_object["SOAP-ENV:Body"]["gsdd:ContentPatientEducation"]["gsdd:PatientEducationSheet"]["gsdd:Contraindications"];
	effects = my_object["SOAP-ENV:Body"]["gsdd:ContentPatientEducation"]["gsdd:PatientEducationSheet"]["gsdd:Description"];
	sideEffects = my_object["SOAP-ENV:Body"]["gsdd:ContentPatientEducation"]["gsdd:PatientEducationSheet"]["gsdd:SideEffects"];
	app.navigator.hideLoader();

	//View displayed on clicking drug_details
	drugDetailsInfoView = $.UI.create("View", {
		classes : ["auto-height", "vgroup"]
	});

	genericNameLabel = $.UI.create("Label", {
		classes : 'subLabels',
		text : "Generic Name"

	});

	genericName = $.UI.create("Label", {
		classes : 'subLabels',
		text : "Alprazolam"
	});
	drugDetailsDescription = $.UI.create("Label", {
		classes : ["multi-line", " margin-top", " margin-bottom", "textStyle", "margin-left", "margin-right"],
		text : drugDetails

	});

	drugDetailsInfoView.add(genericNameLabel);
	drugDetailsInfoView.add(genericName);
	drugDetailsInfoView.add(drugDetailsDescription);

	//View displayed on clicking drug_effects
	drugEffectsInfoView = $.UI.create("View", {
		classes : ["auto-height", "vgroup"]
	});

	drugEffectsDescription = $.UI.create("Label", {
		classes : 'textStyle',
		text : effects

	});
	drugEffectsInfoView.add(drugEffectsDescription);

	//View displayed on clicking other_conditions
	drugConditionsInfoView = $.UI.create("View", {
		classes : ["auto-height", "vgroup"]
	});

	drugConditionDescription = $.UI.create("Label", {
		classes : 'textStyle',
		text : conditions

	});
	drugConditionsInfoView.add(drugConditionDescription);

	//View to display side_effects
	drugSideEffectsInfoView = $.UI.create("View", {
		classes : ["auto-height", "vgroup"]
	});
	drugSideeffectDescription = $.UI.create("Label", {
		classes : 'textStyle',
		text : sideEffects

	});

	drugSideEffectsInfoView.add(drugSideeffectDescription);
}

function init() {
	app.navigator.showLoader({
		message : "Loading",
		textAlign : "center"
	});
	http.request({
		type : "POST",
		format : "XML",
		url : "http://54.172.111.87:3434",
		data : "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\"xmlns:gsdd=\"http://gsdd.goldstandard.com/\"><soapenv:Header/><soapenv:Body><gsdd:ContentPatientEducationRequest><gsdd:SheetIdentifier><gsdd:DrugIdentifier><gsdd:Package><gsdd:IdentifierType>NDC11</gsdd:IdentifierType><gsdd:Identifier>00185-0195-60</gsdd:Identifier></gsdd:Package></gsdd:DrugIdentifier><gsdd:LanguageCode>en-US</gsdd:LanguageCode></gsdd:SheetIdentifier></gsdd:ContentPatientEducationRequest></soapenv:Body></soapenv:Envelope>",
		//data : "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\” xmlns:gsdd=\"http://gsdd.goldstandard.com/\"> <soapenv:Header/><soapenv:Body><gsdd:ContentPatientEducationRequest><gsdd:SheetIdentifier><gsdd:DrugIdentifier><gsdd:Package><gsdd:IdentifierType>NDC11</gsdd:IdentifierType><gsdd:Identifier>00185-0195-60</gsdd:Identifier></gsdd:Package></gsdd:DrugIdentifier><gsdd:LanguageCode>en-US</gsdd:LanguageCode></gsdd:SheetIdentifier> </gsdd:ContentPatientEducationRequest> </soapenv:Body></soapenv:Envelope>",
		failure : didFailure,
		success : didSuccess
	});
}

function viewExpand(e) {
	var sourceView = e.source.id;
	console.log(sourceView);
	if (sourceView == "drugDetailsParent") {

		var children = $.drugDetailsParent.getChildren();
		//console.log(children.length);

		if (children.length == 1) {
			$.drugDetailsParent.showVerticalScrollIndicator = 'true';
			$.drugDetailsParent.add(drugDetailsInfoView);
		} else {
			$.drugDetailsParent.remove(drugDetailsInfoView);
		}

	}
	/* else if (sourceView == "drugEffectsParent") {

	 var children=$.drugEffectsParent.getChildren();

	 if (children.length==1) {
	 $.drugEffectsParent.add(drugEffectsInfoView);

	 } else {
	 $.drugEffectsParent.remove(drugEffectsInfoView);

	 }

	 }*/
	else if (sourceView == "drugConditionsParent") {

		var children = $.drugConditionsParent.getChildren();

		if (children.length == 1) {
			$.drugConditionsParent.add(drugConditionsInfoView);

		} else {
			$.drugConditionsParent.remove(drugConditionsInfoView);

		}
	} else if (sourceView == "drugSideEffectsParent") {

		var children = $.drugSideEffectsParent.getChildren();

		if (children.length == 1) {
			$.drugSideEffectsParent.add(drugSideEffectsInfoView);

		} else {
			$.drugSideEffectsParent.remove(drugSideEffectsInfoView);

		}

	}
}

exports.init = init;
