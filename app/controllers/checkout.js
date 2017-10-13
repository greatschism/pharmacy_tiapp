var args = $.args,

    moduleNames = require("moduleNames"),
    ctrlNames = require("ctrlNames"),
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
    loyaltyPrompt = 0,
    hasSetLoyaltyPrompt = false,
    useCreditCard = "0",
    currentPatient,
    isWindowOpen,
    httpClient,
    utilities = require("utilities"),
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
	payment : "Your Payment Info",
};

function init() {

	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];

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

	$.submitBtn.visible = false;

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
		// $.loader.hide();
	} else {
		$.tableView.setData(data);
		// $.loader.hide();
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

	var values = Alloy.Models.counselingEligible.get("code_values").map(function(item) {
		return item.code_value;
	});

	// alert("values     " + JSON.stringify(values) );

	var counsellingRequiredStoreWasFound = _.some(prescriptions, function(prescription) {
		var ans = _.find(values, function(val) {
			return prescription.original_store_state === val;
		});

		if ( typeof ans === 'undefined') {
			return true;
		} else {
			return false;
		}
	});

	// alert("counsellingRequiredStoreWasFound     " + JSON.stringify(counsellingRequiredStoreWasFound) );

	if (!counsellingRequiredStoreWasFound) {
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
	} else {

		didAnswerCounselingPrompt({
			data : {
				"answer" : 1
			}
		});
	}
}

function didAnswerCounselingPrompt(e) {
	logger.debug("\n\n\ndidAnswerCounselingPrompt ", e.data.answer);
	counselingPrompt = e.data.answer;

	if (!hasSetCounselingPrompt) {
		hasSetCounselingPrompt = true;

		currentPatient = Alloy.Collections.patients.findWhere({
			selected : true
		});

		if (currentPatient.get("showLoyaltySignup") != null) {
			logger.debug("\n\n\n showLoyaltySignup found\n\n\n");

			if (currentPatient.get("showLoyaltySignup") == true) {
				$.utilities.setProperty(Alloy.CFG.show_loyalty_signup, "1");
			} else if (currentPatient.get("showLoyaltySignup") == false) {
				$.utilities.setProperty(Alloy.CFG.show_loyalty_signup, "0");
			}

		} else {
			logger.debug("\n\n\n showLoyaltySignup missing\n\n\n");
			$.utilities.setProperty(Alloy.CFG.show_loyalty_signup, "1");
		}

		logger.debug("\n\n\n Alloy.CFG.show_loyalty_signup ", $.utilities.getProperty(Alloy.CFG.show_loyalty_signup), "\n\n\n");

		/*
		 * check if loyalty program enabled
		 */
		if (Alloy.CFG.is_loyalty_program_enabled) {
			if (currentPatient.get("loyalty_card_opt_out") != null) {
				logger.debug("\n\n\n loyalty_card_opt_out  found\n\n\n");

				if (currentPatient.get("loyalty_card_opt_out") == "Y") {
					logger.debug("\n\n\n loyalty_card_opt_out = Y\n\n\n");

					if (currentPatient.get("card_type") != null && currentPatient.get("expiry_date") != null && currentPatient.get("last_four_digits") != null) {
						useCreditCard = "1";
						presentCCConfirmation(currentPatient);

					} else {
						presentSubmitButton();
					}
				} else if (currentPatient.get("loyalty_card_opt_out") == "N" && currentPatient.get("loyalty_card_number") != null) {
					logger.debug("\n\n\n loyalty_card_opt_out = N \n\n\n");

					presentLoyaltyPrompt();
				} else {
					logger.debug("\n\n\n loyalty_card_opt_out else case \n\n\n");

					if ($.utilities.getProperty(Alloy.CFG.show_loyalty_signup) == "1") {
						uihelper.showDialogWithButton({
							message : "We don't see your mPerks for Pharmacy information. Are you an mPerks member?",
							deactivateDefaultBtn : true,
							btnOptions : [{
								title : $.strings.dialogBtnYes,
								onClick : showLoyaltyAdd
							}, {
								title : $.strings.dialogBtnNo,
								onClick : showLoyaltySignup
							}]
						});

					}
				}
			} else {
				logger.debug("\n\n\n loyalty_card_opt_out not found\n\n\n");
				if ($.utilities.getProperty(Alloy.CFG.show_loyalty_signup) == "1") {
					uihelper.showDialogWithButton({
						message : "We don't see your mPerks for Pharmacy information. Are you an mPerks member?",
						deactivateDefaultBtn : true,
						btnOptions : [{
							title : $.strings.dialogBtnYes,
							onClick : showLoyaltyAdd
						}, {
							title : $.strings.dialogBtnNo,
							onClick : showLoyaltySignup
						}]
					});
				} else {
					if (currentPatient.get("card_type") != null && currentPatient.get("expiry_date") != null && currentPatient.get("last_four_digits") != null) {
						useCreditCard = "1";
						presentCCConfirmation(currentPatient);

					} else {
						presentSubmitButton();
					}
				}
			}
		} else {
			/*
			 * loyalty program disabled
			 */
			if (currentPatient.get("card_type") != null && currentPatient.get("expiry_date") != null && currentPatient.get("last_four_digits") != null) {
				useCreditCard = "1";
				presentCCConfirmation(currentPatient);

			} else {
				presentSubmitButton();
			}
		}
	}
}

