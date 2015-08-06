function focus(){
	$.uihelper.getImage("logo",$.logoImg);
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
}

function didClickContinue(){
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    password=$.passwordTxt.getValue(),
	    email=$.emailTxt.getValue(),
	    dob = $.dobDp.getValue();
	 
	if (!fname) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValFirstName
		});
		return;
	}
	if (!$.utilities.validateName(fname)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValFirstNameInvalid
		});
		return;
	}
	if (!lname) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValLastName
		});
		return;
	}
	if (!$.utilities.validateName(lname)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValLastNameInvalid
		});
		return;
	}
	if (!dob) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValDob
		});
		return;
	}
	if (!password) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValPasssword
		});
		return;
	}
	if (!email) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValEmail
		});
		return;
	}
	if (!$.utilities.validateEmail(email)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValEmailInvalid
		});
		return;
	}
}
function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}
function setParentView(view) {
	$.dobDp.setParentView(view);
}
exports.setParentView=setParentView;
exports.focus=focus;