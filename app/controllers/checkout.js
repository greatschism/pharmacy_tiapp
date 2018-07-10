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
    logger = require("logger"),
    titleClasses = ["bottom", "right"],
    subtitleClasses = ["bottom", "right"],
    optionClasses = ["bottom", "right", "custom-fg-color"],
    totalAmountDue = 0,
    delOptionsInfo,
    delAddressInfo,
    cardDetails = [],
    updateCardDetails = {},
    checkout;

var data = [],
    questionSection,
    deliveryItems,
    deliveryInfo,
    paymentInfo;

var sections = {
	questions : [],
	deliveryItems : [],
	deliveryInfo : [],
	paymentInfo : []
};

var sectionHeaders = {
	questions : "",
	deliveryItems : "Your Items",
	deliveryInfo : "Delivery Info",
	paymentInfo : "Your Payment Info",
};

var checkoutStores = [],
    deliveryOptions = [];

function init() {
	logger.debug("\n\n\n In init()\n\n\n");

	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];
	if (Alloy.CFG.is_counseling_enabled == "1") {
		getCodeCounselingEligible();
	}
	Alloy.Globals.currentTable = $.tableView;

	_.each(prescriptions, function(prescription) {
		if (_.has(prescription, "copay")) {
			if (prescription.copay != null) {
				totalAmountDue += parseFloat(prescription.copay);
			}
		}
	});

	totalAmountDue = totalAmountDue.toFixed(2);

	/**
	 * focus will be called whenever window gets focus / brought to front (closing a window)
	 * identify the first focus with a flag isWindowOpen
	 * Note: Moving this api call to init can show dialog on previous window on android
	 * as activities are created once window is opened
	 */
	if (!isWindowOpen) {
		isWindowOpen = true;
		/*
		 if (Alloy.CFG.is_delivery_option_enabled == 1) {
		 prepareDeliveryList();
		 } else {
		 prepareList();
		 }*/

		getCardDetails();

		if (Alloy.CFG.is_delivery_option_enabled == 1) {
			getDeliveryOptions();
		}
	}
}

function focus() {
	logger.debug("\n\n\n In focus()\n\n\n");

	currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});

	if ($.utilities.getProperty(Alloy.CFG.show_saved_delivery_info) === "1") {
		updateDeliveryInfo();
	}

	if ($.utilities.getProperty(Alloy.CFG.show_updated_card_info) === "1") {
		updateCreditCardView();
	}

}

function updateDeliveryInfo() {
	var updatedDeliveryAddress = currentPatient.get("deliveryAddress");

	logger.debug("\n\n\n updatedDeliveryAddress	 ", JSON.stringify(updatedDeliveryAddress, null, 4), "\n\n\n");

	var count = 0;

	_.each(sections, function(rows, sid) {

		if (sid === "deliveryInfo") {
			var index = count - 1;

			_.each(rows, function(row, rid) {
				index++;
				var params = row.getParams();
				logger.debug("\n\n\n params		 ", JSON.stringify(params, null, 4), "\n\n\n");

				params.address = updatedDeliveryAddress.address + "\n" + updatedDeliveryAddress.city + ", " + updatedDeliveryAddress.state + " " + updatedDeliveryAddress.zip + "\n" + (updatedDeliveryAddress.phone != null ? updatedDeliveryAddress.phone : (currentPatient.get("mobile_number") != null ? ($.utilities.isPhoneNumber(currentPatient.get("mobile_number")) ? $.utilities.formatPhoneNumber(currentPatient.get("mobile_number")) : "" ) : "" )),
				delAddressInfo =
				updatedDeliveryAddress;
				var titleClasses = ["right", "width-50", "h6"];
				var optionClasses = ["bottom", "right", "fg-color"];

				params.titleClasses = titleClasses;

				var selectedDeliveryType = "Select an option";
				var selectedDeliveryAmount = "0";

				Alloy.Collections.deliveryOptions.some(function(option, index) {
					if (option.get("selected") == true) {
						selectedDeliveryType = option.get("deliveryOptions");
						selectedDeliveryAmount = option.get("deliveryAmount");
						params.optionClasses = optionClasses;

						return true;
					}
					return false;
				});

				params.deliveryOption = selectedDeliveryType;
				params.detailTitle = "$" + selectedDeliveryAmount;
				params.detailSubtitle = "$".concat((parseFloat(selectedDeliveryAmount) + parseFloat(totalAmountDue)).toFixed(2));

				var newRow = Alloy.createController("itemTemplates/deliveryInfo", params);

				$.tableView.updateRow( OS_IOS ? index : row.getView(), newRow.getView());
				rows[rid] = newRow;
				rows[rid].on("clickDeliveryMethod", didClickEditInfo);

			});
		}
		count += rows.length;

	});

}