function showLoyaltyAdd() {
	var dialogView = $.UI.create("ScrollView", {
		apiName : "ScrollView",
		classes : ["top", "auto-height", "vgroup"]
	});
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3", "txt-center"],
		text : "mPerks"
	}));
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top", "margin-left-extra-large", "margin-right-extra-large"],
		text : "Please enter your mPerks information at the cash register the next time you are at the pharmacy. We will save your information for future use in Mobile Checkout."
	}));
	_.each([{
		title : $.strings.dialogBtnOK,
		classes : ["margin-top-large", "margin-left-extra-large", "margin-right-extra-large", "primary-bg-color", "primary-light-fg-color", "primary-border"]
	}], function(obj, index) {
		var btn = $.UI.create("Button", {
			apiName : "Button",
			classes : obj.classes,
			title : obj.title,
			index : index
		});
		$.addListener(btn, "click", didGetLoyaltyAddRsp);
		dialogView.add(btn);

		var swt = $.UI.create("View", {
			apiName : "View",
			classes : ["margin-top-large", "margin-bottom-large", "margin-left-extra-large", "margin-right-extra-large", "auto-height"],
			index : 1
		});
		var checkboxClasses,
		    checkBoxToggleFlag = 0;

		if ($.utilities.isNarrowScreen()) {
			checkboxClasses = ["margin-left-small", "i4", "icon-checkbox-unchecked"];
		} else {
			checkboxClasses = ["margin-left-small", "i4", "icon-checkbox-unchecked"];
		}
		var swtCheckbox = $.UI.create("Label", {
			apiName : "Label",
			classes : checkboxClasses
		});

		$.addListener(swtCheckbox, "click", function() {
			Ti.API.info("swtCheckbox.getProperties " + JSON.stringify(swtCheckbox.classes));

			if (checkBoxToggleFlag === 0) {
				Ti.API.info("!!!!!!!!!!should set checked here. indexOf > -1, unchecked was found ");
				checkBoxToggleFlag = 1;
				swtCheckbox.applyProperties($.createStyle({
					classes : ["i4", "icon-checkbox-checked"],
				}));
				$.utilities.setProperty(Alloy.CFG.show_loyalty_signup, "0");
				logger.debug("\n\n\n checkbox checked\n\n\n");
				Alloy.Collections.patients.findWhere({
					selected : true
				}).set("showLoyaltySignup", false);

			} else {
				Ti.API.info("!!!!!!!!!!should set unchecked here. indexOf unchecked was NOT found ");
				checkBoxToggleFlag = 0;
				swtCheckbox.applyProperties($.createStyle({
					classes : ["i4", "icon-checkbox-unchecked"],
				}));
				$.utilities.setProperty(Alloy.CFG.show_loyalty_signup, "1");
				logger.debug("\n\n\n checkbox unchecked\n\n\n");
				Alloy.Collections.patients.findWhere({
					selected : true
				}).set("showLoyaltySignup", true);
			}
		});

		var swtLabel = $.UI.create("Label", {
			apiName : "Label",
			classes : ["margin-left-icon", "h5", "txt-left"],
			text : $.strings.checkoutRemindCheckbox
		});
		swt.add(swtCheckbox);
		swt.add(swtLabel);
		dialogView.add(swt);

	});
	$.loyaltyDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
		classes : ["modal-dialog"],
		children : [dialogView]
	}));
	$.contentView.add($.loyaltyDialog.getView());
	$.loyaltyDialog.show();
}

