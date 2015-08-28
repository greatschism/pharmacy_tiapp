var args = arguments[0] || {};
function init(){
	$.uihelper.getImage("text_benefits",$.addSuccessImg);
	$.addMsg.text = String.format(Alloy.Globals.strings.familyMemberAddSuccessMsg, args.familyRelationship, args.familyRelationship);
	$.addLbl.text=String.format($.utilities.ucword(Alloy.Globals.strings.familyMemberAddSuccessLbl), args.familyRelationship);
}
function didAddAnotherMember(){
	$.app.navigator.open({
			titleid : "titleAddFamily",
			ctrl : "familyMemberAdd",
			stack : true
		});
}
function didClickDone(){
	$.app.navigator.open({
			titleid : "titleFamilyCare",
			ctrl : "familyCare",
			stack : true
		});
}
exports.init=init;
