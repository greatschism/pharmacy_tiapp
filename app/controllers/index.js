var http = require("requestwrapper"),
    dialog = require("dialog");

function didOpen(e) {
	http.request({
		method : "appload",
		data : {
			request : {
				appload : {
					phonemodel : Ti.Platform.model,
					phoneos : Ti.Platform.osname,
					deviceid : Ti.Platform.id,
					networkcarrier : "",
					phoneplatform : "IP",
					appversion : Ti.App.version,
					clientname : Alloy.CFG.clientname,
					featurecode : "TH610"
				}
			}
		},
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
	require("config").init();
	Alloy.Models.user.set({
		appLoad : result.appload
	}, {
		silent : true
	});
	$.index.remove($.loading.getView());
	if (Ti.App.Properties.getBool("firstLoad", true)) {
		Alloy.createController("stack/master", {
			ctrl : "carousel",
			titleid : "strWelcome"
		});
	} else {
		Alloy.createController(Alloy._navigator + "/master");
	}
}

$.index.open();
