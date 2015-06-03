var app = require("core"),
    config = require("config"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    strings = Alloy.Globals.strings,
    triggerAsyncUpdate = false;

function didOpen(e) {
	http.request({
		method : "APPLOAD_GET",
		params : {
			data : [{
				appload : {
					phone_model : Ti.Platform.model,
					phone_os : Ti.Platform.osname,
					phone_platform : app.device.platform,
					device_id : "x",
					carrier :  Ti.Platform.carrier,
					app_version : Ti.App.version,
					client_name : Alloy.CFG.CLIENT_NAME
				}
			}]
		},
		success : didSuccess,
		showLoaderCallback : $.loading.show,
		hideLoaderCallback : $.loading.hide
	});
}

function didSuccess(result) {
	var appload = result.data.appload || {};
	Alloy.Models.user.set({
		appload : appload
	}, {
		silent : true
	});
	var clientConfig = appload.client_json || {};
	if (_.has(clientConfig, "force_update")) {
		Alloy.CFG.FORCE_UPDATE = clientConfig.force_update;
	}
	if (_.has(clientConfig, "async_update")) {
		Alloy.CFG.ASYNC_UPDATE = clientConfig.async_update;
	}
	if (_.has(clientConfig, "force_reload_after_update")) {
		Alloy.CFG.FORCE_RELOAD_AFTER_UPDATE = clientConfig.force_reload_after_update;
	}
	if (config.init(clientConfig).length) {
		if (Alloy.CFG.FORCE_UPDATE) {
			startUpdate();
		} else {
			$.loading.hide();
			confirmUpdate();
		}
	} else {
		loadConfig();
	}
}

function confirmUpdate() {
	uihelper.showDialog({
		title : strings.titleUpdates,
		message : strings.msgAppUpdateFound,
		buttonNames : [strings.btnYes, strings.btnNo],
		cancelIndex : 1,
		success : startUpdate,
		cancel : loadConfig
	});
}

function startUpdate() {
	if (Alloy.CFG.ASYNC_UPDATE) {
		triggerAsyncUpdate = true;
		loadConfig();
	} else {
		$.loading.show();
		syncUpdate();
	}
}

function syncUpdate() {
	config.updateResources(loadConfig);
}

function loadConfig() {
	config.load(didLoadConfig);
}

function didLoadConfig() {
	var ctrl = Alloy.createController(Alloy.CFG.NAVIGATOR + "/master", {
		navigation : utilities.getProperty(Alloy.CFG.FIRST_LAUNCH, true, "bool", false) ? {
			ctrl : "carousel",
			titleid : "strWelcome",
			navBarHidden : true,
			gestureEnabled : false
		} : false,
		triggerUpdate : triggerAsyncUpdate
	});
	ctrl.on("open", didOpenMastWindow);
	ctrl.init();
}

function didOpenMastWindow(e) {
	$.window.close();
}

function didAndroidback(e) {
	$.window.setExitOnClose(true);
	$.window.close();
}

$.window.open();
