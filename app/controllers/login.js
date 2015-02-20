var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    uihelper = require("uihelper"),
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
