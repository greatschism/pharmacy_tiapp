var args = arguments[0] || {},
    app = require("core");

$.webView.applyProperties({
	bottom : Alloy._p_top + Alloy._btn_height + Alloy._m_bottom
});

function didClickDone(e) {
	app.navigator.close();
}