function showLoyaltySignup() {
	var dialogView = $.UI.create("ScrollView", {
		apiName : "ScrollView",
		classes : ["top", "auto-height", "vgroup"]
	});
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3", "txt-center"],
		text : "mPerks"
	}));
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top", "margin-left-extra-large", "margin-right-extra-large"],
		text : $.strings.loyaltySignupTipLblTitle
	}));
	_.each([{
		title : $.strings.dialogBtnYes,
		classes : ["margin-top-large", "margin-left-extra-large", "margin-right-extra-large", "primary-bg-color", "primary-light-fg-color", "primary-border"]
	}, {
		title : $.strings.dialogBtnNo,
		classes : ["margin-top-large", "margin-left-extra-large", "margin-right-extra-large", "bg-color", "primary-fg-color", "primary-border"]
	}], function(obj, index) {
		var btn = $.UI.create("Button", {
			apiName : "Button",
			classes : obj.classes,
			title : obj.title,
			index : index
		});
		$.addListener(btn, "click", didGetLoyaltySignupRsp);
		dialogView.add(btn);
	});

	var swt = $.UI.create("View", {
		apiName : "View",
		classes : ["margin-top-large", "margin-bottom-large", "margin-left-extra-large", "margin-right-extra-large", "auto-height"],
		index : 1
	});
	var checkboxClasses,
	    checkBoxToggleFlag = 0;

	if ($.utilities.isNarrowScreen()) {
		checkboxClasses = ["margin-left-small", "i4", "icon-checkbox-unchecked"];
	} else {
		checkboxClasses = ["margin-left-small", "i4", "icon-checkbox-unchecked"];
	}
	var swtCheckbox = $.UI.create("Label", {
		apiName : "Label",
		classes : checkboxClasses,
	});

	$.addListener(swtCheckbox, "click", function() {
		Ti.API.info("swtCheckbox.getProperties " + JSON.stringify(swtCheckbox.classes));

		if (checkBoxToggleFlag === 0) {
			Ti.API.info("!!!!!!!!!!should set checked here. indexOf > -1, unchecked was found ");
			checkBoxToggleFlag = 1;
			swtCheckbox.applyProperties($.createStyle({
				classes : ["i4", "icon-checkbox-checked"],
			}));
			$.utilities.setProperty(Alloy.CFG.show_loyalty_signup, "0");
			Alloy.Collections.patients.findWhere({
				selected : true
			}).set("showLoyaltySignup", false);
		} else {
			Ti.API.info("!!!!!!!!!!should set unchecked here. indexOf unchecked was NOT found ");
			checkBoxToggleFlag = 0;
			swtCheckbox.applyProperties($.createStyle({
				classes : ["i4", "icon-checkbox-unchecked"],
			}));
			$.utilities.setProperty(Alloy.CFG.show_loyalty_signup, "1");
			Alloy.Collections.patients.findWhere({
				selected : true
			}).set("showLoyaltySignup", true);
		}
	});

	var swtLabel = $.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-left-icon", "h5", "txt-left"],
		text : $.strings.checkoutRemindCheckbox,
	});
	swt.add(swtCheckbox);
	swt.add(swtLabel);
	dialogView.add(swt);

	$.loyaltyDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
		classes : ["modal-dialog"],
		children : [dialogView]
	}));
	$.contentView.add($.loyaltyDialog.getView());
	$.loyaltyDialog.show();
}

