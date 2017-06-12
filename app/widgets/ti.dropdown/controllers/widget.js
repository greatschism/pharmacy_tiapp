var args = $.args,
    moment = require("alloy/moment"),
    isHintText = false,
    choices = [],
    selectedIndex = -1,
    selectedDate,
    format = "MM-DD-YYYY",
    picker,
    parent,
    parentContainer;

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
		text : args.iconText,
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
		if (_.has(args, "selectedItem")) {
			setSelectedItem(args.selectedItem);
		} else if (_.has(args, "selectedIndex")) {
			setSelectedIndex(args.selectedIndex);
		}
	}

	if (_.has(args, "format")) {
		format = args.format;
	}

	if (_.has(args, "selectedDate")) {
		setValue(args.selectedDate);
	}

})();

function setParentView(view) {
	parent = view;
	parentContainer = parent.getChildren()[0].getChildren()[0];
}

function getParentView() {
	return parent;
}

function setMaxDate(maxDate) {
	args.maxDate = maxDate;
}

function setMinDate(minDate) {
	args.minDate = minDate;
}

function disableAccessibilityForParent(){
	parent.leftNavButton ? parent.leftNavButtons[0].accessibilityHidden = true : "";
	parent.rightNavButton ? parent.rightNavButton[0].accessibilityHidden = true : "";
	parentContainer.accessibilityHidden = true;
}

function enableAccessibilityForParent(){
	parent.leftNavButton ? parent.leftNavButtons[0].accessibilityHidden = false : "";
	parent.rightNavButton ? parent.rightNavButton[0].accessibilityHidden = false : "";
	parentContainer.accessibilityHidden = false;
}

function show() {
	disableAccessibilityForParent();
	if (!picker && parent) {
		//hide keyboard if any
		if (Ti.App.keyboardVisible) {
			Ti.App.hideKeyboard();
		}
		if (args.type == Ti.UI.PICKER_TYPE_DATE || args.type == Ti.UI.PICKER_TYPE_TIME) {
			if (OS_ANDROID) {
				var isDatePicker = args.type == Ti.UI.PICKER_TYPE_DATE,
				    dPicker = Ti.UI.createPicker();
				dPicker[isDatePicker ? "showDatePickerDialog" : "showTimePickerDialog"]({
					title : args.title || ("Set " + ( isDatePicker ? "date" : "time")),
					okButtonTitle : args.rightTitle || "Set",
					value : selectedDate || new Date(),
					minuteInterval : args.minuteInterval || 0,
					callback : function(e) {
						var value = e.value;
						if (value) {
							setValue(value);
						}
						$.trigger("return", {
							source : $,
							value : value,
							cancel : e.cancel,
							nextItem : args.nextItem || ""
						});
					}
				});
			} else if (OS_IOS) {
				var pickerDict = _.pick(args, ["type", "minuteInterval", "font", "color", "backgroundColor", "toolbarDict", "optionPadding", "leftTitle", "rightTitle", "leftButtonDict", "rightButtonDict", "containerPaddingTop"]);
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
				selectedAccessibilityValue : args.selectedIconText ? "Checked" : "Not checked",
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
	enableAccessibilityForParent();
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
	enableAccessibilityForParent();
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

function hide() {
	enableAccessibilityForParent();
	if (picker) {
		picker.terminate();
		return true;
	}
	return false;
}

function setChoices(items) {
	choices = items;
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

function isMatch(object, attrs) {
	var keys = _.keys(attrs),
	    length = keys.length;
	if (object === null)
		return !length;
	var obj = Object(object);
	for (var i = 0; i < length; i++) {
		var key = keys[i];
		if (attrs[key] !== obj[key] || !( key in obj))
			return false;
	}
	return true;
}

function setSelectedItem(where) {
	_.some(choices, function(choice, index) {
		/**
		 * current version of underscore in Alloy
		 * 1.6 doesn't have support for isMatch
		 */
		if (isMatch(choice, where)) {
			setSelectedIndex(index);
			return true;
		}
		return false;
	});
}

function setSelectedIndex(index) {
	selectedIndex = index;
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

function setValue(date) {
	selectedDate = date;
	removeHint();
	var label = moment(selectedDate.toString(), "ddd MMM DD YYYY HH:mm:ss").format(format);
	$.widget.accessibilityLabel = label;
	$.lbl.text = label;
}

function getValue() {
	return selectedDate;
}

exports.show = show;
exports.focus = show;
exports.hide = hide;
exports.setValue = setValue;
exports.getValue = getValue;
exports.setMaxDate = setMaxDate;
exports.setMinDate = setMinDate;
exports.setChoices = setChoices;
exports.getChoices = getChoices;
exports.setParentView = setParentView;
exports.getParentView = getParentView;
exports.setSelectedItem = setSelectedItem;
exports.getSelectedItem = getSelectedItem;
exports.setSelectedIndex = setSelectedIndex;
exports.getSelectedIndex = getSelectedIndex;
