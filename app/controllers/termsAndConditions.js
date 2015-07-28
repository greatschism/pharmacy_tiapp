var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper");

function init() {
	http.request({
		method : "terms_get",
		params : {
			data : [{
				terms : ""
			}]
		},
		success : didSuccess
	});
}

function didSuccess(result) {
	
	var terms = result.data,
		data = [];
	Alloy.Collections.termsAndConditions.reset(terms);
	
	_.each(terms, function(term) {
		var row = Alloy.createController("itemTemplates/labelWithChild", {
				title : term.agreement_name
			});
		data.push(row.getView());		
	});
	$.tableView.setData(data); 
}

function didClickItem(e) {
	var item = Alloy.Collections.termsAndConditions.at(e.index).toJSON();
	$.app.navigator.open({
		ctrl : "termsDoc",
		title : item.agreement_name,
		stack : true,
		ctrlArguments : item
	});	
}

function didClickDone(e) {
	app.navigator.close();
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
