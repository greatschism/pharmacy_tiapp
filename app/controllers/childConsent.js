 var args=arguments[0]||{};
function focus() {

}

function didClickContinue() {
	$.app.navigator.open({
		titleid : "titleChildSuccess",
		ctrl : "childSuccess",
		ctrlArguments : {
			username : args.username,
			password : args.password,
		},
		stack : false
	});
}

function didClickConsent(e) {
	if (e.source.selected) {
		$.leftIconLbl.applyProperties($.createStyle({
			classes : ["icon-checkbox-checked","content-positive-left-icon"],
			selected:false,
		}));
		$.inactiveBtn.applyProperties($.createStyle({
			classes:["primary-btn"]
		}));
		$.inactiveBtn.addEventListener("click",didClickContinue);
	}
	else{
		$.leftIconLbl.applyProperties($.createStyle({
			classes : ["icon-checkbox-unchecked","content-inactive-left-icon"],
			selected:true
		}));
		$.inactiveBtn.applyProperties($.createStyle({
			classes:["inactive-btn"]
		}));
		$.inactiveBtn.removeEventListener("click",didClickContinue);
	}
}
exports.focus = focus;
