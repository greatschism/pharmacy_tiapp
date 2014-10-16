var args = arguments[0] || {},
    App = require("core"),
    _dialog = require("dialog"),
    _http = require("http"),
    _xmlTools = require("XMLTools"),
    _keychainAccount,
    _stringCrypto;

if (OS_IOS || OS_ANDROID) {
	_stringCrypto = require("bencoding.securely").createStringCrypto();
	_keychainAccount = require("com.obscure.keychain").createKeychainItem("account");
	if (_keychainAccount.account) {
		$.unameTxt.setValue(_keychainAccount.account);
		$.passwordTxt.setValue(_stringCrypto.AESDecrypt(Alloy.CFG.secret, _keychainAccount.valueData));
		$.keepMeSwt.setValue(true);
	}
}

function didRightclickPwd(e) {
	App.Navigator.open({
		ctrl : "loginRecovery",
		titleid : "loginRecovery",
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

		App.Navigator.showLoader({
			message : Alloy.Globals.Strings.pleaseWait

		});

		if (OS_IOS || OS_ANDROID) {
			if ($.keepMeSwt.getValue() == true) {
				_keychainAccount.account = uname;
				_keychainAccount.valueData = _stringCrypto.AESEncrypt(Alloy.CFG.secret, password);
			} else {
				_keychainAccount.reset();
			}
		}

		var data = "<request><authenticate>";
		data += "<username>" + uname + "</username>";
		data += "<password>" + password + "</password>";
		data += "<clientname>" + Alloy.CFG.clientname + "</clientname>";
		data += "<emailpin>" + Alloy.CFG.emailpin + "</emailpin>";
		data += "<featurecode>" + Alloy.CFG.featurecode + "</featurecode>";
		data += "<language/></authenticate></request>";
		_http.request({
			url : "https://staging.remscripts.com/pdxonphonehandlerv6_3/authenticate",
			type : "POST",
			format : "xml",
			success : didSuccess,
			failure : didError,
			done : didFinish,
			data : data
		});

	} else {
		_dialog.show({
			message : Alloy.Globals.Strings.loginRequiredFileds
		});
	}
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function didSuccess(doc) {
	var errormessage = doc.getElementsByTagName("errormessage");
	if (errormessage.item(0) != null || errormessage.item(0) != undefined) {
		_dialog.show({
			message : errormessage.item(0).text
		});
		return;
	}
	var xmlTools = new _xmlTools(doc);
	var response = xmlTools.toObject();
	Ti.App.Properties.setString("sessionid", response.authenticate.sessionid);
	Alloy.createController(Alloy.CFG.navigator + "/master");
}

function didError(http, url) {
	_dialog.show({
		message : Alloy.Globals.Strings.failedToRetrive
	});
}

function didFinish() {
	App.Navigator.hideLoader();
}