var args = arguments[0] || {},
    isHintText = false,
    choices = [],
    selectedIndex = -1,
    selectedDate,
    format = "MM-DD-YYYY",
    picker,
    parent;

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
		isHintText = true;
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
		format = args.format;
	}

	if (OS_MOBILEWEB && args.type == Ti.UI.PICKER_TYPE_DATE) {
		$.widget.removeEventListener("click", showPicker);
		$.container.remove($.lbl);
		var moment = require("alloy/moment");
		picker = Ti.UI.createPicker({
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			type : Ti.UI.PICKER_TYPE_DATE,
			minDate : moment(args.minDate || new Date(1900, 0, 1)).format("YYYY-MM-DD"),
			maxDate : moment(args.maxDate || new Date()).format("YYYY-MM-DD"),
			value : moment(selectedDate || new Date()).format("YYYY-MM-DD"),
			backgroundColor : "transparent",
			borderColor : "transparent",
			borderWidth : 0
		});
		$.container.add(picker);
	}

})();

function setParentView(_parent) {
	parent = _parent;
}

function getParentView() {
	return parent;
}

function showPicker() {
	if (!picker && parent) {
		if (args.type == Ti.UI.PICKER_TYPE_DATE) {
			if (OS_ANDROID) {
				var _picker = Ti.UI.createPicker({
					type : Ti.UI.PICKER_TYPE_DATE,
					minDate : args.minDate || new Date(1900, 0, 1),
					maxDate : args.maxDate || new Date(),
					value : selectedDate || new Date()
				});
				_picker.showDatePickerDialog({
					title : args.title || "Set date",
					okButtonTitle : args.okButtonTitle || "Set",
					value : selectedDate || new Date(),
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
					value : selectedDate || new Date(),
					parent : parent
				});
				picker = Widget.createController("datePicker", pickerDict);
				picker.on("leftclick", hidePicker);
				picker.on("rightclick", doSelectDate);
				picker.init();
			}
		} else {
			var pickerDict = _.pick(args, ["backgroundColor", "toolbarDict", "choiceDict", "buttonDict", "leftTitle", "rightTitle"]);
			_.extend(pickerDict, {
				choices : choices,
				selectedIndex : selectedIndex,
				parent : parent
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
exports.showPicker = showPicker;
exports.hidePicker = hidePicker;
exports.setChoices = setChoices;
exports.getChoices = getChoices;
exports.setParentView = setParentView;
exports.getParentView = getParentView;
exports.getSelectedItem = getSelectedItem;
exports.setSelectedIndex = setSelectedIndex;
exports.getSelectedIndex = getSelectedIndex;
