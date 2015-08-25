var args = arguments[0] || {};

function didClickAddFamilyMember(){
	/*$.app.navigator.open({
			titleid : "titleAddFamily",
			ctrl : "familyMemberAdd",
			stack : true
		});*/
	$.app.navigator.open({
			titleid : "titlePrescriptionsAdd",
			ctrl : "familyMemberAddPresc",
			stack : false
		});	
}
