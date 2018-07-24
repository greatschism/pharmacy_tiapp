var args = $.args,
    moment = require("alloy/moment"),
    logger = require("logger"),
    authenticator = require("authenticator"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    validator = args.validator,
    titleClasses = ["left", "h4", "wrap-disabled"],
    subtitleClasses = ["margin-top-small", "left", "inactive-fg-color", "wrap-disabled"],
    detailClasses = ["margin-left-small", "custom-fg-color"],
    isWindowOpen,
    orderDetailsData = args.orderDetailsData;

function init() {
	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		logger.debug("\n\n\n args.orderDetailsData		", JSON.stringify(args.orderDetailsData, null, 4),"\n\n\n");
	}
}

function togglePrescription(e) {
}

exports.init = init;
exports.focus = focus;