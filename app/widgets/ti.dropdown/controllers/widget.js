var args = arguments[0] || {},
    moment = require("alloy/moment"),
    isHintText = false,
    choices = [],
    selectedIndex = -1,
    selectedDate,
    format = "MM-DD-YYYY",
    picker,
    parent;

(function() {

	var options = _.pick(args, ["top", "bottom", "left", "right", "width", "height", "backgroundColor", "borderColor", "borderWidth", "borderRadius", "accessibilityHidden", "accessibilityHint ", "accessibilityLabel", "accessibilityValue"]);
	if (!options.accessibilityHidden && !options.accessibilityLabel) {
		options.accessibilityLabel = args.hintText || args.text || "";
	}
	$.widget.applyProperties(options);

	options = _.pick(args, ["font", "color", "textAlign"]);
	_.extend(options, {
		left : args.paddingLeft || 12,
		right : args.paddingRight || 12
	});
	if (args.hintText) {
		isHintText = true;
		_.extend(options, {
			text : args.hintText,
			color : args.hintTextColor || "#A39D9A"
		});
	} else if (args.text) {
		_.extend(options, {
			text : args.text
		});
	}
	$.lbl.applyProperties(options);

	$.downArrowLbl.applyProperties({
		right : args.iconPaddingRight || 12,
		text : args.iconText || "\"",
		color : args.iconColor || "#000",
		font : args.iconFont || {
			fontSize : 12
		}
	});

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
		format = args.format;
	}

})();

function setParentView(_parent) {
	parent = _parent;
}

function getParentView() {
	return parent;
}

function setMaxDate(_maxDate) {
	args.maxDate = _maxDate;
}

function setMinDate(_minDate) {
	args.minDate = _minDate;
}

function showPicker() {
	Ti.App.hideKeyboard();
	if (!picker && parent) {
		if (args.type == Ti.UI.PICKER_TYPE_DATE || args.type == Ti.UI.PICKER_TYPE_TIME) {
			if (OS_ANDROID) {
				var isDatePicker = args.type == Ti.UI.PICKER_TYPE_DATE,
				    _picker = Ti.UI.createPicker();
				_picker[isDatePicker ? "showDatePickerDialog" : "showTimePickerDialog"]({
					title : args.title || ("Set " + ( isDatePicker ? "date" : "time")),
					okButtonTitle : args.okButtonTitle || "Set",
					value : selectedDate || new Date(),
					callback : function(e) {
						if (!e.cancel) {
							setValue(e.value);
						}
						$.trigger("return", {
							source : $,
							value : !e.cancel ? e.value : null,
							cancel : e.cancel,
							nextItem : args.nextItem || ""
						});
					}
				});
			} else if (OS_IOS) {
				var pickerDict = _.pick(args, ["type", "font", "color", "backgroundColor", "toolbarDict", "optionPadding", "leftTitle", "rightTitle", "leftButtonDict", "rightButtonDict", "containerPaddingTop"]);
				_.extend(pickerDict, {
					minDate : args.minDate || new Date(1900, 0, 1),
					maxDate : args.maxDate || new Date(),
					value : selectedDate || new Date(),
					parent : parent,
					nextItem : args.nextItem || ""
				});
				picker = Widget.createController("datePicker", pickerDict);
				picker.on("terminate", didTerminateDatePicker);
				picker.init();
			}
		} else {
			var pickerDict = _.pick(args, ["autoHide", "tableViewDict", "selectedAccessibilityValue", "titleProperty", "font", "color", "optionPadding", "iconFont", "selectedIconText", "selectedIconColor"]);
			_.extend(pickerDict, {
				choices : choices,
				selectedIndex : selectedIndex,
				parent : parent,
				nextItem : args.nextItem || ""
			});
			picker = Widget.createController("picker", pickerDict);
			picker.on("terminate", didTerminatePicker);
			picker.init();
		}
	}
}

function didTerminateDatePicker(e) {
	if (picker) {
		picker.off("terminate", didTerminatePicker);
		if (e.value) {
			setValue(e.value);
		}
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.widget);
		}
		$.trigger("return", {
			source : $,
			value : e.value,
			cancel : e.cancel,
			nextItem : args.nextItem || ""
		});
		picker = null;
	}
}

function didTerminatePicker(e) {
	if (picker) {
		picker.off("terminate", didTerminatePicker);
		setSelectedIndex(e.selectedIndex);
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.widget);
		}
		$.trigger("return", {
			source : $,
			selectedIndex : e.selectedIndex,
			selectedItem : e.selectedItem,
			nextItem : args.nextItem || ""
		});
		picker = null;
	}
}

function hidePicker() {
	if (picker) {
		picker.terminate();
		return true;
	}
	return false;
}

function setChoices(_choices) {
	choices = _choices;
	selectedIndex = -1;
}

function getChoices() {
	return choices;
}

function removeHint() {
	if (isHintText) {
		isHintText = false;
		$.lbl.color = args.color || "#000";
	}
}

function setSelectedIndex(_index) {
	selectedIndex = _index;
	var selectedItem = getSelectedItem();
	if (!_.isEmpty(selectedItem)) {
		removeHint();
		var label = selectedItem[args.valueProperty || args.titleProperty || "title"] || "";
		$.widget.accessibilityLabel = label;
		$.lbl.text = label;
	}
}

function getSelectedIndex() {
	return selectedIndex;
}

function getSelectedItem() {
	var item = {};
	if (selectedIndex >= 0 && selectedIndex < choices.length) {
		item = choices[selectedIndex];
	}
	return item;
}

function setValue(_date) {
	selectedDate = _date;
	removeHint();
	var label = moment(selectedDate).format(format);
	$.widget.accessibilityLabel = label;
	$.lbl.text = label;
}

function getValue() {
	return selectedDate;
}

exports.setValue = setValue;
exports.getValue = getValue;
exports.setMaxDate = setMaxDate;
exports.setMinDate = setMinDate;
exports.showPicker = showPicker;
exports.focus = showPicker;
exports.hidePicker = hidePicker;
exports.setChoices = setChoices;
exports.getChoices = getChoices;
exports.setParentView = setParentView;
exports.getParentView = getParentView;
exports.getSelectedItem = getSelectedItem;
exports.setSelectedIndex = setSelectedIndex;
exports.getSelectedIndex = getSelectedIndex;
