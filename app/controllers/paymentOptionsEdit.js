var args = $.args,
    moment = require("alloy/moment"),
    logger = require("logger"),
    authenticator = require("authenticator"),
    isWindowOpen,
    httpClient,
    utilities = require("utilities"),
    apiCodes = Alloy.CFG.apiCodes,
    currentPatient,
    httpClient = require("http"),

    cardsOnFile = args.cardInfo,
    transactionToken = "",
    transactionID = "";

var footerHeight = 0;

var data = [],
    cardTypes,
    billingInfo;

var sections = {
	cardTypes : [],
	billingInfo : []
};

var sectionHeaders = {
	cardTypes : "",
	billingInfo : "Enter the card holder name and billing address"
};

function init() {
	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];
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
		showCardsOnFile();
	}
	currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
}

function showCardsOnFile() {
	logger.debug("\n\n\nIn args			", JSON.stringify(args, null, 4), "\n\n\n\n");

	cardTypes = $.uihelper.createTableViewSection($, "", sectionHeaders["cardTypes"], false);

	/*
	 {
	 "customerId": 1401,
	 "paymentType": {
	 "paymentTypeId": 2,
	 "paymentTypeDesc": "Visa",
	 "pdxIdentifier": 2,
	 "mckessonIdentifier": null
	 },
	 "lastFourDigits": "0007",
	 "expiryDate": "12/49"
	 }*/

	_.each(cardsOnFile, function(card, index) {
		var tClasses = ["left", "h5"],
		    sClasses = ["margin-top-small", "left", "h7", "inactive-fg-color"];
		var cardDetails = {
			section : "cardTypes",
			itemTemplate : "masterDetailWithLIcon",
			masterWidth : 100,
			detailWidth : 0,
			title : card.paymentType.paymentTypeDesc + " " + Alloy.Globals.strings.checkoutCCEndingIn + " " + card.lastFourDigits,
			titleClasses : tClasses,
			selected : card.selected
		};

		var rowParams = cardDetails,
		    row;

		rowParams.filterText = _.values(_.pick(rowParams, ["title", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
		row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);

		sectionHeaders[rowParams.section] += rowParams.filterText;
		sections[rowParams.section].push(row);
		cardTypes.add(row.getView());

	});
	data.push(cardTypes);
	$.tableView.setData(data);
}

function showBillingAddress() {
	billingInfo = $.uihelper.createTableViewSection($, "Enter the card holder name and billing address", sectionHeaders["billingInfo"], false);

	var tClasses = ["h5"],
	    sClasses = ["margin-top-small", "left", "h7", "inactive-fg-color"];
	var billingDetails = {
		section : "billingInfo",
		itemTemplate : "cardHolderDetails",
		name : currentPatient.get("first_name") + " " + currentPatient.get("last_name"),
		address : currentPatient.get("address_line1"),
		city : currentPatient.get("city"),
		state : currentPatient.get("state"),
		zip : currentPatient.get("zip")
	};

	var rowParams = billingDetails,
	    row;

	// rowParams.filterText = _.values(_.pick(rowParams, ["name", "address", "city"])).join(" ").toLowerCase();
	row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);

	sectionHeaders[rowParams.section] += rowParams.filterText;
	sections[rowParams.section].push(row);
	billingInfo.add(row.getView());

	data.push(billingInfo);
	$.tableView.setData(data);

	$.submitBtn.title = $.strings.prescBtnNext;
}

function didClickAdd(e) {
	$.footerView.hide();
	footerHeight = $.footerView.height;
	$.footerView.height = 0;

	$.submitBtn.removeEventListener('click', popToCheckout);
	$.submitBtn.removeEventListener('click', didClickSubmit);
	$.submitBtn.addEventListener('click', didClickNext);

	showBillingAddress();
}

function didClickNext(e) {
	if (validateData()) {
		getToken();
		$.cardInfoView.show();
		$.submitBtn.removeEventListener('click', didClickNext);
		$.submitBtn.addEventListener('click', popToCheckout);
		$.submitBtn.title = $.strings.paymentDetBtnSubmit;
	}
}

function didClickTableView(e) {

	var index = e.index;
	var count = 0;

	_.each(sections, function(rows, sid) {
		if (sid === "cardTypes") {
			var rIndex = count - 1;
			_.each(rows, function(row, rid) {
				rIndex++;
				var params = row.getParams();

				if (index == rid) {
					params.selected = !params.selected;
				} else {
					params.selected = false;
				}
				rows[rid] = Alloy.createController("itemTemplates/masterDetailWithLIcon", params);
				$.tableView.updateRow( OS_IOS ? rIndex : row.getView(), rows[rid].getView());

			});
		}
		count += rows.length;
	});

}

function validateData() {
	var selectedBillingAddr = false;
	var selectedBillingAddressIndex = -1;

	var count = 0;
	var rIndex = count - 1;
	_.each(sections, function(rows, sid) {
		if (sid === "billingInfo") {
			_.each(rows, function(row, rid) {
				rIndex++;

				var params = row.getValues();
				logger.debug("\n\n\n params 		", JSON.stringify(params, null, 4), "\n\n\n");
				if (params) {
					if (params.name.trim() == "" || params.address.trim() == "" || params.city.trim() == "" || params.state.trim() == "" || params.zip.trim() == "") {
						selectedBillingAddr = false;
					} else {
						selectedBillingAddr = true;
						selectedBillingAddressIndex = rid;

						logger.debug("\n\n\n selectedBillingAddressIndex 		", selectedBillingAddressIndex, "\n\n\n");
					}
				}
			});
		}
		count += rows.length;
	});

	if (selectedBillingAddr === false) {
		$.uihelper.showDialog({
			message : "Please enter the complete Billing Information"
		});

		return false;
	} else {
		_.each(sections, function(rows, sid) {
			if (sid === "billingInfo") {
				_.each(rows, function(row, rid) {
					if (rid === selectedBillingAddressIndex) {
						var params = row.getValues();

						var updatedBillingAddress = {
							name : params.name.trim(),
							address : params.address.trim(),
							city : params.city.trim(),
							state : params.state.trim(),
							zip : params.zip.trim()
						};
						var xyz = {
							billingAddress : updatedBillingAddress
						};

						currentPatient.set(xyz);
						logger.debug("\n\n\n currentPatient 		", JSON.stringify(currentPatient, null, 4), "\n\n\n");
					}
				});
			}
		});
	}

	return true;
}

function didClickSubmit(e) {

	var selectedCard = false;
	var selectedCardIndex = -1;

	var count = 0;
	var rIndex = count - 1;
	_.each(sections, function(rows, sid) {
		if (sid === "cardTypes") {
			_.some(rows, function(row, rid) {
				rIndex++;

				var params = row.getParams();
				logger.debug("\n\n\n params 		", JSON.stringify(params, null, 4), "\n\n\n");
				if (params) {

					if (params.selected == true) {
						selectedCard = true;
						selectedCardIndex = rid;
						logger.debug("\n\n\n selectedCardIndex 		", selectedCardIndex, "\n\n\n");
						return true;
					} else {
						selectedCard = false;
					}
					return false;
				}
			});
		}
		count += rows.length;
	});

	if (selectedCard === false) {
		$.uihelper.showDialog({
			message : "Please select a card"
		});

		return false;
	} else {
		_.each(cardsOnFile, function(card, index) {
			_.extend(card, {
				selected : index === selectedCardIndex ? true : false
			});
		});

		var xyz = {
			cardDetails : cardsOnFile
		};
		currentPatient.set(xyz);
		// logger.debug("\n\n\n cardsOnFile		", JSON.stringify(cardsOnFile, null, 4), "\n\n\n");
		$.utilities.setProperty(Alloy.CFG.show_updated_card_info, "1");
	}

	popToCheckout();
}

function applyWebViewProperties(url) {

	showLoader();

	$.webView.addEventListener('load', webViewDidLoad);

	$.webView.applyProperties({
		url : url
	});

	$.webView.willHandleTouches = false;
	$.webView.handlePlatformUrl = false;
}

function webViewDidLoad(e) {

	Ti.API.info("onload resp " + JSON.stringify(e));

	var actualHeight = 0;
	if (OS_ANDROID) {
		actualHeight = $.app.device.height;
		// e.source.evalJS('document.documentElement.scrollHeight;');
	} else {
		actualHeight = e.source.evalJS('document.documentElement.clientHeight;');
	}

	Ti.API.info("source height 	" + e.source.evalJS('document.documentElement.scrollHeight;'));
	e.source.height = parseInt(actualHeight);

	if (!$.webView.loading) {
		logger.debug("\n\n\n\n Done loading webview - - - - - - - - - \n\n\n");

		$.webView.removeEventListener('load', webViewDidLoad);

		$.webView.addEventListener('beforeload', webViewBeforeChange);

	} else {
		logger.debug("\n\n\n\n  loading - - - - - -- - \n\n\n");

	}
	hideLoader();
}

function webViewBeforeChange(e) {
	logger.debug("I came here  webViewBeforeChange\n\n\n");
	$.webView.removeEventListener('beforeload', webViewBeforeChange);

	$.webView.addEventListener('load', webViewDidChange);

}

function webViewDidChange(e) {

	var URL = e.source.evalJS('document.documentElement.baseURI;');
	logger.debug($.webView.evalJS("document.documentElement.innerText"));

	// old URL transactionID = $.webView.evalJS("document.getElementById('lblTransactinID').childNodes[0].nodeValue");

	var vars = {};
	URL.replace(URL.hash, '').replace(/[?&]+([^=&]+)=?([^&]*)?/gi, function(m, key, value) {
		vars[key] = value !== undefined ? value : '';
	});

	transactionID = vars['TransactionID'] ? vars['TransactionID'] : null;

	logger.debug("transactionID				", transactionID, "\n\n\n");
	if (transactionID != null && transactionID != "") {
		$.webView.removeEventListener('load', webViewDidChange);

		createTransactionAccount();
	} else {
		$.uihelper.showDialogWithButton({
			message : $.strings.msgAddCardError,
			deactivateDefaultBtn : true,
			btnOptions : [{
				title : $.strings.dialogBtnOK
			}]
		});
	}
}

function createTransactionAccount() {
	$.http.request({
		method : "transaction_create_account",
		params : {
			data : [{
				token : {
					transaction_token : transactionID
				}
			}]
		},
		keepLoader : true,
		errorDialogEnabled : true,
		success : didCreateTransAcc,
		failure : didFailTransAcc
	});
}

function didFailTransAcc(error, passthrough) {
	$.app.navigator.hideLoader();

	logger.debug("failure", error.code);
}

function didCreateTransAcc(result, passthrough) {
	$.app.navigator.hideLoader();
	logger.debug("\n\n\n result 		", JSON.stringify(result, null, 4), "\n\n\n");
	if (result.data.TokenDetails.length) {
		addNewCard(result);
	} else {
		getCardDetails();
	}
}

function addNewCard(result) {
	var billingAddress = currentPatient.get("billingAddress");

	var newCardDetails = result.data.TokenDetails[0];

	var lastFourDigits = /[0-9]{4}$/g.exec(newCardDetails.maskedCreditCardNumber);
	logger.debug("\n\n\nlastFourDigits		", lastFourDigits);

	var paymentAccountID = newCardDetails.paymentAccountID;

	$.http.request({
		method : "patient_creditcard_add",
		params : {
			data : [{
				addCreditCard : {
					sequenceNumber : "1",
					cardType : newCardDetails.cardType != null ? newCardDetails.cardType : "0",
					expirationDate : newCardDetails.expirationMonth + "/" + newCardDetails.expirationYear,
					name : billingAddress.name,
					address : billingAddress.address,
					zipCode : billingAddress.zip,
					lastFourDigits : lastFourDigits[0],
					token : paymentAccountID,
					paymentProcessorType : "0"
				}
			}]
		},
		keepLoader : true,
		errorDialogEnabled : true,
		success : didSuccessAddCard,
		failure : didFailAddCard
	});
}

function didFailAddCard(error, passthrough) {
	$.app.navigator.hideLoader();
	logger.debug("failure", error.code);
	$.app.navigator.close();
}

function didSuccessAddCard(result, passthrough) {
	$.app.navigator.hideLoader();
	logger.debug("\n\n\nsuccess result", result, "\n\n\n");
	getCardDetails();
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
		failure : didGetCardDetails
	});
}

