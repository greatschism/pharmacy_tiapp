var args = arguments[0] || {}; 

function init(){
	$.uihelper.getImage("text_benefits" , $.textBenefitsImg);
	
	/**
	 * Set the data to the table view
	 */
	var data = [];
	var benefits = [$.strings.textSignupBenefit1, $.strings.textSignupBenefit2, $.strings.textSignupBenefit3, $.strings.textSignupBenefit4 ];
	_.each(benefits, function(benefit){
		var row = Alloy.createController("itemTemplates/completed", {
			subtitle : benefit
		});
		data.push(row.getView());
	});
	$.tableView.setData(data);
}

function didClickTextSignup(){
	
}

function didClickSkipTextSignup(){
	
}

exports.init = init;
