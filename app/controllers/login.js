var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    encryptionUtil,
    keychainAccount;

function init() {
	if (OS_IOS || OS_ANDROID) {
		encryptionUtil = require("encryptionUtil");
		keychainAccount = require("com.obscure.keychain").createKeychainItem("account");
		if (keychainAccount.account) {
			$.unameTxt.setValue(keychainAccount.account);
			$.passwordTxt.setValue(encryptionUtil.decrypt(keychainAccount.valueData));
			$.keepMeSwt.setValue(true);
		}
	}
	uihelper.getImage($.logoImg);
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	nextItem ? $[nextItem] && $[nextItem].focus() : didClickLogin();
}

function didClickLogin(e) {
	var uname = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue();
	if (!uname) {
		dialog.show({
			message : Alloy.Globals.strings.valUsernameRequired
		});
		return;
	}
	if (!password) {
		dialog.show({
			message : Alloy.Globals.strings.valPasswordRequired
		});
		return;
	}
	if (OS_IOS || OS_ANDROID) {
		if ($.keepMeSwt.getValue() == true) {
			keychainAccount.account = uname;
			keychainAccount.valueData = encryptionUtil.encrypt(password);
		} else {
			keychainAccount.reset();
		}
	}
	if (/^[0-9]{10}$/.test(uname)) {
		http.request({
			method : "PATIENTS_MOBILE_EXISTS_OR_SHARED",
			data : {
				data : [{
					patient : {
						mobile_number : uname
					}
				}]
			},
			passthrough : {
				mobileNumber : uname,
				password : password
			},
			success : didSuccess,
			failure : didFail,
			keepBlock : true
		});
	} else {
		http.request({
			method : "PATIENTS_AUTHENTICATE",
			data : {
				data : [{
					patient : {
						user_name : uname,
						password : password
					}
				}]
			},
			success : didAuthenticate
		});
	}
}

function didAuthenticate(_result) {
	Alloy.Models.user.set({
		logged_in : true,
		patients : _result.data.patients
	});
	Alloy.Collections.menuItems.add({
		titleid : "strSignout",
		action : "signout",
		icon : "remove"
	});
	app.navigator.open(args.navigation || Alloy.Collections.menuItems.where({
	landing_page: true
	})[0].toJSON());
}

function didSuccess(_result, _passthrough) {
	var isExists = parseInt(_result.data.patients.mobile_exists),
	    isShared = parseInt(_result.data.patients.is_mobile_shared);
	if (isExists) {
		if (isShared) {
			app.navigator.hideLoader();
			app.navigator.open({
				ctrl : "sharedMobileCheck",
				stack : true,
				ctrlArguments : {
					orgin : $.__controllerPath,
					passthrough : _passthrough
				}
			});
		} else {
			app.navigator.hideLoader();
			http.request({
				method : "PATIENTS_AUTHENTICATE", // mscripts-authenticate
				data : {
					data : [{
						patient : {
							user_name : uname,
							password : password
						}
					}]
				},
				success : didMscriptsAuthenticate
			});
		}
	} else {
		app.navigator.hideLoader();
		// error message
	}
}

function didMscriptsAuthenticate(_result){
	//go to new screen
}

function didFail(_passthrough) {
	app.navigator.hideLoader();
}

function handleScroll(e) {
	$.login.canCancelEvents = e.value;
}

function didClickPwd(e) {
	app.navigator.open({
		ctrl : "loginRecovery",
		titleid : "titleLoginRecovery",
		stack : true
	});
}

function didClickSignup(e) {
	app.navigator.open({
		ctrl : "mobileNumber",
		titleid : "strWelcome",
		stack : true
	});
}

exports.init = init;
