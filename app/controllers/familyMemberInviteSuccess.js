var args = $.args;
function init() {
	$.uihelper.getImage("text_benefits", $.inviteSuccessImg);
	$.inviteMsg.text = String.format(Alloy.Globals.strings.familyMemberInviteSuccessMsg, args.familyRelationship);
}

function didAddAnotherMember() {
	$.app.navigator.open({
		titleid : "titleAddFamily",
		ctrl : "familyMemberAdd",
		stack : true
	});
}

function didClickDone() {
	$.app.navigator.open({
		titleid : "titleFamilyCare",
		ctrl : "familyCare",
		stack : false
	});
}

exports.init = init;
