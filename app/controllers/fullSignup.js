var args = arguments[0] || {};

function didToggle(e) {
	$.passwordTxt.setPasswordMask(e.value);
}