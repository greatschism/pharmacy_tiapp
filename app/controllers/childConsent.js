function focus() {

}

function didClickContinue() {
	$.app.navigator.open({
		titleid : "titleChildSuccess",
		ctrl : "childSuccess",
		stack : false
	});
}

function didClickConsent(e) {
	if (e.source.selected) {
		$.leftIconLbl.applyProperties($.createStyle({
			classes : ["icon-checkbox-checked"],
			selected:false,
		}));
		$.inactiveBtn.applyProperties($.createStyle({
			classes:["primary-btn"]
		}));
		$.inactiveBtn.addEventListener("click",didClickContinue);
	}
	else{
		$.leftIconLbl.applyProperties($.createStyle({
			classes : ["icon-checkbox-unchecked"],
			selected:true
		}));
		$.inactiveBtn.applyProperties($.createStyle({
			classes:["inactive-btn"]
		}));
		$.inactiveBtn.removeEventListener("click",didClickContinue);
	}
}
exports.focus = focus;
