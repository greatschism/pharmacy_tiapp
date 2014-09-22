var args = arguments[0] || {}, _bottom = -1 * Ti.Platform.displayCaps.platformHeight, _choices = [], _selectedIndex = -1, _parent;

(function() {

	if (_.has(args, "backgroundColor")) {
		$.widget.backgroundColor = args.backgroundColor;
	}

	if (_.has(args, "toolbarDict")) {
		$.toolbar.applyProperties(args.toolbarDict);
	}

	if (_.has(args, "buttonDict")) {
		$.leftBtn.applyProperties(args.buttonDict);
		$.rightBtn.applyProperties(args.buttonDict);
	}

	if (_.has(args, "leftTitle")) {
		$.rightBtn.title = args.leftTitle;
	}

	if (_.has(args, "rightTitle")) {
		$.rightBtn.title = args.rightTitle;
	}

	if (_.has(args, "parent")) {
		setParentView(args.parent);
	}

	if (_.has(args, "choices")) {

		setChoices(args.choices);

		if (_.has(args, "selectedIndex")) {
			setSelectedIndex(args.selectedIndex);
		}
	}

	if (OS_ANDROID) {
		_bottom = (_bottom / (Ti.Platform.displayCaps.dpi / 160));
	}
	$.picker.bottom = _bottom;

})();

function init() {
	$.picker.addEventListener("postlayout", didPostlayout);
	_parent.add($.picker);
}

function terminate(callback) {
	$.picker.animate({
		bottom : _bottom,
		duration : 300
	}, function() {
		_parent.remove($.picker);
		if (callback) {
			callback();
		}
	});
}

function didPostlayout(e) {
	$.picker.removeEventListener("postlayout", didPostlayout);
	$.picker.animate({
		bottom : 0,
		duration : 300
	});
}

function didLeftClick(e) {
	$.trigger("leftclick");
}

function didRightClick(e) {
	$.trigger("rightclick");
}

function setParentView(parent) {
	_parent = parent;
}

function getParentView() {
	return _parent;
}

function setChoices(choices) {
	_choices = choices;
	_selectedIndex = -1;
}

function getChoices() {
	return _choices;
}

function setSelectedIndex(index) {
	_selectedIndex = index;
}

function getSelectedIndex() {
	return _selectedIndex;
}

exports.init = init;
exports.terminate = terminate;
exports.setChoices = setChoices;
exports.getChoices = getChoices;
exports.setParentView = setParentView;
exports.getParentView = getParentView;
exports.setSelectedIndex = setSelectedIndex;
exports.getSelectedIndex = getSelectedIndex;
