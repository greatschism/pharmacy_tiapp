var args = arguments[0] || {},
    app = require("core"),
    config = require("config"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    localization = require("localization"),
    notificationHandler = require("notificationHandler"),
    strings = Alloy.Globals.strings,
    triggerAsyncUpdate = false;

function didOpen(e) {
	$.loader.applyProperties({
		indicatorDict : {
			accessibilityLabel : strings.msgLoading
		}
	});
	/**
	 * reload config data
	 * when reload is true
	 * Note: reload will be true
	 * when master window was closed
	 * and appload was opened as part
	 * of update operation
	 */
	if (args.reload) {
		config.load();
	}
	/**
	 * appload
	 *
	 * device_id
	 * 	ios - a unique identifier (UUID) for this installation
	 * 	android - IMEI number of device
	 */
	http.request({
		method : "appload_get",
		params : {
			feature_code : "THXXX",
			data : [{
				appload : {
					phone_model : Ti.Platform.model,
					phone_os : Ti.Platform.osname,
					phone_platform : Alloy.CFG.platform_code,
					device_id : notificationHandler.deviceId,
					carrier : Ti.Platform.carrier,
					app_version : Alloy.CFG.apiCodes.app_version,
					client_name : Alloy.CFG.client_name,
					client_param_lang_code : localization.currentLanguage.code
				}
			}]
		},
		forceRetry : true,
		success : didSuccess,
		showLoaderCallback : showLoader,
		hideLoaderCallback : hideLoader
	});
}

function showLoader() {
	$.loader.show();
}

function hideLoader() {
	$.loader.hide(false);
}

function didSuccess(result) {
	var appload = result.data.appload || {};
	Alloy.Models.appload.set(appload);
	/**
	 * check for force upgrade
	 */
	if (appload.is_upgrade_required === "1") {
		/**
		 * open upgrade window
		 * Note: don't use open listener
		 * directly, we have to make sure the
		 * new controller is all setup, ready for use
		 * and not just opened
		 */
		var ctrl = Alloy.createController("upgrade");
		ctrl.on("init", didInitWin);
		ctrl.init();
	} else {
		/**
		 * if no force upgrade required
		 * then continue
		 */
		var clientConfig = appload.client_json || {};
		_.each(["force_update", "force_reload_after_update", "async_update", "delete_unused_resources", "override_remote_resources"], function(key) {
			if (_.has(clientConfig, key)) {
				Alloy.CFG[key] = clientConfig[key];
			}
		});
		/**
		 * check whether client.json is
		 * updated (theme, language etc.,)
		 */
		if (config.init(clientConfig).length) {
			/**
			 * check whether it is a force update
			 */
			if (Alloy.CFG.force_update) {
				startUpdate();
			} else {
				confirmUpdate();
			}
		} else {
			/**
			 * if no update found then
			 * initiate app & navigator
			 */
			initMasterWindow();
		}
	}
}

function confirmUpdate() {
	uihelper.showDialog({
		title : strings.dialogTitleUpdates,
		message : strings.msgAppUpdateFound,
		buttonNames : [strings.dialogBtnYes, strings.dialogBtnNo],
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
			title : strings.dialogTitleUpdates,
			message : strings.msgAppUpdateFailed,
			buttonNames : [strings.dialogBtnContinue],
			success : initMasterWindow
		});
	} else {
		config.load(initMasterWindow);
	}
}

function initMasterWindow() {
	hideLoader();
	/**
	 * Note: don't use open listener
	 * directly, we have to make sure the
	 * new controller is all setup, ready for use
	 * and not just opened
	 */
	var ctrl = Alloy.createController(Alloy.CFG.navigator + "/master", {
		navigation : utilities.getProperty(Alloy.CFG.first_launch_app, true, "bool", false) ? {
			ctrl : "carousel",
			titleid : "strWelcome",
			navBarHidden : true
		} : false,
		triggerUpdate : triggerAsyncUpdate
	});
	ctrl.on("init", didInitWin);
	ctrl.init();
}

function didInitWin(e) {
	$.window.setExitOnClose(false);
	$.window.close();
}

function didAndroidback(e) {
	$.window.close();
}

$.window.open();