function didGetLoyaltyAddRsp(event) {
	var index = event.source.index;
	logger.debug("\n\n\n loyalty add feedback \n\n\n");

	$.loyaltyDialog.hide(function didHide() {
		$.contentView.remove($.loyaltyDialog.getView());
		$.loyaltyDialog = null;

		if (currentPatient.get("card_type") != null && currentPatient.get("expiry_date") != null && currentPatient.get("last_four_digits") != null) {
			useCreditCard = "1";
			presentCCConfirmation(currentPatient);

		} else {
			presentSubmitButton();
		}
	});
}

function didGetLoyaltySignupRsp(event) {
	var index = event.source.index;
	logger.debug("\n\n\n mperks feedback event.source ", event.source, "\n\n\n");
	$.loyaltyDialog.hide(function didHide() {
		$.contentView.remove($.loyaltyDialog.getView());
		$.loyaltyDialog = null;

		switch(index) {
		case 0:

			showSignupLinkDialog();
			break;
		case 1:

			visitmPerksDialog();
			break;
		}
	});
}

function visitmPerksDialog() {
	var dialogView = $.UI.create("ScrollView", {
		apiName : "ScrollView",
		classes : ["top", "auto-height", "vgroup"]
	});
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3"],
		text : "mPerks"
	}));

	$.lbl = Alloy.createWidget("ti.styledlabel", "widget", $.createStyle({
		classes : ["margin-top", "margin-bottom", "margin-left-extra-large", "margin-right", "h6", "txt-centre", "attributed"],
		html : $.strings.loyaltySignupFeedbackNo,
	}));
	$.lbl.on("click", openVisitmPerksURL);

	dialogView.add($.lbl.getView());
	_.each([{
		title : $.strings.dialogBtnClose,
		classes : ["margin-left-extra-large", "margin-right-extra-large", "margin-bottom", "primary-bg-color", "primary-light-fg-color", "primary-border"]
	}], function(obj, index) {
		var btn = $.UI.create("Button", {
			apiName : "Button",
			classes : obj.classes,
			title : obj.title,
			index : index
		});
		$.addListener(btn, "click", didClickClose);
		dialogView.add(btn);
	});
	$.loyaltyDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
		classes : ["modal-dialog"],
		children : [dialogView]
	}));
	$.contentView.add($.loyaltyDialog.getView());
	$.loyaltyDialog.show();

}

function showSignupLinkDialog() {
	var dialogView = $.UI.create("ScrollView", {
		apiName : "ScrollView",
		classes : ["top", "auto-height", "vgroup"]
	});
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3"],
		text : "mPerks"
	}));

	$.lbl = Alloy.createWidget("ti.styledlabel", "widget", $.createStyle({
		classes : ["margin-top", "margin-bottom", "margin-left-extra-large", "margin-right", "h6", "txt-centre", "attributed"],
		html : $.strings.loyaltySignupFeedbackYes
	}));
	$.lbl.on("click", openmPerksSignupLinkURL);

	dialogView.add($.lbl.getView());

	_.each([{
		title : $.strings.dialogBtnClose,
		classes : ["margin-left-extra-large", "margin-right-extra-large", "margin-bottom", "primary-bg-color", "primary-light-fg-color", "primary-border"]
	}], function(obj, index) {
		var btn = $.UI.create("Button", {
			apiName : "Button",
			classes : obj.classes,
			title : obj.title,
			index : index
		});
		$.addListener(btn, "click", didClickClose);
		dialogView.add(btn);
	});
	$.loyaltyDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
		classes : ["modal-dialog"],
		children : [dialogView]
	}));
	$.contentView.add($.loyaltyDialog.getView());
	$.loyaltyDialog.show();

}

