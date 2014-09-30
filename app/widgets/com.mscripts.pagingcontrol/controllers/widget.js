var args = arguments[0] || {},
    _color = "#000",
    _selectedColor = "#fff",
    _length = 0,
    _currentPage = 0;

(function() {

	var options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	if (_.has(args, "color")) {
		_color = args.color;
	}

	if (_.has(args, "selectedColor")) {
		_selectedColor = args.selectedColor;
	}

	if (_.has(args, "currentPage")) {
		_currentPage = args.currentPage;
	}

	if (_.has(args, "length")) {
		setLength(args.length);
	}

})();

function setLength(length) {

	_length = length;

	var children = $.widget.children;
	for (var i in children) {
		$.widget.remove(children[i]);
	}

	$.container = $.UI.create("View", {
		apiName : "View",
		id : "container"
	});
	$.widget.add($.container);

	for (var i = 0; i < _length; i++) {
		var view = $.UI.create("View", {
			apiName : "View",
			classes : ["paging-control"]
		});
		view.index = i;
		view.backgroundColor = (i == _currentPage ? _selectedColor : _color);
		view.addEventListener("singletap", moveTo);
		$.container.add(view);
	}
}

function moveTo(e) {
	var index = e.source.index;
	if (index != _currentPage) {
		updateSelection(index, _currentPage);
		_currentPage = index;
		$.trigger("change", {
			currentPage : _currentPage
		});
	}
}

function updateSelection(currentIndex, previousIndex) {
	$.container.children[previousIndex].backgroundColor = _color;
	$.container.children[currentIndex].backgroundColor = _selectedColor;
}

function setCurrentPage(index) {
	if (index < _length) {
		updateSelection(index, _currentPage);
		_currentPage = index;
	}
}

function getCurrentPage() {
	return _currentPage;
}

exports.setLength = setLength;
exports.setCurrentPage = setCurrentPage;
exports.getCurrentPage = getCurrentPage;
