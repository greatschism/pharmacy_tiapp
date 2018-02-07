var args = $.args,
    logger = require("logger"),

    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    checkout_result,
    currentPatient,
    exp_counter_key,
    prescriptions,
    indexOfCheckoutCompletePresc;

function init() {
	if (Alloy.Globals.isLoggedIn) {
		getCheckoutInfo();
	}
	currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	exp_counter_key = getExpressCheckoutCounter();
}

function getExpressCheckoutCounter() {
	var patient_id = currentPatient.get("parent_id") || currentPatient.get("child_id");
	return ("expressCounterFor_" + patient_id);
}

function didFail(result, passthrough) {
	/**
	 * if something goes odd with api
	 * just close this screen to
	 * prevent any further actions
	 */
	$.app.navigator.hideLoader();
	$.app.navigator.close();
}

function getCheckoutInfo() {
	$.http.request({
		method : "prescriptions_express_checkout_info",
		params : {
			data : []
		},
		errorDialogEnabled : false,
		success : didGetCheckoutDetails,
		failure : checkoutDetailsFail
	});
}

function checkoutDetailsFail(error, passthrough) {
	var err = error.message;
	if (err.indexOf("click here.") !== -1) {
		var dialogView = $.UI.create("ScrollView", {
			apiName : "ScrollView",
			classes : ["top", "auto-height", "vgroup"]
		});
		dialogView.add($.UI.create("Label", {
			apiName : "Label",
			classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3"],
			text : "Express Pick-up"
		}));

		$.lbl = Alloy.createWidget("ti.styledlabel", "widget", $.createStyle({
			classes : ["margin-top", "margin-bottom", "margin-left-extra-large", "margin-right", "h6", "txt-centre", "attributed"],
			html : $.strings.expressCheckoutNoCConFile,
		}));
		$.lbl.on("click", openExpressPickupBenefits);

		dialogView.add($.lbl.getView());
		_.each([{
			title : Alloy.Globals.strings.dialogBtnOK,
			classes : ["margin-left-extra-large", "margin-right-extra-large", "margin-bottom", "bg-color", "primary-fg-color", "primary-border"]
		}], function(obj, index) {
			var btn = $.UI.create("Button", {
				apiName : "Button",
				classes : obj.classes,
				title : obj.title,
				index : index
			});
			$.addListener(btn, "click", popToHome);
			dialogView.add(btn);
		});
		$.loyaltyDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
			classes : ["modal-dialog"],
			children : [dialogView]
		}));
		$.contentView.add($.loyaltyDialog.getView());
		$.loyaltyDialog.show();

	} else if (err.indexOf("Express Pick-up is not available because you do not have any prescriptions ready for pick up.") !== -1) {
		uihelper.showDialog({
			message : err,
			buttonNames : [Alloy.Globals.strings.dialogBtnOK],
			success : pushToPrescriptionList
		});
	} else {
		uihelper.showDialog({
			message : err,
			buttonNames : [Alloy.Globals.strings.dialogBtnOK],
			success : popToHome
		});
	}
}

function openExpressPickupBenefits() {
	$.app.navigator.open({
		titleid : "titleExpressPickupBenefits",
		ctrl : "expressPickupBenefits",
		stack : false
	}); 
}

function didGetCheckoutDetails(result) {
	checkout_result = result;

	var indexOfMultipleStoreCheckoutComplete = [];
	_.each(result.data.stores, function(store, index1) {
		prescriptionsTemp = store.prescription;
		_.each(prescriptionsTemp, function(prescription, index2) {
			if (prescription.is_checkout_complete == 1) {
				if (! _.has(indexOfMultipleStoreCheckoutComplete, index1)) {
					indexOfMultipleStoreCheckoutComplete.push(index1);
				}
				return true;
			}
			return false;
		});
	});
	if (indexOfMultipleStoreCheckoutComplete.length > 1) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.expressCheckoutMultipleStoreMsg,
			buttonNames : [Alloy.Globals.strings.dialogBtnClose],
			success : popToHome
		});
	} else if (indexOfMultipleStoreCheckoutComplete.length <= 1) {
		var isCheckoutComplete = false;
		_.each(result.data.stores, function(store, index1) {
			prescriptions = store.prescription;
			_.some(prescriptions, function(prescription, index2) {
				if (prescription.is_checkout_complete == 1) {
					isCheckoutComplete = true;
					indexOfCheckoutCompletePresc = [index1, index2];
					return true;
				}
				return false;
			});
		});

		if (isCheckoutComplete) {
			if (authenticator.isExpressCheckoutValid(exp_counter_key)) {
				moveToExpressQR(currentPatient, checkout_result, indexOfCheckoutCompletePresc);
			} else {
				$.parentView.visible = true;
			}
		} else {
			pushToPrescriptionList();
		}
	}
}

function popToHome() {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function pushToPrescriptionList() {
	$.app.navigator.open({
		titleid : "titlePrescriptions",
		ctrl : "prescriptions",
		ctrlArguments : {
			filters : {
				refill_status : [apiCodes.refill_status_in_process, apiCodes.refill_status_sold],
				section : ["others", "medSync"],
				is_checkout_complete : ["1", null]
			},
			patientSwitcherDisabled : true,
			hideCheckoutHeader : false,
			navigationFrom : "expressCheckout"
		},
		stack : true
	}); 

}

function didClickGenerateCode(e) {
	var dob = $.dob.getValue();

	if (!dob) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValDob
		});
		return;
	}

	var patientDob = moment(currentPatient.get("birth_date")).format(Alloy.CFG.apiCodes.dob_format);
	var inputDob = moment(dob).format(Alloy.CFG.apiCodes.dob_format);
	var dobMatch = OS_IOS ? moment(dob).diff(patientDob, "days") == 0 : moment(inputDob).diff(patientDob, "days") == 0;
	if (dobMatch) {
		var timeNow = moment();
		utilities.setProperty(exp_counter_key, timeNow, "object", false);
		moveToExpressQR(currentPatient, checkout_result, indexOfCheckoutCompletePresc);
	} else {
		uihelper.showDialog({
			message : Alloy.Globals.strings.expressCheckoutDobMismatchMsg
		});
		return;
	}
}

function moveToExpressQR(patient, checkoutInfo, indexOfPresc) {
	var first_name = patient.get("first_name");
	var last_name = patient.get("last_name");
	var rx_nnumber = checkoutInfo.data.stores[indexOfPresc[0]].prescription[indexOfPresc[1]].rx_number;
	var checkout_qr = last_name + "%09" + first_name + "%09%09%09%09%09%09%09%09%09%09%09%09%09%09%09" + rx_nnumber;
	app.navigator.open({
		ctrl : "expressQR",
		titleid : "titleExpressQR",
		ctrlArguments : {
			checkout : checkout_qr
		},
		stack : true
	});
}

function backButtonHandler() {
	popToHome();
}

function setParentView(view) {
	$.dob.setParentView(view);
}

exports.init = init;
exports.setParentView = setParentView;
exports.backButtonHandler = backButtonHandler;
