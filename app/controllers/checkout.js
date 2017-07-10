var args = $.args,
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    prescriptions = args.prescriptions,
    postlayoutCount = 0,
    newMedReminder,
    isWindowOpen,
    httpClient,
    logger = require("logger");


	var data = [];
	

function init() {


	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];

}

function setAccessibilityLabelOnSwitch(switchObj , strValue) {
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


	$.tableView.setData(data);

	$.loader.hide();
}


function didUpdateUI() {

}

function didPostlayoutPrompt(e) {

}


function didClickNext(e) {

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
