var args = arguments[0] || {},
    PICKER_HEIGHT = 290,
    height = Ti.Platform.displayCaps.platformHeight,
    parent;

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
		height = (height / (Ti.Platform.displayCaps.dpi / 160));
	}

	$.datePicker.top = height + PICKER_HEIGHT;

})();

function init() {
	$.datePicker.addEventListener("postlayout", didPostlayout);
	parent.add($.datePicker);
}

function terminate(callback) {
	var animation = Ti.UI.createAnimation({
		top : height + PICKER_HEIGHT,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		parent.remove($.datePicker);
		if (callback) {
			callback();
		}
		animation.removeEventListener("complete", onComplete);
	});
	$.datePicker.animate(animation);
}

function didPostlayout(e) {
	$.datePicker.removeEventListener("postlayout", didPostlayout);
	var top = height - PICKER_HEIGHT;
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

function setParentView(_parent) {
	parent = _parent;
}

function getParentView() {
	return parent;
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
