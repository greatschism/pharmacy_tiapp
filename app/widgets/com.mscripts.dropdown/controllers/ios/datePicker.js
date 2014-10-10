var args = arguments[0] || {},
    PICKER_HEIGHT = 340,
    _height = Ti.Platform.displayCaps.platformHeight,
    _parent;

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

	options = _.pick(args, ["minDate", "maxDate", "value"]);
	if (!_.isEmpty(options)) {
		$.picker.applyProperties(options);
	}

	if (OS_ANDROID) {
		_height = (_height / (Ti.Platform.displayCaps.dpi / 160));
	}

	$.datePicker.top = _height + PICKER_HEIGHT;

})();

function init() {
	$.datePicker.addEventListener("postlayout", didPostlayout);
	_parent.add($.datePicker);
}

function terminate(callback) {
	var animation = Ti.UI.createAnimation({
		top : _height + PICKER_HEIGHT,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		_parent.remove($.datePicker);
		if (callback) {
			callback();
		}
		animation.removeEventListener("complete", onComplete);
	});
	$.datePicker.animate(animation);
}

function didPostlayout(e) {
	$.datePicker.removeEventListener("postlayout", didPostlayout);
	var top = _height - PICKER_HEIGHT;
	var animation = Ti.UI.createAnimation({
		top : top,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		$.datePicker.top = top;
		animation.removeEventListener("complete", onComplete);
	});
	$.datePicker.animate(animation);
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

function setValue(date) {
	$.picker.value = date;
}

function getValue() {
	return $.picker.value;
}

exports.init = init;
exports.terminate = terminate;
exports.setValue = setValue;
exports.getValue = getValue;
exports.setParentView = setParentView;
exports.getParentView = getParentView;
