var args = $.args,
    TAG = "MAST",
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    navigationHandler = require("navigationHandler"),
    notificationPanel = require("notificationPanel"),
    authenticator = require("authenticator"),
    logger = require("logger"),
    keyboardModule = require("com.mscripts.hidekeyboard"),

    openedViaUrl = false,
    needsUrlRedirect = false,

    reload = false;



function confirmUrlRedirect(url, resumed) {

	var autofillToken = (url.split('token='))[1];
	if (typeof autofillToken === 'undefined') {
		//if an autofill token parameter was not received, then bail on the deeplink process
		Alloy.Globals.url = undefined;
		return false;
	}
	
	//autofillToken = autofillToken.split('&')[0];
	//autofillToken = autofillToken.split('/')[0];

	Alloy.Globals.url = url;	//globals url value is trimmed at this point

	if (resumed === true) {
		urlRedirectTo("titlePrescriptions", "prescriptions");
	} else {
		needsUrlRedirect = true;
		return true;
	}
}

function init() {
	if (OS_IOS) {
		/**
		 * On iOS, apps can stay longer in background
		 * so there are chances for user to lose updates
		 * from appload. To avoid that if app resumes
		 * from background after appload_timeout time,
		 * then reload it
		 */


		Ti.App.addEventListener("paused", didAppPaused);
		Ti.App.addEventListener("resumed", didAppResumed);

		if( Alloy.CFG.enable_autofill_deep_link === "enableAutofillDeepLink" ) {
			$.rootWindow.addEventListener('open', function (e) {

		    	logger.debug(" Ti.App.getArguments().url" + JSON.stringify( Ti.App.getArguments().url) );
					
				//Ti.App.getArguments().url used for URL scheme recovery as opposed to associated domains
				//This left in for potential future use
		     	if( typeof Ti.App.getArguments().url === 'string' ) {
		     		confirmUrlRedirect(Ti.App.getArguments().url, false);
		         }

		     	if( typeof Alloy.Globals.url === 'string' ) {
		     		confirmUrlRedirect(Alloy.Globals.url, false);
		         }

		        // Handle the URL in case it resumed the app
		        Ti.App.addEventListener('resumed', function () {
					if( typeof Alloy.Globals.url === 'string'  ) {
						confirmUrlRedirect(Alloy.Globals.url, true);
						openedViaUrl = true;
					}

					//Ti.App.getArguments().url used for URL scheme recovery as opposed to associated domains
					//This left in for potential future use
			     	if( typeof Ti.App.getArguments().url === 'string' ) {
		     			confirmUrlRedirect(Ti.App.getArguments().url, true);
		     		}
		        });
			});	
		} else {
	    	//if autofill feature isn't enabled, reset the url global
	    	Alloy.Globals.url = undefined;
	    }

		//drawer window events
		$.drawer.on("open", didOpen);
		$.drawer.on("close", didClose);
		$.drawer.on("windowDidOpen", windowDidOpen);
		$.drawer.on("windowDidClose", windowDidClose);
				
		globalLeftNavHandler = didClickLeftNavView;

	}
	if (OS_ANDROID) {
		$.rootWindow = $.drawer.getView();
		$.rootWindow.addEventListener("open", didOpen);
		$.rootWindow.addEventListener("close", didClose);
		$.rootWindow.addEventListener("androidback", didAndoridBack);
		//to hide keyboard when drawer slides
		$.drawer.on("draweropen", hideKeyboard);

	    

	    if( typeof Alloy.Globals.url === 'string'  && Alloy.CFG.enable_autofill_deep_link === "enableAutofillDeepLink" ) {
			confirmUrlRedirect(Alloy.Globals.url, false);
			openedViaUrl = true;
	    } else {
	    	//if autofill feature isn't enabled, reset the url global
	    	Alloy.Globals.url = undefined;
	    }
	}
	$.drawer.open();
}

function didAppPaused(e) {
	logger.debug(TAG, "app paused");
	Alloy.Globals.latestActive = moment().unix();
	//enable notification panel
	notificationPanel.active = false;
}

function didAppResumed(e) {
	logger.debug(TAG, "app resumed");
	if ((moment().unix() - Alloy.Globals.latestActive) > Alloy.CFG.appload_timeout) {
		logger.debug(TAG, "applog timeout");
		return doLogout();
	}
	

	//disable notification panel
	notificationPanel.active = true;
}

function didOpen(e) {
	if (OS_ANDROID) {
		var actionBar = $.rootWindow.activity.actionBar;
		if (actionBar) {
			actionBar.setDisplayHomeAsUp(true);
			actionBar.setOnHomeIconItemSelected(didClickLeftNavView);
		}
	}
	$.trigger("init");
	app.init({
		type : "drawer",
		drawer : $.drawer,
		navigationWindow : $.navigationWindow,
		rootWindow : $.rootWindow
	});
	/**
	 * failure callback will
	 * prevent authenticator from
	 * opening login screen
	 */
	authenticator.init({
		success : didAuthenticate,
		failure : didAuthenticate,
		force_start : true
	});
}

