var http = require("requestwrapper"),
    dialog = require("dialog"),
    utilities = require("utilities");

function didOpen(e) {
	http.request({
		path : "appload/get",
		format : "JSON",
		data : {},
		retry : false,
		prompt : false,
		success : didSuccess,
		failure : didFailed
	});
}

function didFailed() {
	dialog.show({
		message : Alloy.Globals.strings.msgFailedToRetrieve,
		buttonNames : [Alloy.Globals.strings.btnRetry, Alloy.Globals.strings.strCancel],
		cancelIndex : 1,
		success : didOpen
	});
}

function didSuccess(result) {
	Alloy.Models.user.set(result.data, {
		silent : true
	});
	require("config").init(result.data.appload.client_json, didLoadConfig);
}

function didLoadConfig() {
	$.index.remove($.loading.getView());
	//if (Ti.App.Properties.getBool("firstLoad", true)) {
		Alloy.createController("stack/master", {
			ctrl : "carousel",
			titleid : "strWelcome"
		});
	/*} else {
		Alloy.createController(Alloy._navigator + "/master");
	}*/
}

$.index.open();
