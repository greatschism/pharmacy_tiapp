var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("httpwrapper");

if (OS_IOS || OS_ANDROID) {
	var encryptionUtil = require("encryptionUtil"),
	    keychainAccount = require("com.obscure.keychain").createKeychainItem("account");
	if (keychainAccount.account) {
		$.unameTxt.setValue(keychainAccount.account);
		$.passwordTxt.setValue(encryptionUtil.decrypt(keychainAccount.valueData));
		$.keepMeSwt.setValue(true);
	}
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
		leftImage : "/images/logout_white.png"
	});
	if (app.navigator.name === Alloy._navigator) {
		app.navigator.open(args.navigateTo || Alloy.Collections.menuItems.where({
		landingPage: true
		})[0].toJSON());
	} else {
		Alloy.createController(Alloy._navigator + "/master");
	}
}

function handleScroll(e) {
	$.login.canCancelEvents = e.value;
}

function didClickSignup(e) {
	app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : true
	});
}
