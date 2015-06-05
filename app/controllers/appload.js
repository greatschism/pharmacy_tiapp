var app = require("core"),
    notificationHandler = require("notificationHandler"),
    config = require("config"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    strings = Alloy.Globals.strings,
    triggerAsyncUpdate = false;

function didOpen(e) {
	//notificationHandler.init(deviceReady);
	deviceReady("x");
}

function deviceReady(deviceToken) {
	http.request({
		method : "appload_get",
		params : {
			data : [{
				appload : {
					phone_model : Ti.Platform.model,
					phone_os : Ti.Platform.osname,
					phone_platform : app.device.platform,
					device_id : deviceToken,
					carrier : Ti.Platform.carrier,
					app_version : Ti.App.version,
					client_name : Alloy.CFG.client_name
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
	_.each(["force_update", "force_reload_after_update", "async_update"], function(key) {
		if (_.has(clientConfig, key)) {
			Alloy.CFG[key] = clientConfig[key];
		}
	});
	if (config.init(clientConfig).length) {
		if (Alloy.CFG.force_update) {
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
	if (Alloy.CFG.async_update) {
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
	var ctrl = Alloy.createController(Alloy.CFG.navigator + "/master", {
		navigation : utilities.getProperty(Alloy.CFG.first_launch, true, "bool", false) ? {
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
