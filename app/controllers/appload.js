var app = require("core"),
    notificationHandler = require("notificationHandler"),
    config = require("config"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    localization = require("localization"),
    strings = Alloy.Globals.strings,
    triggerAsyncUpdate = false;

function didOpen(e) {
	config.load();
	notificationHandler.init(deviceReady);
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
					client_name : Alloy.CFG.client_name,
					client_param_lang_code : localization.currentLanguage.code
				}
			}]
		},
		success : didSuccess,
		showLoaderCallback : showLoader,
		hideLoaderCallback : hideLoader
	});
}

function showLoader() {
	if (!$.loader) {
		$.loader = Alloy.createWidget("ti.loading", "widget", {
			message : Alloy.Globals.strings.msgPleaseWait,
			visible : false
		});
	}
	$.loader.show();
}

function hideLoader() {
	if ($.loader) {
		$.loader.hide();
		$.loader = null;
	}
}

function didSuccess(result) {
	var appload = result.data.appload || {};
	Alloy.Models.user.set({
		appload : appload
	}, {
		silent : true
	});
	var clientConfig = appload.client_json || {};
	_.each(["force_update", "force_reload_after_update", "async_update", "delete_unused_resources", "override_remote_resources"], function(key) {
		if (_.has(clientConfig, key)) {
			Alloy.CFG[key] = clientConfig[key];
		}
	});
	if (config.init(clientConfig).length) {
		if (Alloy.CFG.force_update) {
			startUpdate();
		} else {
			confirmUpdate();
		}
	} else {
		initMasterWindow();
	}
}

function confirmUpdate() {
	uihelper.showDialog({
		title : strings.titleUpdates,
		message : strings.msgAppUpdateFound,
		buttonNames : [strings.btnYes, strings.btnNo],
		cancelIndex : 1,
		success : startUpdate,
		cancel : initMasterWindow
	});
}

function startUpdate() {
	if (Alloy.CFG.async_update) {
		triggerAsyncUpdate = true;
		initMasterWindow();
	} else {
		syncUpdate();
	}
}

function syncUpdate() {
	showLoader();
	config.updateResources(loadConfig);
}

function loadConfig(errorQueue) {
	if (_.isArray(errorQueue) && errorQueue.length) {
		hideLoader();
		uihelper.showDialog({
			title : strings.titleUpdates,
			message : strings.msgErrorWhileUpdate,
			buttonNames : [strings.btnContinue],
			success : initMasterWindow
		});
	} else {
		config.load(initMasterWindow);
	}
}

function initMasterWindow() {
	hideLoader();
	var ctrl = Alloy.createController(Alloy.CFG.navigator + "/master", {
		navigation : utilities.getProperty(Alloy.CFG.first_launch, true, "bool", false) ? {
			ctrl : "carousel",
			titleid : "strWelcome",
			navBarHidden : true
		} : false,
		triggerUpdate : triggerAsyncUpdate
	});
	ctrl.on("init", didInitMasterWindow);
	ctrl.init();
}

function didInitMasterWindow(e) {
	$.window.setExitOnClose(false);
	$.window.close();
}

function didAndroidback(e) {
	$.window.close();
}

$.window.open();
