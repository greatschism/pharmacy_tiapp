var args = arguments[0] || {},
    _isHintText = false,
    _choices = [],
    _selectedIndex = -1,
    _selectedDate,
    _format = "MM-DD-YYYY",
    _picker,
    _parent;

(function() {
	var options = {};

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	options = _.pick(args, ["font", "color"]);
	if (!_.isEmpty(options)) {
		$.lbl.applyProperties(options);
	}

	if (args.hintText) {
		_isHintText = true;
		$.lbl.applyProperties({
			text : args.hintText,
			color : "#A39D9A"
		});
	} else if (args.text) {
		$.lbl.text = args.text;
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

	if (_.has(args, "selectedDate")) {
		setValue(args.selectedDate);
	}

	if (_.has(args, "format")) {
		_format = args.format;
	}

	if (OS_MOBILEWEB && args.type == Ti.UI.PICKER_TYPE_DATE) {
		$.widget.removeEventListener("click", showPicker);
		$.container.remove($.lbl);
		var moment = require("alloy/moment");
		_picker = Ti.UI.createPicker({
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			type : Ti.UI.PICKER_TYPE_DATE,
			minDate : moment(args.minDate || new Date(1900, 0, 1)).format("YYYY-MM-DD"),
			maxDate : moment(args.maxDate || new Date()).format("YYYY-MM-DD"),
			value : moment(_selectedDate || new Date()).format("YYYY-MM-DD"),
			backgroundColor : "transparent",
			borderColor : "transparent",
			borderWidth : 0
		});
		$.container.add(_picker);
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
		if (args.type == Ti.UI.PICKER_TYPE_DATE) {
			if (OS_ANDROID) {
				var picker = Ti.UI.createPicker({
					type : Ti.UI.PICKER_TYPE_DATE,
					minDate : args.minDate || new Date(1900, 0, 1),
					maxDate : args.maxDate || new Date(),
					value : _selectedDate || new Date()
				});
				picker.showDatePickerDialog({
					title : args.title || "Set date",
					okButtonTitle : args.okButtonTitle || "Set",
					value : _selectedDate || new Date(),
					callback : function(e) {
						if (e.cancel) {
							$.trigger("cancel");
						} else {
							setValue(e.value);
						}
					}
				});
			} else if (OS_IOS) {
				var pickerDict = _.pick(args, ["backgroundColor", "toolbarDict", "choiceDict", "buttonDict", "leftTitle", "rightTitle"]);
				_.extend(pickerDict, {
					minDate : args.minDate || new Date(1900, 0, 1),
					maxDate : args.maxDate || new Date(),
					value : _selectedDate || new Date(),
					parent : _parent
				});
				_picker = Widget.createController("datePicker", pickerDict);
				_picker.on("leftclick", hidePicker);
				_picker.on("rightclick", doSelectDate);
				_picker.init();
			}
		} else {
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
	removeHint();
	$.lbl.setText(getSelectedItem().title || "");
}

function removeHint() {
	if (_isHintText) {
		_isHintText = false;
		$.lbl.color = args.color || "#000";
	}
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

function doSelectDate(e) {
	setValue(_picker.getValue());
	hidePicker();
}

function setValue(date) {
	if (OS_MOBILEWEB) {
		_picker.value = moment(date).format("YYYY-MM-DD");
	} else {
		_selectedDate = date;
		removeHint();
		var moment = require("alloy/moment");
		$.lbl.text = moment(_selectedDate).format(_format);
	}
}

function getValue() {
	if (OS_MOBILEWEB) {
		return _picker.value;
	} else {
		return _selectedDate;
	}
}

exports.setValue = setValue;
exports.getValue = getValue;
exports.showPicker = showPicker;
exports.hidePicker = hidePicker;
exports.setChoices = setChoices;
exports.getChoices = getChoices;
exports.setParentView = setParentView;
exports.getParentView = getParentView;
exports.getSelectedItem = getSelectedItem;
exports.setSelectedIndex = setSelectedIndex;
exports.getSelectedIndex = getSelectedIndex;
