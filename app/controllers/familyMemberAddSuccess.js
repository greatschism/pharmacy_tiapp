var args = $.args;
function init(){
	$.uihelper.getImage("text_benefits",$.addSuccessImg);
	$.addMsg.text = String.format(Alloy.Globals.strings.familyMemberAddSuccessMsg, args.familyRelationship, args.familyRelationship);
	$.addLbl.text=String.format(Alloy.Globals.strings.familyMemberAddSuccessLbl,$.utilities.ucword(args.familyRelationship));
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
			stack : false
		});
}
exports.init=init;
