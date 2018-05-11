var args = $.args;

function init()
{
	$.uihelper.getImage("expcheckout_benefits", $.expCheckoutBenefitsImage);
	
}

function didClickDone() {
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
exports.init = init;