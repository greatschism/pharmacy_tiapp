var args = arguments[0] || {};

function didClickAddFamilyMember(){
	$.app.navigator.open({
			titleid : "titleAddFamily",
			ctrl : "familyMemberAdd",
			stack : true
		});
}