function updateCreditCardView() {
	var updatedCardDetails = currentPatient.get("cardDetails");

	var count = 0;

	_.each(sections, function(rows, sid) {
		logger.debug("\n\n\n sid		 ", sid, "\n\n\n");

		if (sid === "paymentInfo") {
			var index = count - 1;
			if (rows.length == 0) {

				var card;
				_.some(currentPatient.get("cardDetails"), function(cardDet, index) {
					if (cardDet.priorityOrder == "1") {
						card = cardDet;
						return true;
					}
					return false;
				});

				if (!card) {
					card = currentPatient.get("cardDetails")[0];
				}

				var payment = {
					section : "paymentInfo",
					itemTemplate : "creditCardView",
					masterWidth : 100,
					title : card.paymentType.paymentTypeDesc + " " + Alloy.Globals.strings.checkoutCCEndingIn + " " + card.lastFourDigits,
					subtitle : Alloy.Globals.strings.checkoutCCExpDate + " " + card.expiryDate,
					showEditIcon : false
				};

				var rowParams = payment,
				    row1;

				rowParams.filterText = _.values(_.pick(rowParams, ["title", "subtitle"])).join(" ").toLowerCase();
				row1 = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
				row1.on("clickedit", didClickCCEdit);

				sectionHeaders[rowParams.section] += rowParams.filterText;
				sections[rowParams.section].push(row1);
				paymentInfo.add(row1.getView());

				data.pop();
				data.push(paymentInfo);
				$.tableView.setData(data);

			} else {
				_.each(rows, function(row, rid) {

					index++;
					var params = row.getParams();
					logger.debug("\n\n\n params		 ", JSON.stringify(params, null, 4), "\n\n\n");

					var card;
					_.some(updatedCardDetails, function(cardDet, index) {
						if (cardDet.selected == true) {
							card = cardDet;
							return true;
						}
						return false;
					});

					logger.debug("\n\n\n update card view		 ", JSON.stringify(card, null, 4), "\n\n\n");

					if (!card) {
						logger.debug("\n\n\n No default card \n\n\n");

						card = updatedCardDetails[0];
					}

					params.title = card.paymentType.paymentTypeDesc + " " + Alloy.Globals.strings.checkoutCCEndingIn + " " + card.lastFourDigits;
					params.subtitle = Alloy.Globals.strings.checkoutCCExpDate + " " + card.expiryDate;
					params.showEditIcon = false;

					var newRow = Alloy.createController("itemTemplates/creditCardView", params);

					$.tableView.updateRow( OS_IOS ? index : row.getView(), newRow.getView());
					rows[rid] = newRow;
				});
			}
		}
		count += rows.length;

	});
}

function getDeliveryOptions() {
	if (prescriptions.length) {
		$.http.request({
			method : "delivery_options_get",
			params : {
				data : [{
					delivery : {
						original_store_id : prescriptions[0].original_store_id
					}
				}]
			},
			keepLoader : true,
			errorDialogEnabled : true,
			success : didGetDeliveryOptions,
			failure : didGetDeliveryOptions
		});
	}
}

