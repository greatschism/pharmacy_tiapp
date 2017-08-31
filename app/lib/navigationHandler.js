var TAG = "NAHA",
    Alloy = require("alloy"),
	authenticator = require("authenticator"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    utilities = require("utilities"),
    uihelper = require("uihelper");

if (OS_IOS) {
 	var TiTouchId = require("com.mscripts.mscriptstouchid");
}


function navigate(itemObj) {
	if (_.has(itemObj, "ctrl")) {
		loginOrNavigate(itemObj);
	} else if (_.has(itemObj, "url")) {
		var url = itemObj.url;
		if (OS_IOS && _.has(itemObj, "alternate_url") && Ti.Platform.canOpenURL(url) === false) {
			url = itemObj.alternate_url;
		}
		Ti.Platform.openURL(url);
	} else if (_.has(itemObj, "action")) {
		switch(itemObj.action) {
		case "refill":
			if (Alloy.CFG.is_quick_refill_enabled && Alloy.CFG.is_refill_by_scan_enabled) {
				app.navigator.open({
					titleid : "titleRefill",
					ctrl : "refill"
				});
			} else if (Alloy.CFG.is_quick_refill_enabled) {
				app.navigator.open({
					titleid : "titleRefillType",
					ctrl : "refillType"
				});
			} else if (Alloy.CFG.is_refill_by_scan_enabled) {
				/**
				 * open barcode scanner directly
				 * when phone number is disabled
				 */
				if (Alloy.CFG.refill_scan_phone_enabled) {
					app.navigator.open({
						titleid : "titleRefill",
						ctrl : "refillPhone"
					});
				} else {
					require("refillScan").init(app.navigator.currentController);
				}
			} else {
				uihelper.showDialog({
					message : Alloy.Globals.strings.msgFeatureNotAvailable,
					buttonNames : [Alloy.Globals.strings.dialogBtnOK]
				});
			}
			break;
		case "logout":
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgLogoutConfirm,
				buttonNames : [Alloy.Globals.strings.dialogBtnYes, Alloy.Globals.strings.dialogBtnNo],
				cancelIndex : 1,
				success : logout
			});
			break;
		}
	}
}

function touchIDAuth(resp, itemObj)  {
 	Ti.API.info("in touchIDAuth "+ JSON.stringify(resp));
 	//Ti.API.info("args = "+ JSON.stringify(args));
 	Ti.API.info("itemObj = "+ JSON.stringify(itemObj));
	var data = authenticator.getData();
	var username = data.username,
    password = data.password;
		
	if(resp.success == true) {


		authenticator.init({
			username : username,
			password : password,
			success : function() {

				
				if (itemObj.origin == "transferUserDetails") {
					transferUserDetails = true;
				} else {
					transferUserDetails = false;
				}
				/**
				 * Verify email address
				 * if user has not verified it within 24rs
				 * after registration taking him to email verification
				 * screen upon every login
				 */
				
				var mPatient = Alloy.Collections.patients.at(0);
				/**
				 * First time login flow takes the uesr to HIPAA screen
				 */
				if (utilities.getProperty(username, null, "string", true) == "showHIPAA") {
					app.navigator.open({
						ctrl : "hipaa",
						titleid : "titleHIPAAauthorization",
						stack : false
					});
				}
				
				/**
				 * Check if the partial account has been created.
				 * if so, take the user to log in screen.
				 */
				
				else if (itemObj.is_adult_partial && itemObj.username === mPatient.get("email_address")) {
					if (itemObj.parent === "registerChildInfo") {
						app.navigator.open({
							titleid : "titleChildAdd",
							ctrl : "childAdd",
							ctrlArguments : {
								username : itemObj.username,
								password : itemObj.password,
								isFamilyMemberFlow : false
							},
							stack : false
						});
					} else {
						app.navigator.open({
							titleid : "titleAddAnAdult",
							ctrl : "addAnotherAdult",
							stack : false
						});
					}
				} else if (mPatient.get("is_email_verified") !== "1" && moment.utc().diff(moment.utc(mPatient.get("created_at"), Alloy.CFG.apiCodes.ymd_date_time_format), "days", true) > 1) {
					app.navigator.open({
						ctrl : "emailVerify",
						ctrlArguments : {
							email : mPatient.get("email_address"),
							transferUserDetails : transferUserDetails,
							navigation : {
								titleid : "titleTransferStore",
								ctrl : "stores",
								ctrlArguments : {
									navigation : {
										titleid : "titleTransferOptions",
										ctrl : "transferOptions",
										ctrlArguments : {
											prescription : transferUserDetails ? args.navigation.ctrlArguments.navigation.ctrlArguments.prescription : {},
											store : {}
										},
										stack : true
									},
									selectable : true
								}
							}
						},
						stack : false
					});
				} else {
//						app.navigator.open(itemObj.navigation || Alloy.Collections.menuItems.findWhere({
//							landing_page : true
//						}).toJSON());
				}
			}
		});

 		alert("ti auth conditional fallbac:  itmObj "+JSON.stringify(itemObj));
			setTimeout( function(){
				app.navigator.open({
				titleid : itemObj.titleid,
				ctrl : itemObj.ctrl,
				icon : itemObj.icon
			});
			},0);


	} else {
			alert("Wah wah.  I can't go for that, no can do.... : "+JSON.stringify(resp) );
	}
}


