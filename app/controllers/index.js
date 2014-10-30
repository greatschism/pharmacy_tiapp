var http = require("httpwrapper");

function didOpen(e) {
	http.request({
		method : "appload",
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
		success : didAppLoad
	});
}

function didFinish() {
	$.index.remove($.loading.getView());
}

function didAppLoad(result) {
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

$.index.open();