function didGetDeliveryOptions(result, passthrough) {
	$.app.navigator.hideLoader();

	if (result.data) {
		delOptionsInfo = result.data;
		_.each(delOptionsInfo.DeliveryModeDetails, function(deliveryMode, index) {
			_.extend(deliveryMode, {
				selected : false,
				enabled : true
			});
		});
		Alloy.Collections.deliveryOptions.set(delOptionsInfo.DeliveryModeDetails);
		logger.debug("\n\n\n Alloy.Collections.deliveryOptions		", JSON.stringify(Alloy.Collections.deliveryOptions, null, 4), "\n\n\n");
	}
}

function getCardDetails() {

	$.http.request({
		method : "patient_creditcard_get",
		params : {
			data : [{
				getCreditCard : {
					fetchAll : "1"
				}
			}]
		},
		keepLoader : true,
		errorDialogEnabled : true,
		success : didGetCardDetails,
		failure : didFailCardDetails
	});
}

function didFailCardDetails(error, passthrough) {
	$.app.navigator.hideLoader();
	prepareList();
}

function didGetCardDetails(result, passthrough) {
	$.app.navigator.hideLoader();

	logger.debug("\n\n\n currentPatient		", JSON.stringify(currentPatient, null, 4), "\n\n\n");

	if (result.data) {
		cardDetails = result.data.CreditCard;

		_.each(cardDetails, function(card, index) {
			_.extend(card, {
				selected : card.priorityOrder == "1" ? true : false
			});
		});
		var xyz = {
			cardDetails : cardDetails
		};
		currentPatient.set(xyz);

		logger.debug("\n\n\n currentPatient		", JSON.stringify(currentPatient, null, 4), "\n\n\n");
	}

	prepareList();
}

