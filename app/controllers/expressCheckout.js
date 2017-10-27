var args = $.args,

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
		errorDialogEnabled : true,
		success : didGetCheckoutDetails,
		failure : checkoutDetailsFail
	});
}

function checkoutDetailsFail() {
	popToHome();
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
			uihelper.showDialog({
				message : Alloy.Globals.strings.expressCheckoutDependencyMsg,
				buttonNames : [Alloy.Globals.strings.dialogBtnOK],
				success : pushToReadyPrescriptions
			});
		}
	}
}

function popToHome() {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function pushToReadyPrescriptions() {
	$.app.navigator.open({
		titleid : "titleReadyPrescriptions",
		ctrl : "prescriptions",
		ctrlArguments : {
			filters : {
				refill_status : [apiCodes.refill_status_in_process, apiCodes.refill_status_sold],
				section : ["others"],
				is_checkout_complete : ["1", null]
			},
			prescriptions : null,
			patientSwitcherDisabled : true,
			useCache : true,
			selectable : true,
			hideCheckoutHeader : true
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
