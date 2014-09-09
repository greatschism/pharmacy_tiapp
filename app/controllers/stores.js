var args = arguments[0] || {};

function init(e) {
	console.log("init");
	Alloy.Collections.stores.reset([{
		title : "1 Sansome St.",
		subtitle : "San Francisco, CA, 94103",
		distance : "0.81 mi away",
		favourite : true
	}, {
		title : "446 Bush St.",
		subtitle : "San Francisco, CA, 94103",
		distance : "0.81 mi away",
		favourite : true
	}, {
		title : "447 Bush St.",
		subtitle : "San Francisco, CA, 94103",
		distance : "0.82 mi away",
		favourite : false
	}, {
		title : "448 Bush St.",
		subtitle : "San Francisco, CA, 94103",
		distance : "0.85 mi away",
		favourite : false
	}, {
		title : "449 Bush St.",
		subtitle : "San Francisco, CA, 94103",
		distance : "0.91 mi away",
		favourite : false
	}]);
}

function terminate(e) {
	console.log("terminate");
	$.destroy();
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

exports.init = init;
exports.terminate = terminate;
