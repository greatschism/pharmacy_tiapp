var args = arguments[0] || {}, _choices = [], _selectedIndex = -1, _picker, _parent;

(function() {
	var options = {};

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	options = _.pick(args, ["font", "color", "text"]);
	if (!_.isEmpty(options)) {
		$.lbl.applyProperties(options);
	}

	$.rightImg.image = args.rightImage || WPATH("dropdown.png");

	if (_.has(args, "parent")) {
		setParentView(args.parent);
	}

	if (_.has(args, "choices")) {

		setChoices(args.choices);

		if (_.has(args, "selectedIndex")) {
			setSelectedIndex(args.selectedIndex);
		}
	}

})();

function setParentView(parent) {
	_parent = parent;
}

function getParentView() {
	return _parent;
}

function showPicker() {
	if (!_picker && _parent) {
		var pickerDict = _.pick(args, ["backgroundColor", "toolbarDict", "choiceDict", "buttonDict", "leftTitle", "rightTitle"]);
		_.extend(pickerDict, {
			choices : _choices,
			selectedIndex : _selectedIndex,
			parent : _parent
		});
		_picker = Widget.createController("picker", pickerDict);
		_picker.on("leftclick", hidePicker);
		_picker.on("rightclick", doSelect);
		_picker.init();
	}
}

function hidePicker() {
	if (_picker) {
		_picker.off("leftclick", hidePicker);
		_picker.off("rightclick", doSelect);
		_picker.terminate(function() {
			_picker = null;
		});
	}
}

function doSelect(e) {
	setSelectedIndex(_picker.getSelectedIndex());
	hidePicker();
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
	$.lbl.setText(getSelectedItem().title || "");
}

function getSelectedIndex() {
	return _selectedIndex;
}

function getSelectedItem() {
	var item = {};
	if (_selectedIndex >= 0 && _selectedIndex < _choices.length) {
		item = _choices[_selectedIndex];
	}
	return item;
}

exports.showPicker = showPicker;
exports.hidePicker = hidePicker;
exports.setChoices = setChoices;
exports.getChoices = getChoices;
exports.setParentView = setParentView;
exports.getParentView = getParentView;
exports.getSelectedItem = getSelectedItem;
exports.setSelectedIndex = setSelectedIndex;
exports.getSelectedIndex = getSelectedIndex;
