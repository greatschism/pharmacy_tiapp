var args = $.args;

function didClickClose() {
	var currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	
	if (currentPatient.get("mobile_number") && currentPatient.get("is_mobile_verified") === "1") {
		$.app.navigator.open({
			titleid : "titleHomePage",
			ctrl : "home",
			stack : false
		});
	} else{
		$.app.navigator.open({
			titleid : "titleTextBenefits",
			ctrl : "textBenefits",
			stack : false
		});
	};
}