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

		Ti.API.info(" !!! confirmUrlRedirect !!! ")
	var navPage = (url.split('page='))[1];
		navPage = navPage.split('&')[0];
	Alloy.Globals.url = url
	if(navPage === "prescriptions") {
		if (resumed === true) {
			navigationHandler.navigate({
				titleid : "titlePrescriptions",
				ctrl : "prescriptions",
				requires_login : true
			}); 
		} else {
			needsUrlRedirect = true;
			return true;
		}
	} else if (navPage === "doctors") {
		if (resumed === true) {
			navigationHandler.navigate({
				titleid : "titleDoctors",
				ctrl : "doctors",
				requires_login : true
			}); 
		} else {
			needsUrlRedirect = true;
			return true;
		}
	} else if (navPage === "insurance") {
		if (resumed === true) {
			navigationHandler.navigate({
				titleid : "titleInsurance",
				ctrl : "insurance"
			});
		} else {
			needsUrlRedirect = true;
			return true;
		}
	} else {
		Alloy.Globals.url = undefined
		return false;
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

		$.rootWindow.addEventListener('open', function (e) {
		    

		    	Ti.API.info("opened")

		        // Handle the URL in case it opened the app
		    	//Ti.API.info( JSON.stringify( Ti.App.getArguments().url) )
		     	if( typeof Ti.App.getArguments().url === 'string' ) {
		     		confirmUrlRedirect(Ti.App.getArguments().url, false)
		         }

		        // Handle the URL in case it resumed the app
		        Ti.App.addEventListener('resumed', function () {
			    	//Ti.API.info("resumed")

			        // Handle the URL in case it opened the app
			     	if( typeof Ti.App.getArguments().url === 'string' ) {
		     			confirmUrlRedirect(Ti.App.getArguments().url, true)
		     		}
		        });
		});


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

        if( typeof Alloy.Globals.url === 'string' ) {
			confirmUrlRedirect(Alloy.Globals.url, false)
			openedViaUrl = true;
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

	if(OS_IOS) {
				// ctrlArguments : {
				//  	navigationFrom : "url"
				// },
		if (needsUrlRedirect) {
			needsUrlRedirect = false;
			if(typeof Alloy.Globals.url === 'string') {
				Ti.API.info("needsUrlRedirect Alloy.Globals.url == "+ Alloy.Globals.url )
				var navPage = (Alloy.Globals.url.split('page='))[1];
					navPage = navPage.split('&')[0];
				if(navPage === "prescriptions") {
					navigationHandler.navigate({
						titleid : "titlePrescriptions",
						ctrl : "prescriptions",
						requires_login : true
					}); 
				} else if (navPage === "doctors") {
					navigationHandler.navigate({
						titleid : "titleDoctors",
						ctrl : "doctors",
						requires_login : true
					}); 
				} else if (navPage === "insurance") {
					app.navigator.open({
						titleid : "titleInsurance",
						ctrl : "insurance"
					});
				}
			}
		}
	}
	if(OS_ANDROID) {
		if (openedViaUrl) {
			openedViaUrl = false;
			if(typeof Alloy.Globals.url === 'string') {
				Ti.API.info("openedViaUrl Alloy.Globals.url == "+ Alloy.Globals.url )
				var navPage = (Alloy.Globals.url.split('page='))[1];
					navPage = navPage.split('&')[0];
			 	if (navPage === "insurance") {
					app.navigator.open({
						titleid : "titleInsurance",
						ctrl : "insurance"
					});
				}
			}
		}

	}


}

function didAuthenticate(passthrough, navigationHandled) {	
	//initialize menu controller
	$.menuCtrl.init();
	/**
	 * Account Upgraded flow takes the uesr to HIPAA screen
	 */
	 
	if (OS_IOS) {
		if (Alloy.Globals.url) {
			var navPage = (Alloy.Globals.url.split('page='))[1];
			navPage = navPage.split('&')[0];
			if (navPage === "prescriptions") {
				app.navigator.open({
					titleid : "titlePrescriptions",
					ctrl : "prescriptions",
					ctrlArguments : {
						navigationFrom : "url"
					}
				});
			} else if (navPage === "settings") {
				app.navigator.open({
					titleid : "titleAccount",
					ctrl : "account",
					ctrlArguments : {
						navigationFrom : "url"
					}
				});
			}
			Alloy.Globals.url = null;
		} else if (Alloy.Globals.isAccountUpgraded) {
			app.navigator.open({
				ctrl : "hipaa",
				titleid : "titleHIPAAauthorization",
				stack : false
			});
		}
		/**
		 * navigationHandled - whether or not to
		 * initiate a navigation.
		 */
		else  if (!navigationHandled && !needsUrlRedirect) {
			navigationHandler.navigate(args.navigation || Alloy.Collections.menuItems.findWhere({
				landing_page : true
			}).toJSON());
		}
	} else {
		if (Alloy.Globals.isAccountUpgraded) {
			app.navigator.open({
				ctrl : "hipaa",
				titleid : "titleHIPAAauthorization",
				stack : false
			});
		}
		/**
		 * navigationHandled - whether or not to
		 * initiate a navigation.
		 */
		else  if (!navigationHandled && !needsUrlRedirect) {

			navigationHandler.navigate(args.navigation || Alloy.Collections.menuItems.findWhere({
				landing_page : true
			}).toJSON());
		}


			if (needsUrlRedirect) {
				needsUrlRedirect = false;
				if(typeof Alloy.Globals.url === 'string') {
					Ti.API.info("needsUrlRedirect Alloy.Globals.url == "+ Alloy.Globals.url )
					var navPage = (Alloy.Globals.url.split('page='))[1];
						navPage = navPage.split('&')[0];
					if(navPage === "prescriptions") {
						navigationHandler.navigate({
							titleid : "titlePrescriptions",
							ctrl : "prescriptions",
							requires_login : true
						}); 
					} else if (navPage === "doctors") {
						navigationHandler.navigate({
							titleid : "titleDoctors",
							ctrl : "doctors",
							requires_login : true
						}); 
					}
				}
			}
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
