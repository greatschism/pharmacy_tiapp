var args = arguments[0] || {};

function didPush(e) {
	console.log("your view is up now! initialization if any");
	Alloy.Collections.stores.reset([{
		title : "1 Sansome St.",
		subtitle : "San Francisco, CA, 94103",
		distance : "0.81 mi away",
		favourite : true
	}, {
		title : "445 Bush St.",
		subtitle : "San Francisco, CA, 94103",
		distance : "0.81 mi away",
		favourite : false
	}]);
}

function didPop(e){
	$.searchbar.blur();
}

function transformFunction(model) {
	var transform = model.toJSON();
	transform.template = transform.favourite ? "favourites" : "nearby";
	return transform;
}

function didToggle(e) {
	$.searchbar.blur();
	var lVisible = $.listContainer.visible;
	$.listContainer.visible = !lVisible;
	$.mapContainer.visible = lVisible;
	$.toggleBtn.title = lVisible ? "list" : "map";
}

function didItemClick(e) {

}