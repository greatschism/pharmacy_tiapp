var args = arguments[0] || {};

function didRightclickPwd(e) {
	var passwordMask = $.passwordTxt.getPasswordMask();
	$.passwordTxt.setPasswordMask(!passwordMask);
	$.passwordTxt.setRightImage(("/images/login/" + ( passwordMask ? "check" : "question") + "_mark.png"));
}
