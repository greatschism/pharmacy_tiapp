var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("requestwrapper"),
    utilities = require("utilities");

function init() {
	$.userLbl.text = String.format(Alloy.Globals.strings.strHi, args.name || "");
}

function didClickDone(e) {
	var password = $.passwordTxt.getValue();
	if (!password) {
		dialog.show({
			message : Alloy.Globals.strings.valPasswordRequired
		});
		return;
	}
	if (!utilities.validatePassword(password)) {
		dialog.show({
			message : Alloy.Globals.strings.msgPasswordTips
		});
		return;
	}
	http.request({
		method : "PATIENTS_NEW_PASSWORD",
		data : {
			data : [{
				patient : {
					user_name : "",
					email_address : "",
					password : password
				}
			}]
		},
		success : didAuthenticate
	});
}

function didAuthenticate(_result) {
	dialog.show({
		title : Alloy.Globals.strings.titleSuccess,
		message : _result.message,
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(!e.value);
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

exports.init = init;