function openVisitmPerksURL(event) {
	logger.debug("\n\n\n openURL triggered for VisitmPerksURL\n\n\n");
	Ti.Platform.openURL("https://www.meijer.com/mperks");
}

function openmPerksSignupLinkURL(event) {
	logger.debug("\n\n\n openURL triggered for SignupLinkURL\n\n\n");
	Ti.Platform.openURL("https://accounts.meijer.com/manage/Account/CreatemPerks#/user/createprofile?cmpid=SEM:mPerks:021017:mPerksAO");
}

function didClickClose(event) {
	var index = event.source.index;
	logger.debug("\n\n\n mperks feedback event.source ", event.source, "\n\n\n");
	$.loyaltyDialog.hide(function didHide() {
		$.contentView.remove($.loyaltyDialog.getView());
		$.loyaltyDialog = null;

		if (currentPatient.get("card_type") != null && currentPatient.get("expiry_date") != null && currentPatient.get("last_four_digits") != null) {
			useCreditCard = "1";
			presentCCConfirmation(currentPatient);

		} else {
			presentSubmitButton();
		}
	});
}

function presentLoyaltyPrompt() {
	var question = {
		section : "questions",
		itemTemplate : "checkoutQuestionPrompt",
		masterWidth : 100,
		title : "Would you like to use your mPerks Pharmacy Rewards?"
	};

	var rowParams = question,
	    row;

	rowParams.filterText = _.values(_.pick(rowParams, ["title", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
	row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
	row.on("answerPrompt", didAnswerLoyaltyPrompt);

	sectionHeaders[rowParams.section] += rowParams.filterText;
	sections[rowParams.section].push(row);
	questionSection.add(row.getView());
	data[0] = questionSection;

	$.tableView.setData(data);
	/*
	 if (OS_IOS) {
	 questionSection[2] = row.getView();
	 data[0] = questionSection;
	 $.tableView.setData(data);
	 $.tableView.appendRow(questionSection[2], {
	 animationStyle : Ti.UI.iPhone.RowAnimationStyle.FADE
	 });

	 } else {
	 questionSection.add(row.getView());
	 $.tableView.setData(data);
	 }*/
}

function didAnswerLoyaltyPrompt(e) {
	logger.debug("\n\n\ndidAnswerLoyaltyPrompt ", e.data.answer);
	loyaltyPrompt = e.data.answer;

	if (!hasSetLoyaltyPrompt) {
		hasSetLoyaltyPrompt = true;

		currentPatient = Alloy.Collections.patients.findWhere({
			selected : true
		});

		if (currentPatient.get("card_type") != null && currentPatient.get("expiry_date") != null && currentPatient.get("last_four_digits") != null) {
			useCreditCard = "1";
			presentCCConfirmation(currentPatient);

		} else {
			presentSubmitButton();
		}
	}
}

function presentCCConfirmation(patient) {

	paymentSection = Ti.UI.createTableViewSection();

	paymentSection.add(Alloy.createController("itemTemplates/label", {
		title : $.strings.checkoutPaymentInformation,
		rowClasses : ["left", "h5", "inactive-light-bg-color", "inactive-fg-color"]
	}).getView());

	/*
	 * show original store of each Rx with amountdue for each store
	 */

	var checkoutStores = [];
	_.each(prescriptions, function(prescription) {
		if (_.has(prescription, "original_store_address_line1")) {
			if (prescription.original_store_address_line1 != null) {
				if (checkoutStores.length) {
					logger.debug("\n\n\n checkoutStores has contents\n\n\n");
					_.some(checkoutStores, function(storeInfo, index) {
						logger.debug("\n\n\n storeInfo to evaluate", JSON.stringify(storeInfo, null, 4), "\n\n\n");
						if (storeInfo.storeId == prescription.original_store_id) {
							if (_.has(prescription, "copay")) {
								if (prescription.copay != null) {
									logger.debug("\n\n\n same store found: previous amount", JSON.stringify(storeInfo, null, 4), "\n\n\n");
									storeInfo.amountDue += parseFloat(prescription.copay);
									storeInfo.subtitle = storeInfo.subtitle.concat("\n" + prescription.presc_name), logger.debug("\n\n\n same store found: new amount", JSON.stringify(storeInfo, null, 4), "\n\n\n");
								}
							}
							return true;
						} else {
							if (index >= checkoutStores.length - 1) {
								var checkoutStoreData = {
									section : "payment",
									itemTemplate : "checkoutStoreItems",
									masterWidth : 100,
									storeId : prescription.original_store_id,
									title : prescription.original_store_address_line1.trim(),
									subtitle : prescription.presc_name,
									amountDue : _.has(prescription, "copay") ? (prescription.copay != null ? parseFloat(prescription.copay) : 0) : 0
								};
								checkoutStores.push(checkoutStoreData);
								logger.debug("\n\n\n same store not found in array", JSON.stringify(checkoutStores, null, 4), "\n\n\n");
								return false;
							}
						}
					});

				} else {

					var checkoutStoreData = {
						section : "payment",
						itemTemplate : "checkoutStoreItems",
						masterWidth : 100,
						storeId : prescription.original_store_id,
						title : prescription.original_store_address_line1.trim(),
						subtitle : prescription.presc_name,
						amountDue : _.has(prescription, "copay") ? (prescription.copay != null ? parseFloat(prescription.copay) : 0) : 0
					};

					checkoutStores.push(checkoutStoreData);
					logger.debug("\n\n\n checkoutStores first element addition", JSON.stringify(checkoutStores, null, 4), "\n\n\n");

				}
			}
		}
	});

	logger.debug("\n\n\n final checkoutStores", JSON.stringify(checkoutStores, null, 4), "\n\n\n");
	_.each(checkoutStores, function(checkoutStoreData) {
		var rowParams = checkoutStoreData,
		    row,
		    limitedRowParams;

		if (checkoutStores.length < 3) {
			rowParams.filterText = _.values(_.pick(rowParams, ["title", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
			row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
		} else {

			limitedRowParams = {
				section : "payment",
				itemTemplate : "checkoutStoreItems",
				masterWidth : 100,
				title : rowParams.title,
				fullRowParams : rowParams
			};
			// ^^^^ Certainly there is a better way to do this!.....
			limitedRowParams.filterText = _.values(_.pick(rowParams, ["title"])).join(" ").toLowerCase();

			row = Alloy.createController("itemTemplates/".concat(limitedRowParams.itemTemplate), limitedRowParams);
			row.on("checkoutStoreDetails", presentCheckoutStoreDetails);
		}

		paymentSection.add(row.getView());
	});

	var totalAmountDue = 0;
	_.each(prescriptions, function(prescription) {
		if (_.has(prescription, "copay")) {
			if (prescription.copay != null) {
				totalAmountDue += parseFloat(prescription.copay);
			}
		}
	});

	totalAmountDue = totalAmountDue.toFixed(2);

	var payment = {
		section : "payment",
		itemTemplate : "creditCardView",
		masterWidth : 100,
		title : patient.get("card_type") + " " + $.strings.checkoutCCEndingIn + " " + patient.get("last_four_digits"),
		subtitle : $.strings.checkoutCCExpDate + patient.get("expiry_date"),
		amountDue : totalAmountDue
	};

	var rowParams = payment,
	    row1;

	rowParams.filterText = _.values(_.pick(rowParams, ["title", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
	row1 = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
	row1.on("clickedit", didClickCCEdit);

	paymentSection.add(row1.getView());
	data.push(paymentSection);
	$.tableView.setData(data);

	presentSubmitButton();
}

function presentCheckoutStoreDetails(e) {
	Ti.API.info("************      presentCheckoutStoreDetails(e) " + JSON.stringify(e.data.fullRowParams, null, 4));

	var dialogView = $.UI.create("ScrollView", {
		apiName : "ScrollView",
		classes : ["top", "auto-height", "vgroup"]
	});
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3", "txt-center"],
		text : e.data.fullRowParams.title
	}));
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h4", "txt-center"],
		text : e.data.fullRowParams.subtitle.trim()
	}));
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h4", "txt-center"],
		text : "$" + e.data.fullRowParams.amountDue.toFixed(2)
	}));

	var btn = $.UI.create("Button", {
		apiName : "Button",
		classes : ["margin-top", "margin-bottom-large", "margin-left-extra-large", "margin-right-extra-large", "bg-color", "primary-fg-color", "primary-border"],
		title : "close",
		index : 0
	});
	$.addListener(btn, "click", function() {
		$.storeDetailsDialog.hide();
	});
	dialogView.add(btn);

	$.storeDetailsDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
		classes : ["modal-dialog"],
		children : [dialogView]
	}));
	$.contentView.add($.storeDetailsDialog.getView());
	$.storeDetailsDialog.show();

}