function loginOrNavigate(itemObj) {
	//Ti.API.info("loginOrNavigate" + JSON.stringify(itemObj) );
	//Ti.API.info("Alloy.Globals.isLoggedIn" + Alloy.Globals.isLoggedIn );
	var ctrlPath = app.navigator.currentController.ctrlPath;
	//Ti.API.info("******************    ctrlPath  _>  " + ctrlPath );
	//Ti.API.info("******************    itemObj  ->   " + JSON.stringify(itemObj) );
	if (itemObj.ctrl != ctrlPath) {
		if (itemObj.requires_login_auth) {
			itemObj.ctrlArguments = {  
				requires_login_auth : true
		  };
			app.navigator.open(itemObj);
			return;
		}
		if (itemObj.requires_login && !Alloy.Globals.isLoggedIn) {
			if (ctrlPath != "login") {

				if( authenticator.getTouchIDEnabled() ) {
					app.navigator.showLoader();
					//navigation.isLoading = true;
				
				 	var result = TiTouchId.deviceCanAuthenticate();
				 
				 	var passcodeAuthProcess = function () {

				 		TiTouchId.authenticate({
							reason : "Touch ID authentication failed.",
							reason :  "Please use Touch ID to log in.",
				 			callback : function(tIDResp) {

				 				if( ! tIDResp.error) {
				 					Ti.API.info("no error in TID.  resp = " + JSON.stringify(tIDResp));
					 				setTimeout( function(){

											app.navigator.open({
												titleid : "titleLogin",
												ctrl : "login",
												ctrlArguments : {
													navigation : itemObj,
													useTouchID : true
												}
											});
											return;

					 						touchIDAuth(tIDResp, itemObj);
					 					},0);
					 				
				 				

				 				} else {

				 					Ti.API.info("YES ERROR in TID.  resp = " + JSON.stringify(tIDResp));
				 					//app.navigator.hideLoader();
			 						
									setTimeout( function(){

										app.navigator.open({
											titleid : "titleLogin",
											ctrl : "login",
											ctrlArguments : {
												navigation : itemObj,
												useTouchID : false
											}
										});
										app.navigator.hideLoader();
				 					},0);
				 				}

							}
				 				
				 		});
				 	};

				 
				 	if (!result) { //(!result.canAuthenticate) {
				 	//	alert('Touch ID Message: ' + result.error + '\nCode: ' + result.code);
				 	///  Add some kind of 'please turn off touchid error message here....'
				 	} else {
				 		//alert("about to touchID auth "+JSON.stringify(itemObj));
				 		passcodeAuthProcess();
				 	}
				 	
				 	return;

				}  else {

					app.navigator.open({
						titleid : "titleLogin",
						ctrl : "login",
						ctrlArguments : {
							navigation : itemObj
						}
					});
				}


			} else {

			//Don't try to navigate if we're on the login page already
			//	app.navigator.open(itemObj);
			}
		} else {
			app.navigator.open(itemObj);
		}
	}
}

function logout() {
	authenticator.logout({
		dialogEnabled : true
	});
}

exports.navigate = navigate;
