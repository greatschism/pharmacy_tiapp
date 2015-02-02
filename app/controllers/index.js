var config = require("config"),
    http = require("requestwrapper"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    strings = Alloy.Globals.strings,
    asyncUpdate = true;

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
		message : strings.msgFailedToRetrieve,
		buttonNames : [strings.btnRetry, strings.strCancel],
		cancelIndex : 1,
		success : didOpen
	});
}

function didSuccess(result) {
	Alloy.Models.user.set(result.data, {
		silent : true
	});
	if (_.has(result, "async_update")) {
		asyncUpdate = result.async_update;
	}
	if (config.init(result.data.appload.client_json) > 0) {
		if (result.force_update === true) {
			startUpdate();
		} else {
			$.loading.hide(confirmUpdate);
		}
	} else {
		loadConfig();
	}
}

function loadConfig() {
	//config.load();
	config.load(didLoadConfig);
}

function didLoadConfig() {
	$.index.remove($.loading.getView());
	Alloy.createController(Alloy._navigator + "/master", {
		navigation : Ti.App.Properties.getBool("firstLoad", true) ? {
			ctrl : "carousel",
			titleid : "strWelcome",
			navBarHidden : true
		} : false
	});
}

function confirmUpdate() {
	dialog.show({
		title : strings.titleUpdates,
		message : strings.msgAppUpdateFound,
		buttonNames : [strings.btnYes, strings.btnNo],
		cancelIndex : 1,
		success : startUpdate,
		cancel : loadConfig
	});
}

function startUpdate() {
	if (asyncUpdate === true) {
		loadConfig();
	} else {

	}
}

$.index.open();
