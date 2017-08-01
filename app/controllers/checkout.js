var args = $.args,
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    rx = require("rx"),
    uihelper = require("uihelper"),
    apiCodes = Alloy.CFG.apiCodes,
    prescriptions = args.prescriptions,
    postlayoutCount = 0,
    dawPrompt = 0,
    hasSetDawPrompt = false,
    counselingPrompt = 0,
    hasSetCounselingPrompt = false,
    useCreditCard = "0",
    isWindowOpen,
    httpClient,
    logger = require("logger");

var data = [],
    questionSection,
    paymentSection;

var sections = {
	questions : [],
	payment : []
};

var sectionHeaders = {
	questions : "",
	payment : "",
};

function init() {

	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];

	$.submitBtn.visible = false;
}

function setAccessibilityLabelOnSwitch(switchObj, strValue) {
	/*
	 var iDict = {};
	 if (OS_ANDROID) {
	 iDict.accessibilityLabelOn = strValue;
	 iDict.accessibilityLabelOff = strValue;
	 } else {
	 iDict.accessibilityLabel = strValue;
	 }
	 iDict.accessibilityHint = "Double tap to toggle";
	 switchObj.applyProperties(iDict);
	 */
}

function focus() {
	/*
	 * avoid null pointer if another controller or another instance of this controller
	 * used this global variable in it's life span
	 */
	Alloy.Globals.currentTable = $.tableView;
	/**
	 * focus will be called whenever window gets focus / brought to front (closing a window)
	 * identify the first focus with a flag isWindowOpen
	 * Note: Moving this api call to init can show dialog on previous window on android
	 * as activities are created once window is opened
	 */
	if (!isWindowOpen) {
		isWindowOpen = true;
		prepareList();
	}
}

function didPostlayoutPrompt(e) {

}

function didUpdateUI() {

}

function prepareList() {

	questionSection = $.uihelper.createTableViewSection($, "", sectionHeaders["questions"], false);

	var addDawRow = false,
	    dawRx = "";
	_.each(prescriptions, function(prescription) {
		if (_.has(prescription, "daw_code")) {
			if (prescription.daw_code != null && prescription.daw_code == 2) {
				addDawRow = true;
				dawRx = dawRx.concat(prescription.presc_name + "\n");
			}
		}
	});

	if (addDawRow) {
		//strip last newline character from list of rx names if applicable
		dawRx = dawRx.substring(0, (dawRx.length - 2));
		presentGenericsPrompt(dawRx);
		$.tableView.setData(data);
		$.loader.hide();
	} else {
		$.tableView.setData(data);
		$.loader.hide();
		presentCounselingPrompt();
	}
}

