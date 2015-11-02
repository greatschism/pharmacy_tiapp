var args = arguments[0] || {},
    app = require("core"),
    config = require("config"),
    ctrlShortCode = require("ctrlShortCode"),
    httpClient = require("http"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    localization = require("localization"),
    notificationHandler = require("notificationHandler"),
    logger = require("logger"),
    TAG = ctrlShortCode[$.__controllerPath],
    strings = Alloy.Globals.strings,
    triggerAsyncUpdate = false;

function didOpen(e) {
	$.trigger("init");
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
	 * appconfig
	 */
	getAppConfig();
}

function showLoader() {
	$.loader.show();
}

function hideLoader() {
	$.loader.hide(false);
}

function getAppConfig() {
	//GAPC - stands for getappjconfig
	logger.debug(TAG, "request", "GAPC", "client name", Alloy.CFG.client_name, "app version", Alloy.CFG.app_version);
	httpClient.request({
		url : Alloy.CFG.appconfig_url,
		type : "POST",
		format : "JSON",
		params : JSON.stringify({
			data : {
				getappjconfig : {
					featurecode : Alloy.CFG.platform_code + "-GAPC-" + TAG,
					phoneplatform : Alloy.CFG.platform_code,
					clientname : Alloy.CFG.client_name,
					appversion : Alloy.CFG.app_version
				}
			}
		}),
		success : didGetAppConfig,
		failure : didFailAppConfig
	});
}

function didFailAppConfig(error, passthrough) {
	logger.debug(TAG, "failure", "GAPC", error.code);
	uihelper.showDialog({
		message : http.getNetworkErrorByCode(error.code),
		buttonNames : [Alloy.Globals.strings.dialogBtnRetry],
		success : getAppConfig
	});
}

function didGetAppConfig(result, passthrough) {
	var appconfig = result.getappjconfig;
	logger.debug(TAG, "success", "GAPC", "certrequired", appconfig.certrequired, "maintenance", appconfig.required);
	if (appconfig) {
		/**
		 * update model
		 */
		Alloy.Models.appconfig.set(appconfig);
		/**
		 * appconfig returns just the
		 * server url, update the full path
		 * here
		 */
		Alloy.Models.appconfig.set("ophurl", appconfig.ophurl.concat("/services/"));
		/**
		 * if required is 1
		 * then services are down or
		 * under maintenance
		 */
		if (appconfig.required) {
			/**
			 * navigate to maintenance screen
			 */
			var ctrl = Alloy.createController("maintenance");
			ctrl.on("init", didInitWin);
			ctrl.init();
		} else {
			/**
			 * if certrequired is 1
			 * then enable certificate pinning
			 */
			if (appconfig.certrequired) {
				/**
				 * later will be used
				 * by request wrapper
				 */
				Alloy.Globals.securityManager = require("appcelerator.https").createX509CertificatePinningSecurityManager([{
					url : appconfig.ophurl,
					serverCertificate : "https.cer"
				}]);
			}
			/**
			 * appload
			 *
			 * device_id
			 * 	ios - a unique identifier (UUID) for this installation
			 * 	android - IMEI number of device
			 *
			 * Note: request wrapper can append feature codes
			 * only when navigator is ready and no feature
			 * code is passed
			 */
			http.request({
				method : "appload_get",
				params : {
					feature_code : Alloy.CFG.platform_code + "-" + Alloy.CFG.apiShortCode.appload_get + "-" + ctrlShortCode[$.__controllerPath],
					data : [{
						appload : {
							phone_model : Ti.Platform.model,
							phone_os : Ti.Platform.osname,
							phone_platform : Alloy.CFG.platform_code,
							device_id : notificationHandler.deviceId,
							carrier : Ti.Platform.carrier,
							client_name : Alloy.CFG.client_name,
							client_param_lang_code : localization.currentLanguage.code,
							app_version : Alloy.CFG.app_version
						}
					}]
				},
				forceRetry : true,
				success : didSuccessAppload,
				showLoaderCallback : showLoader,
				hideLoaderCallback : hideLoader
			});
		}
	} else {
		/**
		 * considered as failure
		 */
		didFailAppConfig({});
	}
}

function didSuccessAppload(result) {
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
	if (OS_ANDROID) {
		$.window.setExitOnClose(false);
	}
	$.window.close();
}

function didAndroidback(e) {
	$.window.close();
}

function init() {
	//loader
	$.loader.applyProperties({
		indicatorDict : {
			accessibilityLabel : strings.msgLoading
		}
	});
	$.window.open();
}

exports.init = init;
