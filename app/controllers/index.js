var http = require("http"),
    dialog = require("dialog");

function didOpen(e) {
	http.request({
		url : Alloy.CFG.baseUrl.concat("appload"),
		type : "POST",
		format : "xml",
		data : {
			request : {
				appload : {
					phonemodel : Ti.Platform.model,
					phoneos : Ti.Platform.osname,
					deviceid : Ti.Platform.id,
					networkcarrier : OS_IOS ? require("bencoding.network").createCarrier().findInfo().carrierName : OS_ANDROID ? "" : "",
					phoneplatform : "IP",
					appversion : Ti.App.version,
					clientname : Alloy.CFG.clientname,
					featurecode : Alloy.CFG.featurecode
				}
			}
		},
		success : didAppLoad,
		failure : didError,
		done : didFinish
	});
}

function didError(http, url) {
	dialog.show({
		message : Alloy.Globals.Strings.msgFailedToRetrive
	});
}

function didFinish() {
	$.index.remove($.loading.getView());
}

function didAppLoad(result) {
	var error = result.appload.error;
	if (_.isObject(error)) {
		dialog.show({
			message : error.errormessage
		});
	} else {
		Alloy.Globals.appLoad = result.appload;
		if (_.has(Alloy.Globals.userInfo, "sessionId")) {
			Alloy.createController(Alloy.CFG.navigator + "/master");
		} else {
			var fistLoad = Ti.App.Properties.getBool("firstLoad", true),
			    params;
			if (fistLoad) {
				params = {
					ctrl : "carousel",
					titleImage : "/images/login/pharmacy.png"
				};
			} else {
				params = {
					ctrl : "login"
				};
			}
			Alloy.createController("stack/master", params);
		}
	}
}

$.index.open();