function didGetCardDetails(result, passthrough) {
	if (result.data) {
		logger.debug("\n\n\n res data		", JSON.stringify(result.data, null, 4), "\n\n\n");

		$.utilities.setProperty(Alloy.CFG.show_updated_card_info, "1");
		cardsOnFile = result.data.CreditCard;

		_.each(cardsOnFile, function(card, index) {
			_.extend(card, {
				selected : card.priorityOrder == "1" ? true : false
			});
		});

		var xyz = {
			cardDetails : cardsOnFile
		};
		currentPatient.set(xyz);

		updateCardsInfo();

		logger.debug("\n\n\n cardsOnFile		", JSON.stringify(cardsOnFile, null, 4), "\n\n\n");
	} else {
		$.app.navigator.hideLoader();
	}

	didClickDone();
}

function updateCardsInfo() {

	cardTypes = $.uihelper.createTableViewSection($, "", sectionHeaders["cardTypes"], false);
	sections.cardTypes = [];
	data.shift();

	_.each(cardsOnFile, function(card, index) {
		var tClasses = ["left", "h5"],
		    sClasses = ["margin-top-small", "left", "h7", "inactive-fg-color"];
		var cardDetails = {
			section : "cardTypes",
			itemTemplate : "masterDetailWithLIcon",
			masterWidth : 100,
			detailWidth : 0,
			title : card.paymentType.paymentTypeDesc + " " + Alloy.Globals.strings.checkoutCCEndingIn + " " + card.lastFourDigits,
			titleClasses : tClasses,
			selected : card.selected
		};

		var rowParams = cardDetails,
		    row;

		rowParams.filterText = _.values(_.pick(rowParams, ["title", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
		row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);

		sectionHeaders[rowParams.section] += rowParams.filterText;
		sections[rowParams.section].push(row);
		cardTypes.add(row.getView());

	});

	data.unshift(cardTypes);
	$.tableView.setData(data);
	addCardCycleSuccess();
	$.app.navigator.hideLoader();
}

function addCardCycleSuccess() {
	sections.billingInfo = [];
	data.pop();
	$.tableView.setData(data);
	$.footerView.height = footerHeight;
	$.footerView.show();

	$.uihelper.showDialogWithButton({
		message : "Card added successfully",
		deactivateDefaultBtn : true,
		btnOptions : [{
			title : $.strings.dialogBtnOK
		}]
	});
}

function getToken() {
	$.http.request({
		method : "transaction_setupid_get",
		params : {
			data : [{}]
		},
		keepLoader : true,
		errorDialogEnabled : true,
		success : didGetTranSetupID,
		failure : didFailTranSetupID
	});
}

function didFailTranSetupID(error, passthrough) {
	$.app.navigator.hideLoader();
	logger.debug("failure", error.code);
	$.uihelper.showDialogWithButton({
		message : $.strings.msgUnknownError,
		deactivateDefaultBtn : true,
		btnOptions : [{
			title : $.strings.dialogBtnOK,
			onClick : popToCheckout
		}]
	});
}

function didGetTranSetupID(result, passthrough) {
	$.app.navigator.hideLoader();

	logger.debug("\n\n\n get token response			", JSON.stringify(result), "\n\n\n");
	logger.debug("\n\n\n get token response			", result.data.TokenDetails[0], "\n\n\n");

	if (result.data.TokenDetails.length) {
		transactionToken = result.data.TokenDetails[0].transactionSetupId;
		if (transactionToken != null && transactionToken != "") {
			var transactionURL = Alloy.Models.appload.get("ventivwebhost_webview") + transactionToken;
			applyWebViewProperties(transactionURL);
		}
	} else {

		$.uihelper.showDialogWithButton({
			message : $.strings.msgUnknownError,
			deactivateDefaultBtn : true,
			btnOptions : [{
				title : $.strings.dialogBtnOK,
				onClick : popToCheckout
			}]
		});
	}
}

function popToCheckout(e) {
	$.app.navigator.close();
}

function didPostlayout(e) {
	$.bottomView.removeEventListener("postlayout", didPostlayout);
	var top = $.bottomView.rect.height,
	    margin = $.tableView.bottom,
	    bottom;
	bottom = margin;

	bottom = bottom + $.submitBtn.height;

	//			bottom = $.checkoutTipView.getVisible() ? $.checkoutTipView.height + bottom + $.submitBtn.height + $.submitBtn.bottom : bottom + $.submitBtn.height;
	$.tableView.applyProperties({
		bottom : bottom
	});
}

function applyWebViewPropertiesOLD(url) {
	showLoader();

	$.webView.applyProperties({
		url : url
	});

	$.webView.willHandleTouches = false;
	$.webView.handlePlatformUrl = false;
	$.webView.addEventListener('load', function(e) {
		Ti.API.info("onload resp " + JSON.stringify(e));

		var actualHeight = 0;
		if (OS_ANDROID) {
			actualHeight = e.source.evalJS('document.documentElement.scrollHeight;') - e.source.evalJS('document.documentElement.clientHeight;');
		} else {
			actualHeight = e.source.evalJS('document.documentElement.scrollHeight;');
		}

		e.source.height = parseInt(actualHeight) - 200;
		hideLoader();
		$.webView.stopLoading();

		var innerHTML = "\r\n\r\n<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\r\n<html xmlns=\"http://www.w3.org/1999/xhtml\">\r\n<head><title>\r\n\tVantiv Hosted Payments - Process Transaction\r\n</title><link href=\"Main_2.css\" rel=\"stylesheet\" type=\"text/css\" />\r\n    <base target=\"_self\" />\r\n    <style id=\"cssCustom\" type=\"text/css\"></style></head>\r\n<body id=\"body\">\r\n    <form name=\"formHP\" method=\"post\" action=\"./?TransactionSetupMethod=CreditCardAuthorizaton\" id=\"formHP\" autocomplete=\"off\">\r\n<input type=\"hidden\" name=\"__VIEWSTATE\" id=\"__VIEWSTATE\" value=\"ZCb2EuNjlIwlPWHDpe0CboM9a7NItvOoqJq91ZH3fT7gVj98vfWz8lCjs34zRUZCLU4pQNS+4/k5Q7PO4urR04a0qBktYrzoMNZ3rm7rM+7nHwv+5IZSyOWIm/RXA5pQ0Kv8FT14/QoxKkLjaJ5pLKcRrKq+Ruf7KcW/DZcV1pqTUbeGIY2RWt7OBUzvLURuIBXKlMVMrCqaPOvAzXBuLDdvzqYuxcVk9gS4pGQCHqBx6rnz6blie1CUXfBJ4vUe7DcJqQijdNGJJ8Y4HzCmqed1aBt8593CD8/IjSd357XucDKN\" />\r\n\r\n\r\n<script src=\"js/wz_tooltip.js\" type=\"text/javascript\"></script>\r\n<script src=\"js/tip_centerwindow.js\" type=\"text/javascript\"></script>\r\n<script src=\"js/tip_balloon.js\" type=\"text/javascript\"></script>\r\n<script src=\"/ScriptResource.axd?d=MgrO-0rlZtaEPT9qefE6LDTbOjjnBgicROxllpn884RS0xAWVkF5ZhxjKjoOECbpyR_nXeVzBfUXrex7WvV4wIrAjv2Io1qtnaDP4NXMGlo23uRXz06r69USkhUpGLFSIHlfUp2ezNZZnGAwoQrG_Tq3aMM1&amp;t=ffffffff87bbe9c7\" type=\"text/javascript\"></script>\r\n<input type=\"hidden\" name=\"__VIEWSTATEGENERATOR\" id=\"__VIEWSTATEGENERATOR\" value=\"CA0B0334\" />\r\n<input type=\"hidden\" name=\"__VIEWSTATEENCRYPTED\" id=\"__VIEWSTATEENCRYPTED\" value=\"\" />\r\n<input type=\"hidden\" name=\"__EVENTVALIDATION\" id=\"__EVENTVALIDATION\" value=\"jDLyvduJiaBKBcDIlOz9K2SQDkf+0YvzPZ4/hjE/mzSQzjkvXyIAoqKwJhpivfqgnUxayvbPUmGLDk5KyOzRF9B9JYUiTVS10nRpUpnPrRIVLOfpyH9zmA337xYdKQZBmLJ8bw==\" />\r\n        \r\n        \r\n        \r\n        <script src=\"js/default_aspx_20.js?version=4\" type=\"text/javascript\"></script>\r\n        <script language=\"javascript\" type=\"text/javascript\"></script>\r\n\r\n        <div id=\"divMainProgress\" style=\"display: none;\">\r\n            <a id=\"TopOfPage\"></a>\r\n            <div id=\"divProgress\" class=\"progressDiv\">\r\n                <div>\r\n                    <img alt=\"\" id=\"progImage\" src=\"images/Progress.GIF\" class=\"progressImage\" />\r\n                </div>\r\n                <div id=\"divProgressMessage\" class=\"progressMessage\">\r\n                    Please wait while your<br />\r\n                    transaction is processed.\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div id=\"divManualErrorRedirect\" class=\"manualErrorRedirect\" style=\"display: none\">\r\n            <div id=\"divManualErrorRedirectStatus\" class=\"manualErrorRedirectStatus\">\r\n                redirecting...\r\n            </div>\r\n            <br />\r\n            <div id=\"divManualErrorRedirectMessage\" class=\"manualErrorRedirectMessage\">\r\n                If you are not redirected in <b>15</b> seconds <b><a href=\"#\" id=\"link_ManualError\">click here</a></b> to continue.\r\n            </div>\r\n        </div>\r\n        <div id=\"upFormHP\">\r\n\t\r\n                <input type=\"hidden\" name=\"hdnCancelled\" id=\"hdnCancelled\" />\r\n                <div id=\"divHPForm\" class=\"divMainForm\">\r\n                    \r\n                    <span id=\"message\"></span>\r\n                    <div id=\"pnlResting\" class=\"restingDiv\">\r\n\t\t\r\n                        <img id=\"imgResting\" src=\"images/Progress.gif\" class=\"restingImage\" />\r\n                        <br />\r\n                        <span style=\"font-size: 18px;\" class=\"bold\">Hosted Payments</span>\r\n                    \r\n\t</div>\r\n                    \r\n                </div>\r\n                <a href=\"#\" id=\"link_Redirect\" style=\"display: none;\"></a>\r\n            \r\n</div>\r\n    </form>\r\n</body>\r\n</html>\r\n";

		var x = innerHTML.getElementsByTagName('a');
		logger.debug("\n\n\n x			", x, "\n\n\n");
		/*
		 $.webView.applyProperties({
		 url : url
		 });*/

		/*
		 if (e.url.indexOf("ccpassback") > -1) {
		 Ti.API.info("got passed values: " + e.url.substring(e.url.indexOf("ccpassback") + 14, e.url.length));
		 $.webView.stopLoading();
		 }*/

	});

}

function HTMLParser(aHTMLString) {
	var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null),
	    body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
	html.documentElement.appendChild(body);

	body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"].getService(Components.interfaces.nsIScriptableUnescapeHTML).parseFragment(aHTMLString, false, null, body));

	return body;
}

function showLoader() {
	$.loader.show();
}

function hideLoader() {
	$.loader.hide(false);
}

function didClickDone() {
	$.cardInfoView.hide();
	$.submitBtn.title = $.strings.paymentDetBtnSubmit;
}

function terminate() {

}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
