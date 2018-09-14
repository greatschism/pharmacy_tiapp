var args = $.args,
    app = require("core"),
        // fs = require("nofs"),
        // path = require("path"),

    config = require("config"),
    ctrlShortCode = require("ctrlShortCode"),
    httpClient = require("http"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    localization = require("localization"),
    feedbackHandler = require("feedbackHandler"),
    notificationHandler = require("notificationHandler"),
    logger = require("logger"),
    TAG = ctrlShortCode[$.__controllerPath],
    strings = Alloy.Globals.strings,
	encryptionUtil = require("encryptionUtil"),
	resources = require("resources"),
    touchID = require("touchid"),
    localBiometricFlag = false,


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
	logger.debug(TAG, "request", "GAPC", "client_name", Alloy.CFG.client_name, "app_version", Alloy.CFG.app_version);
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
	if (appconfig) {	
		logger.debug(TAG, "success", "GAPC", "\tcertrequired : ", appconfig.certrequired, "\tmaintenance : ", appconfig.required, "\turl : ", appconfig.maintenanceurl,"\tOPHURL : ", appconfig.ophurl);
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
		} else
		 {
			/**
			 * if certrequired is 1
			 * then enable certificate pinning
			 * if certrequired is 2
			 * download new cert if not done already
			 */
			if(appconfig.certrequired === 0)
			{
				callAppload();

			}
			else if (appconfig.certrequired === 1) {
				/**
				 * later will be used
				 * by request wrapper
				 */
				Alloy.Globals.securityManager = require("appcelerator.https").createX509CertificatePinningSecurityManager([{
					url : appconfig.ophurl,
					serverCertificate : "https.cer"
				}]);
				
				callAppload();
				
			}
			else if(appconfig.certrequired === 2)
			{
				var res = encryptionUtil.decrypt(appconfig.maintenanceurl) || "{}";

				logger.debug("\n\n decrypted URL = " + res);
							
				var		parts = res.split('&'),
						whole = parts[0],
						fractional = parts[1] || '';
						// var savedFile= Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.dataDirectory + "/" +fractional + ".cer");
						
						var savedFile= Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,fractional+".cer");

						logger.debug("\n\ncertpath\t =" , /*Ti.Filesystem.applicationDataDirectory,*/ savedFile.getNativePath());

						if(savedFile.exists())
						{
							logger.debug("\n\n cert found\n\n"); 	
							callAppload();
						
						}
						else
						{
							logger.debug("\n\n cert to be downloaded\n\n");

						var xhr = Titanium.Network.createHTTPClient({
							onload: function() {			
								// first, grab a "handle" to the file where you'll store the downloaded data
								var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,fractional+".cer");
								f.write(this.responseData); // write to the file
								logger.debug("\n\n completed download of cer @ ",f.nativePath); //nativepath wont giv anythn
								
								Alloy.Globals.securityManager = require("appcelerator.https").createX509CertificatePinningSecurityManager([{
									url : appconfig.ophurl,
									serverCertificate : f.nativePath
								}]);
	
								callAppload();
							},
						onerror: function(e) {
						        Ti.API.error(e.error);
 						},
 						timeout: 10000
						});
						xhr.open('GET',whole);
						xhr.send();
						}
			}
			
		}
		
	} 
	else
	{
		/**
		 * considered as failure
		 */
		didFailAppConfig({});
	}
}

