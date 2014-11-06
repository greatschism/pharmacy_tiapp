var args = arguments[0] || {},
    app = require("core"),
    moment = require("alloy/moment");

function init() {
	Alloy.Collections.gettingRefilled.reset([{
		name : "Tramadol HCL, 20mg tab qual",
		readyAt : "1416835462"
	}]);
}

function transformGettingRefilled(model) {
	var transform = model.toJSON();
	var availableDate = moment.unix(transform.readyAt);
	transform.progress = (availableDate.diff(moment().unix(), "days") + 1) / 100;
	transform.info = "Order placed should be ready by ".concat(availableDate.format("dddd hA"));
	return transform;
}

function didItemClick(e) {

}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e) {
	var action = e.data.action;
	if (action === "search") {
		$.listView.top === 0 ? showSearch() : hideSearch();
	}
}

function showSearch() {
	var top = 60;
	var listAnim = Ti.UI.createAnimation({
		top : top,
		duration : 150
	});
	listAnim.addEventListener("complete", function onComplete() {
		listAnim.removeEventListener("complete", onComplete);
		$.listView.top = top;
		$.searchbar.animate({
			opacity : 1,
			duration : 150
		}, function(searchbar) {
			searchbar.opacity = 1;
		});
	});
	listAnim.animate($.listView);
}

function hideSearch() {
	var top = 0;
	$.searchbar.animate({
		opacity : 0,
		duration : 150
	}, function(searchbar) {
		searchbar.opacity = 0;
		var listAnim = Ti.UI.createAnimation({
			top : top,
			duration : 150
		});
		listAnim.addEventListener("complete", function onComplete() {
			listAnim.removeEventListener("complete", onComplete);
			$.listView.top = top;
		});
		listAnim.animate($.listView);
	});
}

function terminate() {
	$.destroy();
}

function didAndroidBack() {
	return $.toggleMenu.hide();
}

exports.init = init;
exports.terminate = terminate;
exports.androidback = didAndroidBack; 