var args = arguments[0] || {},
    color = "#000",
    selectedColor = "#fff",
    length = 0,
    currentPage = 0;

(function() {

	var options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	if (_.has(args, "color")) {
		color = args.color;
	}

	if (_.has(args, "selectedColor")) {
		selectedColor = args.selectedColor;
	}

	if (_.has(args, "currentPage")) {
		currentPage = args.currentPage;
	}

	if (_.has(args, "length")) {
		setLength(args.length);
	}

})();

function setLength(_length) {

	length = _length;

	var children = $.widget.children;
	for (var i in children) {
		$.widget.remove(children[i]);
	}

	$.container = $.UI.create("View", {
		apiName : "View",
		id : "container"
	});
	$.widget.add($.container);

	for (var i = 0; i < length; i++) {
		var view = $.UI.create("View", {
			apiName : "View",
			classes : ["paging-control"]
		});
		view.index = i;
		view.backgroundColor = (i == currentPage ? selectedColor : color);
		view.addEventListener("singletap", moveTo);
		$.container.add(view);
	}
}

function moveTo(e) {
	var index = e.source.index;
	if (index != currentPage) {
		updateSelection(index, currentPage);
		currentPage = index;
		$.trigger("change", {
			currentPage : currentPage
		});
	}
}

function updateSelection(currentIndex, previousIndex) {
	$.container.children[previousIndex].backgroundColor = color;
	$.container.children[currentIndex].backgroundColor = selectedColor;
}

function setCurrentPage(index) {
	if (index < length) {
		updateSelection(index, currentPage);
		currentPage = index;
	}
}

function getCurrentPage() {
	return currentPage;
}

exports.setLength = setLength;
exports.setCurrentPage = setCurrentPage;
exports.getCurrentPage = getCurrentPage;
