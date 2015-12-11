var args = arguments[0] || {};

function didOpen(e) {
	$.trigger("init");
}

function didClickSubmit(e) {
	var url = Alloy.Models.appload.get("upgrade_url");
	if (url) {
		Ti.Platform.openURL(url);
	}
}

function didAndroidback(e) {
	$.window.close();
}

function init() {
	$.lbl.text = Alloy.Models.appload.get("upgrade_message");
	$.window.open();
}

exports.init = init;