function callAppload()
{
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
							carrier : Ti.Platform.carrier || null,
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

function didSuccessAppload(result) {
	var appload = result.data.appload || {};
	Alloy.Models.appload.set(appload);
	/**
	 * extend feature flags to CFG
	 * to keep it accessible through XML
	 */
	_.each(appload.features, function(val, key) {
		Alloy.CFG[key] = val === "1";
	});
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
		_.each(["force_update", "force_reload_after_update", "async_update", "delete_unused_resources"], function(key) {
			if (_.has(clientConfig, key)) {
				Alloy.CFG[key] = clientConfig[key];
			}
		});
		/**
		 * check whether client.json is
		 * updated (theme, language etc.,)
		 */
		logger.debug("\n\n\n clientConfig ", JSON.stringify(clientConfig), "\n\n\n");

		var configChanges = config.init(clientConfig);
		logger.debug("configChanges", JSON.stringify(configChanges), "\n");
		logger.debug("Is app first Launch",utilities.getProperty(Alloy.CFG.first_launch_app, true, "bool", false));
		if (configChanges.length) {
			/**
			 * check whether it is a force update
			 */
					logger.debug("\n\n\n Alloy.CFG.force_update ",Alloy.CFG.force_update, "\n\n\n");

			if (Alloy.CFG.force_update || utilities.getProperty(Alloy.CFG.first_launch_app, true, "bool", false)) {
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
		
	// Rx_max and rx_validator from Appload - Note able to change from theme.json
	Alloy.Globals.rx_max = Alloy.Models.appload.get("rx_max_length"); 
	Alloy.Globals.rx_validator = Alloy.Models.appload.get("rx_validator"); 
		// 	$.utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "transfer.jpg"), smallBlob, false);
		if(appload.sampl_rx_image != null && appload.sampl_rx_image != '' && typeof(appload.sampl_rx_image) !== 'undefined')
		{
		logger.debug("\n\n help image URL = " + appload.sampl_rx_image);
							
				var		parts = appload.sampl_rx_image.split('_'),
						whole = parts[0],
						fractional = parts[1] || '';
						// var savedFile= Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.dataDirectory + "/" +fractional + ".cer");
						
						var savedImage= Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,fractional);

						logger.debug("\n\nfilepath\t =" , /*Ti.Filesystem.applicationDataDirectory,*/ savedImage.getNativePath());

						if(savedImage.exists())
						{
							logger.debug("\n\n help image file exists \n\n"); 	
						
						}
						else
						{
							logger.debug("\n\n file to be downloaded\n\n");

						var xhr = Titanium.Network.createHTTPClient({
							onload: function() {
								
								utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fractional), this.responseData, false);
			
								// first, grab a "handle" to the file where you'll store the downloaded data
								/*
								var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,fractional);
								f.write(this.responseData); // write to the file
								*/
								Ti.App.fireEvent('file_downloaded', {filepath:(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fractional)).nativePath});
							},
						onerror: function(e) {
						        Ti.API.error(e.error);
 						},
 						timeout: 10000
						});
						xhr.open('GET',appload.sampl_rx_image);
						xhr.send();
						Ti.App.addEventListener('file_downloaded', function(e) {
							// you don't have to fire an event like this, but perhaps multiple components will
							// want to know when the file has been downloaded and saved
							
							logger.debug("\n\n completed download of cer @ ",e.filepath); //nativepath wont giv anythn

						});


						}
		}

		else 
			logger.debug("\n\n\n appload sampl_rx_image doesn't exist or has no value\n\n\n");
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
						logger.debug("\n\n\n Am in start update by force\n\n\n");

	if (Alloy.CFG.async_update && !utilities.getProperty(Alloy.CFG.first_launch_app, true, "bool", false) ) {
								logger.debug("\n\n\n Am in start update async\n\n\n");

		triggerAsyncUpdate = true;
		initMasterWindow();
	} else {
										logger.debug("\n\n\n Am in start update synchronous\n\n\n");

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
var bgCounter;

function appDidResume() {
	var bgComparer = new Date();

	if( ( bgComparer - bgCounter > 10000 ) && Alloy.Globals.isLoggedIn &&  require("authenticator").getTouchIDEnabled() ) {

		touchID.authenticate( function(){
		//	alert("yay hooray (nore than 10 s)");
		}, function(){
			setTimeout( function(){ 
				var passthrough = {};
				passthrough.success = function(){
					//alert("Please login manually.");
					uihelper.showDialog({
						title : strings.loginTouchTitle,
						message : strings.loginTouchCancel,
						buttonNames : [strings.dialogBtnOK],
						success : function(){
							app.navigator.open({
								titleid : "titleLogin",
								ctrl : "login",
							});
						}
					});
					
				};
				require("authenticator").logout(passthrough); 
				
			},500);
		});
	}
}

function appDidPause() {
	bgCounter = new Date();
}


function initMasterWindow() {
	hideLoader();
	//update feedback counter
	feedbackHandler.updateCounter(Alloy.CFG.apiCodes.feedback_action_appload);
	/**
	 * Note: don't use open listener
	 * directly, we have to make sure the
	 * new controller is all setup, ready for use
	 * and not just opened
	 */
	
	Alloy.Globals.isMailOrderService = false;
	var ctrl = Alloy.createController(Alloy.CFG.navigator + "/master", {
		navigation : utilities.getProperty(Alloy.CFG.first_launch_app, true, "bool", false) ? {
			ctrl : "carousel",
			navBarHidden : true
		} : false,
		triggerUpdate : triggerAsyncUpdate
	});
	ctrl.on("init", didInitWin);

	localBiometricFlag = touchID.deviceCanAuthenticate();
	if(localBiometricFlag) {
   		Ti.App.addEventListener("paused", appDidPause);
  		Ti.App.addEventListener("resume", appDidResume);
	}


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