function presentGenericsPrompt(dawRxListText) {

	var question = {
		section : "questions",
		itemTemplate : "checkoutQuestionPrompt",
		masterWidth : 100,
		title : $.strings.checkoutMedicationPrefQuestion,
		subtitle : dawRxListText
	};

	var rowParams = question,
	    row;

	rowParams.filterText = _.values(_.pick(rowParams, ["title", "subtitle", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();

	row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
	row.on("answerPrompt", didAnswerGenericsPrompt);

	sectionHeaders[rowParams.section] += rowParams.filterText;
	sections[rowParams.section].push(row);
	questionSection.add(row.getView());
	data.push(questionSection);
}

function didAnswerGenericsPrompt(e) {
	Ti.API.info("didAnswerGenericsPrompt");
	dawPrompt = e.data.answer;

	if (!hasSetDawPrompt) {
		hasSetDawPrompt = true;
		presentCounselingPrompt();
	}
}

function presentCounselingPrompt() {
	var question = {
		section : "questions",
		itemTemplate : "checkoutQuestionPrompt",
		masterWidth : 100,
		title : $.strings.checkoutCounselingQuestion
	};

	var rowParams = question,
	    row2;

	rowParams.filterText = _.values(_.pick(rowParams, ["title", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
	row2 = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
	row2.on("answerPrompt", didAnswerCounselingPrompt);

	if (OS_IOS) {
		questionSection[1] = row2.getView();
		data[0] = questionSection;
		$.tableView.setData(data);
		$.tableView.appendRow(questionSection[1], {
			animationStyle : Ti.UI.iPhone.RowAnimationStyle.FADE
		});

	} else {

		questionSection.add(row2.getView());
		if (hasSetDawPrompt === false) {
			data.push(questionSection);
		}

		$.tableView.setData(data);
	}
}

function didAnswerCounselingPrompt(e) {
	logger.debug("\n\n\ndidAnswerCounselingPrompt\n\n\n");
	counselingPrompt = e.data.answer;

	if (!hasSetCounselingPrompt) {
		hasSetCounselingPrompt = true;

		var currentPatient = Alloy.Collections.patients.findWhere({
			selected : true
		});

		if (_.has(currentPatient, ["card_type", "expiry_date", "last_four_digits"])) {
			// if (currentPatient.get("card_type") != null && currentPatient.get("expiry_date") != null && currentPatient.get("last_four_digits") != null) 
			{
				useCreditCard = "1";
				presentCCConfirmation(currentPatient);
			}
		}
		else
		{
			// presentSubmitButton();
							presentCCConfirmation(currentPatient);

		}
	}
}

function presentCCConfirmation(patient) {
	paymentSection = $.uihelper.createTableViewSection($, "Your Payment Information", sectionHeaders["payment"], false);

	var totalAmountDue = 0;
	_.each(prescriptions, function(prescription) {
		if (_.has(prescription, "copay")) {
			if (prescription.copay != null) {
				logger.debug("\n\n\n copay", prescription.copay, "\n\n\n");
				
				totalAmountDue+= parseFloat(prescription.copay);
			}
		}
	});
			
	var payment = {
		section : "payment",
		itemTemplate : "creditCardView",
		masterWidth : 100,
		title : patient.get("card_type")+" ending in "+patient.get("last_four_digits"),
		subtitle : "Expiration date:"+ patient.get("expiry_date"),
		amountDue : totalAmountDue
	};

	var rowParams = payment,
	    row;

	rowParams.filterText = _.values(_.pick(rowParams, ["title", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
	row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
	row.on("clickedit", didClickCCEdit);

	if (OS_IOS) {

		// sectionHeaders[rowParams.section] += rowParams.filterText;
		// sections[rowParams.section].push(row);
		paymentSection.add(row.getView());
		data.push(paymentSection);
		$.tableView.setData(data);
		/*
		 questionSection[1] = row.getView() ;
		 data[0] = questionSection;
		 $.tableView.setData(data);
		 $.tableView.appendRow(questionSection[1],  { animationStyle : Ti.UI.iPhone.RowAnimationStyle.FADE });	*/
	} else {

		paymentSection.add(row.getView());
		if (hasSetCounselingPrompt === false && hasSetDawPrompt === false) {
			data.push(paymentSection);
		}

		$.tableView.setData(data);
	}
	
	presentSubmitButton();
}

function didClickCCEdit(e) {
	logger.debug("didClickCCEdit");
	$.uihelper.showDialog({
			message : $.strings.checkoutEditCardInfo
		});
}

function presentSubmitButton() {
	//Submit button can be shown here
	$.submitBtn.visible = true;
}

function didClickSubmit(e) {
	Ti.API.info("didClickSubmit");

	var checkoutPrescriptions = [];

	_.each(prescriptions, function(prescription) {
		checkoutPrescriptions.push({
			id : prescription.id,
			rx_number : prescription.rx_number,
			original_store_id : prescription.original_store_id
		});
	});

	logger.debug("\n\n\n\n request checkoutPrescriptions", JSON.stringify(checkoutPrescriptions, 0, null), "\n\n\n");

	$.http.request({
		method : "checkout_preferences_update",
		params : {
			data : [{
				checkout : {
					prescriptions : checkoutPrescriptions,
					counseling : counselingPrompt.toString(),
					useLoyaltyCard : "0",
					usePatientDaw : dawPrompt.toString(),
					useCreditCard : useCreditCard
				}
			}]
		},
		passthrough : true,
		errorDialogEnabled : true,
		keepLoader : false,
		success : didSuccess,
		failure : didFail
	});
}

function didSuccess(result, passthrough) {
	logger.debug("\n\n\n\n checkout result", JSON.stringify(result, 0, null), "\n\n\n");
	$.app.navigator.hideLoader();
	uihelper.showDialog({
		message : result.message,
		buttonNames : [Alloy.Globals.strings.dialogBtnClose],
		success : popToPrescriptions
	});
}

function didFail(result, passthrough) {
	$.app.navigator.hideLoader();
	popToPrescriptions();
}

function popToPrescriptions() {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function didClickTableView(e) {

}

function terminate() {
	if (httpClient) {
		httpClient.abort();
	}
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
