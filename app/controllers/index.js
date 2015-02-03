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
		success : didSuccess,
		blockUICallback : showLoader,
		unblockUICallback : hideLoader
	});
}

function showLoader(_callback, _animated) {
	$.loading.show(_callback, _animated || false);
}

function hideLoader(_callback, _animated) {
	$.loading.hide(_callback, _animated || false);
}

function didSuccess(result) {
	Alloy.Models.user.set(result.data || {}, {
		silent : true
	});
	var clientConfig = result.data.client_json;
	if (_.has(clientConfig, "async_update")) {
		asyncUpdate = clientConfig.async_update;
	}
	if (config.init(clientConfig) > 0) {
		if (clientConfig.force_update === true) {
			startUpdate();
		} else {
			hideLoader(confirmUpdate, true);
		}
	} else {
		loadConfig();
	}
}

function loadConfig() {
	config.load(didLoadConfig);
}

function didLoadConfig() {
	$.index.remove($.loading.getView());
	Alloy.createController(Alloy._navigator + "/master", {
		navigation : Ti.App.Properties.getBool(Alloy.CFG.FIRST_LAUNCH, true) ? {
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
		config.update(loadConfig);
	}
}

$.index.open();
