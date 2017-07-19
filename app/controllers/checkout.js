var args = $.args,
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    rx = require("rx"),
    uihelper = require("uihelper"),
    apiCodes = Alloy.CFG.apiCodes,
    prescriptions = args.prescriptions,
    postlayoutCount = 0,
    dawPrompt = 0,
    counselingPrompt = 0,
    isWindowOpen,
    httpClient,
    logger = require("logger");

var data = [],
    questionSection,
    paymentSection;
sections = {
	questions : [],
	payment : []
};

//loop data for rows
/*var sectionHeaders = {
 questions : "",
 cardInfo : ""
 },*/

sectionHeaders = {
	questions : "",
	payment : "",
};

function init() {

	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];

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

function prepareList() {
	var question = {
		section : "questions",
		itemTemplate : "dawPrompt",
		masterWidth : 100,
		title : $.strings.checkoutCounselingQuestion
	};

	var rowParams = question,
	    row;

	rowParams.filterText = _.values(_.pick(rowParams, ["title", "subtitle", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
	row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
	row.on("answerPrompt", didAnswerCounselingPrompt);

	sectionHeaders[rowParams.section] += rowParams.filterText;
	sections[rowParams.section].push(row);

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
		var question = {
			section : "questions",
			itemTemplate : "dawPrompt",
			masterWidth : 100,
			title : $.strings.checkoutMedicationPrefQuestion,
			subtitle : dawRx
		};

		var rowParams = question,
		    row;

		rowParams.filterText = _.values(_.pick(rowParams, ["title", "subtitle", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
		row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
		row.on("answerPrompt", didAnswerGenericPrompt);

		sectionHeaders[rowParams.section] += rowParams.filterText;
		sections[rowParams.section].push(row);

	}
	_.each(sections, function(rows, key) {
		if (rows.length) {
			questionSection = $.uihelper.createTableViewSection($, "Questions", sectionHeaders[key], false);

			_.each(rows, function(row) {
				questionSection.add(row.getView());
			});
			data.push(questionSection);

		}
	});

	$.tableView.setData(data);

	$.loader.hide();

}

function didUpdateUI() {

}

function didPostlayoutPrompt(e) {
	/*	var source = e.source,
	 children = source.getParent().children;
	 source.removeEventListener("postlayout", didPostlayoutPrompt);
	 children[1].applyProperties({
	 left : children[1].left + children[0].rect.width,
	 visible : true
	 });
	 postlayoutCount++;
	 if (postlayoutCount === 4) {
	 $.prescExp.setStopListening(true);
	 }*/
}

function didAnswerGenericPrompt(e) {
	Ti.API.info("didAnswerGenericPrompt");
	dawPrompt = e.data.answer;
}

function didAnswerCounselingPrompt(e) {
	Ti.API.info("\n\n\ndidAnswerCounselingPrompt\n\n\n");
	counselingPrompt = e.data.answer;

}

function didClickCCEdit(e) {
	Ti.API.info("didClickCCEdit");

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
					counseling : counselingPrompt,
					useLoyaltyCard : "0",
					usePatientDaw : dawPrompt,
					useCreditCard : "0"
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
	// $.app.navigator.close();
		$.uihelper.showDialog({
			message : result.message
		});
}

function popToPrescriptions()
{
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
