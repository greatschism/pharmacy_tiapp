var http = require("httpwrapper"),
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
					networkcarrier : "", //OS_IOS ? require("bencoding.network").createCarrier().findInfo().carrierName : OS_ANDROID ? require("ti.network").findInfo().carrierName : Ti.Platform.osname,
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
	$.index.remove($.loading.getView());
	Alloy.Models.user.set({
		appLoad : result.appload
	}, {
		silent : true
	});
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
