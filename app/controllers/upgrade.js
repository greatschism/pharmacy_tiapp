var args = arguments[0] || {};

function didOpen(e) {
	$.trigger("init");
}

function didClickSubmit(e) {
	Ti.Platform.openURL(Alloy.Models.appload.get("upgrade_url"));
}

function didAndroidback(e) {
	$.window.close();
}

function init() {
	$.lbl.text = Alloy.Models.appload.get("upgrade_message");
	$.window.open();
}

exports.init = init;
