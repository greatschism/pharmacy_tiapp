var args = arguments[0] || {},
    pagerDict = {
	left : 5,
	width : 10,
	height : 10,
	backgroundColor : "#C4C4C4",
	borderColor : "#C4C4C4",
	borderWidth : 1,
	borderRadius : 5
},
    selectedPagerDict = {
	left : 5,
	width : 10,
	height : 10,
	backgroundColor : "#FFFFFF",
	borderColor : "#C4C4C4",
	borderWidth : 1,
	borderRadius : 5
},
    length = 0,
    currentPage = 0;

(function() {

	var options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	if (_.has(args, "pagerDict")) {
		_.extend(pagerDict, args.pagerDict);
	}

	if (_.has(args, "selectedPagerDict")) {
		_.extend(selectedPagerDict, args.selectedPagerDict);
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

	$.contentView = $.UI.create("View", {
		apiName : "View",
		id : "contentView"
	});
	$.widget.add($.contentView);

	for (var i = 0; i < length; i++) {
		var view = Ti.UI.createView(i == currentPage ? selectedPagerDict : pagerDict);
		view.index = i;
		view.addEventListener("singletap", moveTo);
		$.contentView.add(view);
	}
}

function moveTo(e) {
	var index = e.source.index;
	if (index != currentPage) {
		updateSelection(index, currentPage);
		currentPage = index;
		$.trigger("change", {
			source : $,
			currentPage : currentPage
		});
	}
}

function updateSelection(_currentIndex, _previousIndex) {
	$.contentView.children[_previousIndex].applyProperties(pagerDict);
	$.contentView.children[_currentIndex].applyProperties(selectedPagerDict);
}

function setCurrentPage(_index) {
	if (_index < length) {
		updateSelection(_index, currentPage);
		currentPage = _index;
	}
}

function getCurrentPage() {
	return currentPage;
}

exports.setLength = setLength;
exports.setCurrentPage = setCurrentPage;
exports.getCurrentPage = getCurrentPage;
