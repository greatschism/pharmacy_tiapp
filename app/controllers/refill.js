var args = arguments[0] || {}, App = require("core");

function didCloseToHome(e){
	//App.Navigator.closeToHome();
}

function didRefilClick(e) {
	App.Navigator.open({
		ctrl : "refill",
		title : "Order a refill",
		stack : true,
		ctrlArguments : {
			message : "Refill"
		}
	});
}