function prepareDeliveryItems() {
	// prescriptions for delivery
	deliveryItems = $.uihelper.createTableViewSection($, "Your Items", sectionHeaders["deliveryItems"], false);

	_.each(prescriptions, function(prescription) {
		var amount = prescription.copay != null ? prescription.copay : "0";

		var tClasses = ["left", "h5"],
		    sClasses = ["margin-top-small", "left", "h7", "inactive-fg-color"];
		var itemsToDeliver = {
			section : "deliveryItems",
			itemTemplate : "masterDetail",
			masterWidth : 70,
			detailWidth : 30,
			title : prescription.title,
			subtitle : $.strings.strPrefixRx.concat(prescription.rx_number),
			detailTitle : "$".concat(parseFloat(amount).toFixed(2)),
			detailType : "positive",
			titleClasses : tClasses,
			subtitleClasses : sClasses
		};

		var rowParams = itemsToDeliver,
		    row;

		rowParams.filterText = _.values(_.pick(rowParams, ["title", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
		row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);

		sectionHeaders[rowParams.section] += rowParams.filterText;
		sections[rowParams.section].push(row);
		deliveryItems.add(row.getView());

	});
	data.push(deliveryItems);
	$.tableView.setData(data);

	prepareDeliveryInfo();
}

function prepareDeliveryInfo() {

	var headerBtnDict = $.createStyle({
		classes : ["right", "h5", "bg-color-disabled", "primary-fg-color", "border-disabled", "bubble-disabled"],
		id : "editDeliveryInfoBtn",
		sectionId : "deliveryInfo",
		secondaryHeader : false,
		callback : didClickEditInfo,
		title : "Edit"
	});

	deliveryInfo = $.uihelper.createTableViewSection($, "Delivery Options", sectionHeaders["deliveryInfo"], false, headerBtnDict);

	logger.debug("\n\n\n currentPatient deliveryAddress  		", JSON.stringify(currentPatient.get("deliveryAddress"), null, 4), "\n\n\n");
	if (currentPatient.get("deliveryAddress")) {
		if (currentPatient.get("deliveryAddress").length) {
			delAddressInfo = currentPatient.get("deliveryAddress");
		} else {
			delAddressInfo = {
				address : currentPatient.get("address_line1"),
				city : currentPatient.get("city"),
				state : currentPatient.get("state"),
				zip : currentPatient.get("zip"),
				phone : currentPatient.get("mobile_number") != null ? ($.utilities.isPhoneNumber(currentPatient.get("mobile_number")) ? $.utilities.formatPhoneNumber(currentPatient.get("mobile_number")) : "" ) : ""
			};
		}
	} else {
		delAddressInfo = {
			address : currentPatient.get("address_line1"),
			city : currentPatient.get("city"),
			state : currentPatient.get("state"),
			zip : currentPatient.get("zip"),
			phone : currentPatient.get("mobile_number") != null ? ($.utilities.isPhoneNumber(currentPatient.get("mobile_number")) ? $.utilities.formatPhoneNumber(currentPatient.get("mobile_number")) : "" ) : ""
		};
	}

	var deliveryData = {
		section : "deliveryInfo",
		itemTemplate : "deliveryInfo",
		masterWidth : 100,
		address : delAddressInfo.address + "\n" + delAddressInfo.city + ", " + delAddressInfo.state + " " + delAddressInfo.zip + "\n" + delAddressInfo.phone,
		titleClasses : titleClasses,
		subtitleClasses : subtitleClasses,
		deliveryOption : "Select an option",
		optionClasses : optionClasses,
		tertiaryTitle : "$" + totalAmountDue,
		detailTitle : "$0.00",
		detailSubtitle : "$" + totalAmountDue
	};

	var rowParams = deliveryData,
	    row;
	logger.debug("\n\n\n rowParams  		", JSON.stringify(rowParams, null, 4), "\n\n\n");
	rowParams.filterText = "";
	row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
	row.on("clickDeliveryMethod", didClickEditInfo);

	sectionHeaders[rowParams.section] += rowParams.filterText;
	sections[rowParams.section].push(row);
	deliveryInfo.add(row.getView());
	data.push(deliveryInfo);
	$.tableView.setData(data);

	prepareCreditCardView();

}

function prepareCreditCardView() {
	if (currentPatient.get("cardDetails")) {

		var headerBtnDict = $.createStyle({
			classes : ["right", "h5", "bg-color-disabled", "primary-fg-color", "border-disabled", "bubble-disabled"],
			id : "editPaymentInfoBtn",
			sectionId : "paymentInfo",
			secondaryHeader : false,
			callback : didClickCCEdit,
			title : "Edit"
		});

		paymentInfo = $.uihelper.createTableViewSection($, "Payment Info", sectionHeaders["paymentInfo"], false, headerBtnDict);

		var card;
		_.some(currentPatient.get("cardDetails"), function(cardDet, index) {
			if (cardDet.priorityOrder == "1") {
				card = cardDet;
				return true;
			}
			return false;
		});

		if (!card) {
			card = currentPatient.get("cardDetails")[0];
		}

		var payment = {
			section : "paymentInfo",
			itemTemplate : "creditCardView",
			masterWidth : 100,
			title : card.paymentType.paymentTypeDesc + " " + Alloy.Globals.strings.checkoutCCEndingIn + " " + card.lastFourDigits,
			subtitle : Alloy.Globals.strings.checkoutCCExpDate + " " + card.expiryDate,
			showEditIcon : false
		};

		var rowParams = payment,
		    row1;

		rowParams.filterText = _.values(_.pick(rowParams, ["title", "subtitle"])).join(" ").toLowerCase();
		row1 = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
		row1.on("clickedit", didClickCCEdit);

		sectionHeaders[rowParams.section] += rowParams.filterText;
		sections[rowParams.section].push(row1);
		paymentInfo.add(row1.getView());
		data.push(paymentInfo);
		$.tableView.setData(data);

	} else {
		if (Alloy.CFG.add_card_if_not_onfile === "1") {
			var headerBtnDict = $.createStyle({
				classes : ["right", "h5", "bg-color-disabled", "primary-fg-color", "border-disabled", "bubble-disabled"],
				id : "editPaymentInfoBtn",
				sectionId : "paymentInfo",
				secondaryHeader : false,
				callback : didClickCCEdit,
				title : "Edit"
			});

			paymentInfo = $.uihelper.createTableViewSection($, "Payment Info", sectionHeaders["paymentInfo"], false, headerBtnDict);
			data.push(paymentInfo);
			$.tableView.setData(data);
		}

	}

	presentSubmitButton();

}

function didClickEditInfo(e) {
	var currentDate = new Date();

	var currentDeviceTimeHours = currentDate.getHours('hh');
	var currentDeviceTimeMinutes = currentDate.getMinutes('mm');

	logger.debug("\n\n\n currentDeviceTime  		", currentDeviceTimeHours, " ", currentDeviceTimeMinutes, "\n\n\n");

	var deliveryTimeLimit = Alloy.CFG.delivery_time_limit.split(':');
	logger.debug("\n\n\n deliveryTimeLimit  		", deliveryTimeLimit[0], deliveryTimeLimit[1], "\n\n\n");
	var isAfter = false;

	if (currentDeviceTimeHours == deliveryTimeLimit[0] && currentDeviceTimeMinutes >= deliveryTimeLimit[1]) {
		isAfter = true;
	} else if (currentDeviceTimeHours > deliveryTimeLimit[0]) {
		isAfter = true;
	}

	var matchIndex = -1;
	if (isAfter == true) {
		_.some(delOptionsInfo.DeliveryModeDetails, function(deliveryMode, index) {
			if (deliveryMode.deliveryOptions == "Today") {
				matchIndex = index;
				return true;
			}
		});

		if (matchIndex >= 0) {

			Alloy.Collections.deliveryOptions.each(function(option, index) {
				if (index == matchIndex) {
					option.set("enabled", false);
				}
			});

			delOptionsInfo.DeliveryModeDetails.splice(matchIndex, 1);
		}
	}

	$.app.navigator.open({
		titleid : "titleDeliveryOptions",
		ctrl : "deliveryOptionsEdit",
		ctrlArguments : {
			delAddress : delAddressInfo
		},
		stack : true
	});
}

function getCodeCounselingEligible() {
	$.http.request({
		method : "codes_get",
		params : {
			data : [{
				codes : [{
					code_name : Alloy.CFG.apiCodes.code_counseling_eligible
				}]
			}]
		},
		//keepLoader : true,
		forceRetry : false,
		success : didGetCounselingEligible
	});
}

function didGetCounselingEligible(result, passthrough) {
	Alloy.Models.counselingEligible.set(result.data.codes[0]);
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

	if (addDawRow && Alloy.CFG.is_delivery_option_enabled != 1) {
		//strip last newline character from list of rx names if applicable
		dawRx = dawRx.substring(0, (dawRx.length - 2));
		presentGenericsPrompt(dawRx);
		$.tableView.setData(data);
	} else {
		$.tableView.setData(data);
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
	if (Alloy.CFG.is_counseling_enabled == "1") {

		var values = Alloy.Models.counselingEligible.get("code_values").map(function(item) {
			return item.code_value;
		});

		// TODO if (valu) e.data.answer = 0
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
	} else if (Alloy.CFG.is_delivery_option_enabled == 1) {
		prepareDeliveryItems();
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

	paymentInfo = Ti.UI.createTableViewSection();

	paymentInfo.add(Alloy.createController("itemTemplates/label", {
		title : $.strings.checkoutPaymentInformation,
		rowClasses : ["left", "h5", "inactive-light-bg-color", "inactive-fg-color"]
	}).getView());

	/*
	 * show original store of each Rx with amountdue for each store
	 */
	var titleClasses = ["active-fg-color", "margin-left"];

	checkoutStores = [];
	_.each(prescriptions, function(prescription) {
		if (_.has(prescription, "original_store_address_line1")) {
			if (prescription.original_store_address_line1 != null) {
				if (checkoutStores.length) {
					logger.debug("\n\n\n checkoutStores has contents\n\n\n");
					_.some(checkoutStores, function(storeInfo, index) {
						logger.debug("\n\n\n storeInfo to evaluate", JSON.stringify(storeInfo, null, 4), "\n\n\n");
						if (storeInfo.storeId == prescription.original_store_id) {
							logger.debug("\n\n\n same store found: previous amount", JSON.stringify(storeInfo, null, 4), "\n\n\n");
							storeInfo.amountDue += _.has(prescription, "copay") ? (prescription.copay != null ? parseFloat(prescription.copay) : 0) : 0;
							storeInfo.subtitle = storeInfo.subtitle.concat("\n" + prescription.presc_name), logger.debug("\n\n\n same store found: new amount", JSON.stringify(storeInfo, null, 4), "\n\n\n");
							return true;
						} else {
							if (index >= checkoutStores.length - 1) {
								var checkoutStoreData = {
									section : "paymentInfo",
									itemTemplate : "checkoutStoreItems",
									masterWidth : 100,
									storeId : prescription.original_store_id,
									title : (Alloy.CFG.is_specialty_store_grouping_enabled && prescription.is_specialty_store == 1) ? prescription.store_phone : prescription.original_store_address_line1.trim(),
									titleClasses : (Alloy.CFG.is_specialty_store_grouping_enabled && prescription.is_specialty_store == 1) ? titleClasses : "",
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
						section : "paymentInfo",
						itemTemplate : "checkoutStoreItems",
						masterWidth : 100,
						storeId : prescription.original_store_id,
						title : (Alloy.CFG.is_specialty_store_grouping_enabled && prescription.is_specialty_store == 1) ? prescription.store_phone : prescription.original_store_address_line1.trim(),
						titleClasses : (Alloy.CFG.is_specialty_store_grouping_enabled && prescription.is_specialty_store == 1) ? titleClasses : "",
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
			if ($.utilities.validatePhoneNumber(rowParams.title)) {
				row.on("clickPhone", didClickPhone);
			}
		} else {

			limitedRowParams = {
				section : "paymentInfo",
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

		paymentInfo.add(row.getView());
	});

	var payment = {
		section : "paymentInfo",
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

	paymentInfo.add(row1.getView());
	data.push(paymentInfo);
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
	$.app.navigator.open({
		titleid : "titlePaymentMethod",
		ctrl : "paymentOptionsEdit",
		ctrlArguments : {
			// cardInfo : cardDetails
			cardInfo : currentPatient.get("cardDetails")
		},
		stack : true
	});
}

function didGetCreditCardDetails(result, passthrough) {
	/*
	 uihelper.showDialog({
	 message : Alloy.Globals.strings.checkoutEditCardInfo
	 });*/
	$.app.navigator.hideLoader();

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
	$.submitBtn.show();
}

function didClickSubmit(e) {

	Ti.API.info("didClickSubmit");

	var checkoutPrescriptions = [];

	_.each(prescriptions, function(prescription) {
		checkoutPrescriptions.push({
			id : prescription.id,
			rx_number : prescription.rx_number,
			rx_name : prescription.presc_name,
			original_store_id : prescription.original_store_id,
			copay : prescription.copay
		});
	});
	logger.debug("\n\n\n Alloy.CFG.show_loyalty_signup ", $.utilities.getProperty(Alloy.CFG.show_loyalty_signup), "\n\n\n");
	logger.debug("\n\n\n patient show_loyalty_signup before ", JSON.stringify(Alloy.Collections.patients.at(0), null, 4), "\n\n\n");

	// $.utilities.setProperty(Alloy.Collections.patients.at(0).get("showLoyaltySignup"), $.utilities.getProperty(Alloy.CFG.show_loyalty_signup));

	Alloy.Collections.patients.findWhere({
		selected : true
	}).set("showLoyaltySignup", $.utilities.getProperty(Alloy.CFG.show_loyalty_signup) == "1" ? true : false);

	logger.debug("\n\n\n patient show_loyalty_signup after ", JSON.stringify(Alloy.Collections.patients.at(0), null, 4), "\n\n\n");

	if (Alloy.CFG.is_delivery_option_enabled == 1) {
		logger.debug("\n\n\n updatedDeliveryAddress	 ", JSON.stringify(delAddressInfo, null, 4), "\n\n\n");

		var selectedDeliveryType = "";
		Alloy.Collections.deliveryOptions.some(function(option, index) {
			if (option.get("selected") == true) {
				selectedDeliveryType = option.get("deliveryOptions");
				return true;
			}
			return false;
		});

		if (selectedDeliveryType == "") {
			$.uihelper.showDialog({
				message : "Please select a delivery method."
			});
			return;
		}

		if (! currentPatient.get("cardDetails") && (totalAmountDue != 0.00)) {
			$.uihelper.showDialog({
				message : "Please add/select a card."
			});
			return;
		}

		var cardDetails = currentPatient.get("cardDetails");
		var card;
		_.some(cardDetails, function(cardDet, index) {
			if (cardDet.selected == true) {
				card = cardDet;
				return true;
			}
			return false;
		});

		if (!card) {
			_.some(cardDetails, function(cardDet, index) {
				if (cardDet.priorityOrder == "1") {
					card = cardDet;
					return true;
				}
				return false;
			});

			if (!card) {
				card = cardDetails[0];
			}
		}

		_.extend(updateCardDetails, {
			cardDetails : card
		});

		checkout = {
			prescriptions : checkoutPrescriptions,
			deliveryDetail : {
				type : selectedDeliveryType,
				address_line : delAddressInfo.address,
				city : delAddressInfo.city,
				state : delAddressInfo.state,
				zip : delAddressInfo.zip,
				mobile_number : $.utilities.validatePhoneNumber(delAddressInfo.phone),
				instructions : ""
			},
			cardDetails : {
				creditCardType : card.paymentType.paymentTypeDesc,
				lastFourDigit : card.lastFourDigits,
				expirationDate : card.expiryDate
			},
			counseling : Alloy.CFG.is_counseling_enabled == "1" ? counselingPrompt.toString() : "1",
			useLoyaltyCard : loyaltyPrompt.toString(),
			usePatientDaw : dawPrompt.toString(),
			useCreditCard : "1",
			showLoyaltySignup : $.utilities.getProperty(Alloy.CFG.show_loyalty_signup) == "1" ? true : false,
			showRxNamesFlag : currentPatient.get("show_rx_names_flag")
		};
	} else {
		checkout = {
			prescriptions : checkoutPrescriptions,
			counseling : Alloy.CFG.is_counseling_enabled == "1" ? counselingPrompt.toString() : null,
			useLoyaltyCard : loyaltyPrompt.toString(),
			usePatientDaw : dawPrompt.toString(),
			useCreditCard : useCreditCard,
			showLoyaltySignup : $.utilities.getProperty(Alloy.CFG.show_loyalty_signup) == "1" ? true : false,
			showRxNamesFlag : currentPatient.get("show_rx_names_flag")
		};
	}

	var deliveryCharge = 0.0;
	Alloy.Collections.deliveryOptions.some(function(option, index) {
		if (option.get("selected") == true) {
			deliveryCharge = option.get("deliveryAmount");
		}
	});

	_.extend(checkout, {
		totalAmount : totalAmountDue,
		deliveryCharge : deliveryCharge,
	});

	/*
	 $.app.navigator.open({
	 titleid : "Summary",
	 ctrl : "checkoutSuccessSummary",
	 ctrlArguments : {
	 checkoutDetails : checkout
	 },
	 stack : false
	 });
	 */

	$.http.request({
		method : "checkout_preferences_update",
		params : {
			data : [{
				checkout : checkout
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
	_.extend(checkout, {
		orderId : result.data.orderNumber
	});
	$.app.navigator.hideLoader();
	updateCard();
}

function didFail(result, passthrough) {
	$.app.navigator.hideLoader();
	// updateCard();
	popToHome();
}

function successMessageUserResponse(whichButton) {
	if (whichButton === 1) {
		$.app.navigator.open({
			titleid : "titleExpressPickup",
			ctrl : "expressCheckout",
			stack : true
		});
	} else {
		popToHome();
	}
}

function popToHome() {

	$.utilities.setProperty(Alloy.CFG.sync_after_checkout, "1");

	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());

}

function updateCard() {
	var billingAddress = currentPatient.get("billingAddress");

	if (!billingAddress) {
		billingAddress = {
			name : currentPatient.get("first_name") + " " + currentPatient.get("last_name"),
			address : currentPatient.get("address_line1"),
			city : currentPatient.get("city"),
			state : currentPatient.get("state"),
			zip : currentPatient.get("zip")
		};

	}

	var cardDetails = updateCardDetails.cardDetails;

	$.http.request({
		method : "patient_creditcard_update",
		params : {
			data : [{
				updateCreditCard : {
					sequenceNumber : "1",
					cardType : cardDetails.paymentType.pdxIdentifier,
					expirationDate : cardDetails.expiryDate,
					name : billingAddress.name,
					address : billingAddress.address,
					zipCode : billingAddress.zip,
					lastFourDigits : cardDetails.lastFourDigits,
					token : cardDetails.ccToken,
					paymentProcessorType : cardDetails.paymentType.paymentTypeId
				}
			}]
		},
		keepLoader : true,
		errorDialogEnabled : false,
		success : didUpdateCard,
		failure : didUpdateCard
	});
}

function didUpdateCard(result, passthrough) {
	$.app.navigator.hideLoader();

	var deliveryCharge = 0.0;
	Alloy.Collections.deliveryOptions.some(function(option, index) {
		if (option.get("selected") == true) {
			deliveryCharge = option.get("deliveryAmount");
		}
	});

	_.extend(checkout, {
		totalAmount : totalAmountDue,
		deliveryCharge : deliveryCharge
	});
	$.app.navigator.open({
		titleid : "Summary",
		ctrl : "checkoutSuccessSummary",
		ctrlArguments : {
			checkoutDetails : checkout
		},
		stack : false
	});
}

function didClickTableView(e) {

}

function didClickPhone(e) {
	if ($.utilities.validatePhoneNumber(e.data.title)) {
		if (!Titanium.Contacts.hasContactsPermissions()) {
			Titanium.Contacts.requestContactsPermissions(function(result) {
				if (result.success) {
					$.uihelper.getPhone({
						firstName : e.data.title,
						phone : {
							work : [e.data.title]
						}
					}, e.data.subtitle);
				} else {
					$.analyticsHandler.trackEvent("checkoutSpecialty-ContactDetails", "click", "DeniedContactsPermission");
				}
			});
		} else {
			$.uihelper.getPhone({
				firstName : e.data.title,
				phone : {
					work : [e.data.title]
				}
			}, e.data.title);
		}
	}
}

function didClickCloseDeliveryOptions(e) {

	if ($.deliveryOptionsPicker.getSelectedItems()[0]) {
		logger.debug("\n\n\n", JSON.stringify($.deliveryOptionsPicker.getSelectedItems()[0], null, 4), "\n\n\n");

		var deliveryOptionDetail = $.deliveryOptionsPicker.getSelectedItems()[0];
		var sectionId = "deliveryInfo";

		var count = 0;
		var index = count - 1;

		_.some(sections, function(rows, sid) {
			if (sid === sectionId) {
				_.each(rows, function(row, rid) {
					/**
					 * index for this row
					 */
					index++;
					var params = row.getParams();
					params.deliveryOption = deliveryOptionDetail.title;
					params.tertiaryTitle = params.tertiaryTitle;
					params.detailTitle = "$" + deliveryOptionDetail.value;
					params.detailSubtitle = "$".concat(parseFloat(totalAmountDue) + parseFloat(deliveryOptionDetail.value));

					rows[rid] = Alloy.createController("itemTemplates/deliveryInfo", params);
					$.tableView.updateRow( OS_IOS ? index : row.getView(), rows[rid].getView());
				});
			} else {
				index += rows.length;
			}
		});
	}

	$.deliveryOptionsPicker.hide();
}

exports.init = init;
exports.focus = focus;