function didAuthenticate(passthrough, navigationHandled) {	
	//initialize menu controller
	$.menuCtrl.init();


	if (needsUrlRedirect) {
		needsUrlRedirect = false;
		urlRedirectTo("titlePrescriptions", "prescriptions");
	} else if (Alloy.Globals.isAccountUpgraded) {
		whenAccountUpgraded();
	} else  if (!navigationHandled && !needsUrlRedirect) {
		/**
		 * navigationHandled - whether or not to
		 * initiate a navigation.
		 */
		navigationHandler.navigate(args.navigation || Alloy.Collections.menuItems.findWhere({
			landing_page : true
		}).toJSON());
	}
	
	/**
	 * set active flag
	 * for notification panel
	 */
	notificationPanel.active = true;
	/**
	 * usually this is a async
	 * update, sync updates
	 * will be done on appload
	 * controller itself
	 */
	if (args.triggerUpdate === true) {
		logger.debug(TAG, "triggering async update");
		app.update(didCompleteUpdate);
	}
	if (passthrough && passthrough.callBack) {
		passthrough.callBack();
		passthrough = null;
	}

	var touchID = require("touchid");
	var localBiometricFlag = touchID.deviceCanAuthenticate();
	if(localBiometricFlag) {
		if(  Alloy.Globals.isLoggedIn &&  require("authenticator").getTouchIDEnabled() ) {
			touchID.authenticate( function(){
			//	alert("yay hooray (nore than 10 s)");
			}, function(){
				setTimeout( function(){ 
					var passthrough = {};
					passthrough.success = function(){
						//alert("Please login manually.");
						uihelper.showDialog({
							title : Alloy.Globals.strings.loginTouchTitle,
							message : Alloy.Globals.strings.loginTouchCancel,
							buttonNames : [Alloy.Globals.strings.dialogBtnOK],
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
		return;
	}

}

function urlRedirectTo(titleId, controller) {
		navigationHandler.navigate({
			titleid : titleId,
			ctrl : controller,
			requires_login : true,
			ctrlArguments : {
				navigationFrom : "url"
			}
		});
}

function whenAccountUpgraded() {
	if (Alloy.Globals.is_hipaa_url_enabled) {
		/**
		 * Account Upgraded flow takes the uesr to HIPAA screen
		 */
		app.navigator.open({
			ctrl : "hipaa",
			titleid : "titleHIPAAauthorization",
			stack : false
		});
	} else if (!needsUrlRedirect) {
		/**
		 * remove the entry from the properties so that HIPAA is not displayed to the user next time
		 */
		utilities.removeProperty(Alloy.Collections.patients.at(0).get("email_address"));

		if (Alloy.CFG.is_express_checkout_enabled) {
			$.app.navigator.open({
				titleid : "titleExpressPickupBenefits",
				ctrl : "expressPickupBenefits",
				stack : false
			});
		} else {
			currentPatient = Alloy.Collections.patients.findWhere({
				selected : true
			});

			if (currentPatient.get("mobile_number") && currentPatient.get("is_mobile_verified") === "1") {
				$.app.navigator.open({
					titleid : "titleHomePage",
					ctrl : "home",
					stack : false
				});
			} else {
				$.app.navigator.open({
					titleid : "titleTextBenefits",
					ctrl : "textBenefits",
					stack : false
				});
			};
		}
	}
}

function didCompleteUpdate() {
	logger.debug(TAG, "completed async update");
	reload = true;
	doLogout();
}

function doLogout() {
	/**
	 * logout before reloading the app
	 * Note: this is not a explicit logout
	 */
	authenticator.logout({
		explicit : false,
		success : didLogout
	});
}

function didLogout() {
	/**
	 * app level ios events
	 */
	if (OS_IOS) {
		Ti.App.removeEventListener("paused", didAppPaused);
		Ti.App.removeEventListener("resumed", didAppResumed);
	}
	/**
	 * make the heavy weight window
	 * ready for close not exit
	 * and initiate appload again
	 */
	if (OS_ANDROID) {
		$.rootWindow.setExitOnClose(false);
	}
	/**
	 * reset active flag
	 * for notification panel
	 */
	notificationPanel.active = false;
	/**
	 * reload flag reloads the updated
	 * Note: no need to listen for init
	 * and close this window, navigator
	 * will be destroyed whenever
	 * new one is created
	 */
	Alloy.createController("appload", {
		reload : reload
	}).init();
}

function windowDidOpen(e) {
	uihelper.toggleAccessibility($.rootWindow, true);
	uihelper.requestViewFocus($.menuCtrl.getView());
}

function windowDidClose(e) {
	var children = $.rootWindow.getChildren();
	uihelper.toggleAccessibility($.rootWindow, false);
	if (children[0]) {
		uihelper.requestViewFocus(children[0]);
	}
}

function didAndoridBack(e) {

	app.navigator.close(1, true);
}

function didClickLeftNavView(e) {		
	hideKeyboard();
	$.drawer.toggleLeftWindow();
}

function hideKeyboard(e) {
	if (Ti.App.keyboardVisible || keyboardModule.getKeyboardVisible()) {
		keyboardModule.hideKeyboard();
	}
}

function didClose(e) {
	//destroy menu view (data binding)

	$.menuCtrl.terminate();
}

exports.init = init;
