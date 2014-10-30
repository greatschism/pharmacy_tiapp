var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("http"),
    keychainAccount,
    stringCrypto;

if (OS_IOS || OS_ANDROID) {
	stringCrypto = require("bencoding.securely").createStringCrypto();
	keychainAccount = require("com.obscure.keychain").createKeychainItem("account");
	if (keychainAccount.account) {
		$.unameTxt.setValue(keychainAccount.account);
		$.passwordTxt.setValue(stringCrypto.AESDecrypt(Alloy.CFG.secret, keychainAccount.valueData));
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
	var nextItem = e.nextItem || "";
	$[nextItem] && $[nextItem].focus();
}

function didClickLogin(e) {

	var uname = $.unameTxt.getValue();
	var password = $.passwordTxt.getValue();

	if (uname != "" && password != "") {

		app.navigator.showLoader({
			message : Alloy.Globals.Strings.msgPleaseWait

		});

		if (OS_IOS || OS_ANDROID) {
			if ($.keepMeSwt.getValue() == true) {
				keychainAccount.account = uname;
				keychainAccount.valueData = stringCrypto.AESEncrypt(Alloy.CFG.secret, password);
			} else {
				keychainAccount.reset();
			}
		}

		http.request({
			url : Alloy.CFG.baseUrl.concat("authenticate"),
			type : "POST",
			format : "xml",
			data : {
				request : {
					authenticate : {
						username : uname,
						password : password,
						clientname : Alloy.CFG.clientname,
						emailpin : Alloy.CFG.emailpin,
						featurecode : Alloy.CFG.featurecode,
						language : ""
					}
				}
			},
			success : didSuccess,
			failure : didError,
			done : didFinish
		});

	} else {
		dialog.show({
			message : Alloy.Globals.Strings.valLoginRequiredFileds
		});
	}
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function didSuccess(result) {
	var error = result.authenticate.error;
	if (_.isObject(error)) {
		dialog.show({
			message : error.errormessage
		});
	} else {
		Alloy.Globals.userInfo.sessionId = result.authenticate.sessionid;
		if (app.navigator.name === Alloy.CFG.navigator) {
			Alloy.Collections.menuItems.where({
			action: "signin"
			})[0].set({
				titleid : "strSignout",
				action : "signout"
			});
			app.navigator.close();
		} else {
			Alloy.createController(Alloy.CFG.navigator + "/master");
		}
	}
}

function didError(http, url) {
	dialog.show({
		message : Alloy.Globals.Strings.msgFailedToRetrive
	});
}

function didFinish() {
	app.navigator.hideLoader();
}

function didClickSignup(e) {
	app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : true
	});
}
