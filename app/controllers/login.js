var args = arguments[0] || {}, App = require("core"), _dialog = require("dialog"), _http = require("http"), _xmlTools = require("XMLTools");

var keychain = require('com.obscure.keychain');

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

var userKeychainItem = keychain.createKeychainItem('username');
var passKeychainItem = keychain.createKeychainItem('password');

function didClickLogin(e) {
	var uname = $.unameTxt.getValue();
	uname = userKeychainItem.valueData;
	var password = $.passwordTxt.getValue();
	password = passKeychainItem.valueData;

	if (uname.value != '' && password.value != '') {
		App.Navigator.showLoader({
			message : Alloy.Globals.Strings.pleaseWait

		});

		if ($.keepMeSwt.getValue() == true) {

			// store credentials in the keychain
			userKeychainItem.valueData = uname;
			passKeychainItem.valueData = password;
			alert("credentials stored");
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

	}
	//else {
	//	_dialog.show({
	//		message : Alloy.Globals.Strings.loginRequiredFileds
	//	});
	//}
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;

	if ($.keepMeSwt.value == true) {

		// store credentials in the keychain
		userKeychainItem.valueData = uname.value;
		passKeychainItem.valueData = password.value;
		alert("credentials stored");
	}
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