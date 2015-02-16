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
		/*if (keychainAccount.account) {
		 $.unameTxt.setValue(keychainAccount.account);
		 $.passwordTxt.setValue(encryptionUtil.decrypt(keychainAccount.valueData));
		 $.keepMeSwt.setValue(true);
		 }*/
	}
	uihelper.getImage($.logoImg);
}

function didRightclickPwd(e) {
	app.navigator.open({
		ctrl : "loginRecovery",
		titleid : "titleLoginRecovery",
		stack : true
	});
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	nextItem ? $[nextItem] && $[nextItem].focus() : didClickLogin();
}

function didClickLogin(e) {

	var uname = $.unameTxt.getValue();
	var password = $.passwordTxt.getValue();

	if (uname != "" && password != "") {

		if (OS_IOS || OS_ANDROID) {
			if ($.keepMeSwt.getValue() == true) {
				keychainAccount.account = uname;
				keychainAccount.valueData = encryptionUtil.encrypt(password);
			} else {
				keychainAccount.reset();
			}
		}

		http.request({
			method : "authenticate",
			data : {
				request : {
					authenticate : {
						username : uname,
						password : password,
						clientname : Alloy.CFG.clientname,
						emailpin : Alloy.CFG.emailpin,
						featurecode : "TH053",
						language : ""
					}
				}
			},
			success : didAuthenticate
		});

	} else {
		dialog.show({
			message : Alloy.Globals.strings.valLoginRequiredFileds
		});
	}
}

function didAuthenticate(result) {
	Alloy.Models.user.set({
		loggedIn : true,
		sessionId : result.authenticate.sessionid
	});
	Alloy.Collections.menuItems.add({
		titleid : "strSignout",
		action : "signout",
		icon : "remove",
		leftImage : "/images/logout_white.png"
	});
	app.navigator.open(args.navigation || Alloy.Collections.menuItems.where({
	landing_page: true
	})[0].toJSON());
}

function handleScroll(e) {
	$.login.canCancelEvents = e.value;
}

function didClickSignup(e) {
	app.navigator.open({

		ctrl : "mobileNumber",
		titleid : "titleWelcome",
		stack : false
		/*ctrl : "termsAndConditions",
		 titleid : "titleTermsAndConditions",
		 stack : true*/
	});
}

exports.init = init;
