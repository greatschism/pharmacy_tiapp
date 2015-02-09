var config = require("config"),
    http = require("requestwrapper"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    strings = Alloy.Globals.strings,
    triggerAsyncUpdate = false;

function didOpen(e) {
	http.request({
		method : "APPLOAD_GET",
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
	var clientConfig = result.data.appload.client_json;
	if (_.has(clientConfig, "force_update")) {
		Alloy.CFG.forceUpdate = clientConfig.force_update;
	}
	if (_.has(clientConfig, "async_update")) {
		Alloy.CFG.asyncUpdate = clientConfig.async_update;
	}
	if (_.has(clientConfig, "force_reload_after_update")) {
		Alloy.CFG.forceReloadAfterUpdate = clientConfig.force_reload_after_update;
	}
	if (config.init(clientConfig).length) {
		if (Alloy.CFG.forceUpdate) {
			startUpdate();
		} else {
			hideLoader(confirmUpdate, true);
		}
	} else {
		loadConfig();
	}
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
	if (Alloy.CFG.asyncUpdate) {
		triggerAsyncUpdate = true;
		loadConfig();
	} else {
		showLoader(syncUpdate);
	}
}

function syncUpdate() {
	config.updateResources(loadConfig);
}

function loadConfig() {
	config.load(didLoadConfig);
}

function didLoadConfig() {
	$.index.remove($.loading.getView());
	Alloy.createController(Alloy._navigator + "/master", {
		navigation : utilities.getProperty(Alloy.CFG.FIRST_LAUNCH, true, "bool", false) ? {
			ctrl : "carousel",
			titleid : "strWelcome",
			navBarHidden : true
		} : false,
		triggerUpdate : triggerAsyncUpdate
	});
}

$.index.open();
