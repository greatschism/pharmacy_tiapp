var args = arguments[0] || {},
    osMajorVersion = parseInt(Ti.Platform.version.split(".")[0], 10),
    keyboard = OS_MOBILEWEB ? false : require("ti.keyboard"),
    isHintText = false,
    choices = [],
    selectedIndex = -1,
    selectedDate,
    format = "MM-DD-YYYY",
    picker,
    parent;

(function() {
	var options = {};

	options = _.pick(args, ["top", "bottom", "left", "right", "width", "height", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	options = _.pick(args, ["font", "color"]);
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

	if (OS_MOBILEWEB && args.type == Ti.UI.PICKER_TYPE_DATE) {
		$.widget.removeEventListener("click", showPicker);
		$.widget.remove($.lbl);
		var moment = require("alloy/moment");
		picker = Ti.UI.createPicker({
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			type : Ti.UI.PICKER_TYPE_DATE,
			minDate : moment(args.minDate|| new Date(1900, 0, 1)).format("YYYY-MM-DD"),
			maxDate : moment(args.maxDate || new Date()).format("YYYY-MM-DD"),
			value : moment(selectedDate || new Date()).format("YYYY-MM-DD"),
			backgroundColor : "transparent",
			borderColor : "transparent",
			borderWidth : 0
		});
		$.widget.add(picker);
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
	if (OS_MOBILEWEB) {
		picker.setMaxDate(moment(args.maxDate || new Date()).format("YYYY-MM-DD"));
	}
}

function setMinDate(_minDate) {
	args.minDate = _minDate;
	if (OS_MOBILEWEB) {
		picker.setMinDate(moment(args.minDate || new Date(1900, 0, 1)).format("YYYY-MM-DD"));
	}
}

function showPicker() {
	keyboard && keyboard.hide();
	if (!picker && parent) {
		if (args.type == Ti.UI.PICKER_TYPE_DATE) {
			if (OS_ANDROID) {
				var dict = {
					type : Ti.UI.PICKER_TYPE_DATE,
					value : selectedDate || new Date()
				};
				if (osMajorVersion > 2) {
					_.extend(dict, {
						minDate : args.minDate || new Date(1900, 0, 1),
						maxDate : args.maxDate || new Date()
					});
				}
				var _picker = Ti.UI.createPicker(dict);
				_picker.showDatePickerDialog({
					title : args.title || "Set date",
					okButtonTitle : args.okButtonTitle || "Set",
					value : selectedDate || new Date(),
					callback : function(e) {
						if (e.cancel) {
							$.trigger("cancel", {
								source : $
							});
						} else {
							setValue(e.value);
							$.trigger("return", {
								source : $,
								nextItem : args.nextItem || ""
							});
						}
					}
				});
			} else if (OS_IOS) {
				var pickerDict = _.pick(args, ["backgroundColor", "toolbarDict", "choiceDict", "buttonDict", "leftTitle", "rightTitle"]);
				_.extend(pickerDict, {
					minDate : args.minDate || new Date(1900, 0, 1),
					maxDate : args.maxDate || new Date(),
					value : selectedDate || new Date(),
					parent : parent,
					nextItem : args.nextItem || ""
				});
				picker = Widget.createController("datePicker", pickerDict);
				picker.on("leftclick", hidePicker);
				picker.on("rightclick", doSelectDate);
				picker.init();
			}
		} else {
			var pickerDict = _.pick(args, ["backgroundColor", "toolbarDict", "choiceDict", "leftTitle", "rightTitle", "leftBtnDict", "rightBtnDict", "iconFont", "selectionIconText", "iconSelectionColor", "containerPaddingTop"]);
			_.extend(pickerDict, {
				choices : choices,
				selectedIndex : selectedIndex,
				parent : parent,
				nextItem : args.nextItem || ""
			});
			picker = Widget.createController("picker", pickerDict);
			picker.on("leftclick", hidePicker);
			picker.on("rightclick", doSelect);
			picker.init();
		}
	}

}

function hidePicker() {
	if (picker) {
		picker.off("leftclick", hidePicker);
		picker.off("rightclick", doSelect);
		picker.terminate(function() {
			picker = null;
		});
	}
}

function doSelect(e) {
	setSelectedIndex(picker.getSelectedIndex());
	hidePicker();
	e.source = $;
	$.trigger("return", e);
}

function setChoices(_choices) {
	choices = _choices;
	selectedIndex = -1;
}

function getChoices() {
	return choices;
}

function setSelectedIndex(index) {
	selectedIndex = index;
	removeHint();
	$.lbl.setText(getSelectedItem().title || "");
}

function removeHint() {
	if (isHintText) {
		isHintText = false;
		$.lbl.color = args.color || "#000";
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

function doSelectDate(e) {
	setValue(picker.getValue());
	hidePicker();
	e.source = $;
	$.trigger("return", e);
}

function setValue(date) {
	if (OS_MOBILEWEB) {
		picker.value = moment(date).format("YYYY-MM-DD");
	} else {
		selectedDate = date;
		removeHint();
		var moment = require("alloy/moment");
		$.lbl.text = moment(selectedDate).format(format);
	}
}

function getValue() {
	if (OS_MOBILEWEB) {
		return picker.value;
	} else {
		return selectedDate;
	}
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