function didClickCCEdit(e) {
	uihelper.showDialog({
		message : $.strings.checkoutEditCardInfo
	});
}

function presentSubmitButton() {
	if (OS_ANDROID) {
		var top = $.tableView.top,
		    bottom = $.tableView.bottom;

		$.tableView.applyProperties({
			top : top,
			bottom : bottom + $.submitBtn.height
		});
	}
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
			rx_name : prescription.presc_name,
			original_store_id : prescription.original_store_id
		});
	});

	logger.debug("\n\n\n Alloy.CFG.show_loyalty_signup ", $.utilities.getProperty(Alloy.CFG.show_loyalty_signup), "\n\n\n");
	logger.debug("\n\n\n patient show_loyalty_signup before ", JSON.stringify(Alloy.Collections.patients.at(0), null, 4), "\n\n\n");

	// $.utilities.setProperty(Alloy.Collections.patients.at(0).get("showLoyaltySignup"), $.utilities.getProperty(Alloy.CFG.show_loyalty_signup));

	Alloy.Collections.patients.findWhere({
		selected : true
	}).set("showLoyaltySignup", $.utilities.getProperty(Alloy.CFG.show_loyalty_signup) == "1" ? true : false);

	logger.debug("\n\n\n patient show_loyalty_signup after ", JSON.stringify(Alloy.Collections.patients.at(0), null, 4), "\n\n\n");

	$.http.request({
		method : "checkout_preferences_update",
		params : {
			data : [{
				checkout : {
					prescriptions : checkoutPrescriptions,
					counseling : counselingPrompt.toString(),
					useLoyaltyCard : loyaltyPrompt.toString(),
					usePatientDaw : dawPrompt.toString(),
					useCreditCard : useCreditCard,
					showLoyaltySignup : $.utilities.getProperty(Alloy.CFG.show_loyalty_signup) == "1" ? true : false,
					showRxNamesFlag : currentPatient.get("show_rx_names_flag")
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

		buttonNames : [$.strings.dialogBtnNo, $.strings.dialogBtnYes ],
		cancelIndex : -1,
		success : successMessageUserResponse

	});
}

function didFail(result, passthrough) {
	$.app.navigator.hideLoader();
	popToPrescriptions();
}


function successMessageUserResponse(whichButton) {
	if(whichButton === 1) {
		$.app.navigator.open({
			titleid : "titleExpressCheckout",
			ctrl : "expressCheckout",
			stack : true
		});
	} else {
		popToPrescriptions();
	}
}


function popToPrescriptions() {

	$.utilities.setProperty(Alloy.CFG.sync_after_checkout, "1");

		$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
			landing_page : true
		}).toJSON());

}

function didClickTableView(e) {

}

exports.init = init;

