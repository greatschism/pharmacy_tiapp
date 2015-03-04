var args = arguments[0] || {},
    PICKER_HEIGHT = 240,
    SCREEN_HEIGHT = Ti.Platform.displayCaps.platformHeight,
    font = args.font || {
	fontSize : 12
},
    parent;

(function() {

	$.datePicker.backgroundColor = args.backgroundColor || "#FFFFFF";

	$.picker.type = args.type;

	if (_.has(args, "toolbarDict")) {
		_.extend(args.toolbarDict, {
			font : font
		});
		$.toolbarView.applyProperties(args.toolbarDict);
		if (_.has(args.toolbarDict, "height")) {
			$.picker.applyProperties({
				top : args.toolbarDict.height,
				height : PICKER_HEIGHT - args.toolbarDict.height
			});
		}
	}

	if (_.has(args, "leftTitle")) {
		$.leftBtn.title = args.leftTitle;
	}

	if (_.has(args, "rightTitle")) {
		$.rightBtn.title = args.rightTitle;
	}

	if (_.has(args, "leftBtnDict")) {
		_.extend(args.leftBtnDict, {
			font : font
		});
		$.leftBtn.applyProperties(args.leftBtnDict);
	}

	if (_.has(args, "rightBtnDict")) {
		_.extend(args.rightBtnDict, {
			font : font
		});
		$.rightBtn.applyProperties(args.rightBtnDict);
	}

	if (_.has(args, "parent")) {
		setParentView(args.parent);
	}

	options = _.pick(args, ["minDate", "maxDate", "value"]);
	if (!_.isEmpty(options)) {
		$.picker.applyProperties(options);
	}

	$.datePicker.top = SCREEN_HEIGHT;

})();

function init() {
	$.datePicker.addEventListener("postlayout", didPostlayout);
	parent.add($.datePicker);
}

function terminate(_callback) {
	var animation = Ti.UI.createAnimation({
		top : SCREEN_HEIGHT,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		parent.remove($.datePicker);
		if (_callback) {
			_callback();
		}
		animation.removeEventListener("complete", onComplete);
	});
	$.datePicker.animate(animation);
}

function didPostlayout(e) {
	$.datePicker.removeEventListener("postlayout", didPostlayout);
	var top = (SCREEN_HEIGHT - PICKER_HEIGHT) - (args.containerPaddingTop || 0);
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

function didClickLeftBtn(e) {
	$.trigger("leftclick");
}

function didClickRightBtn(e) {
	$.trigger("rightclick", {
		nextItem : args.nextItem || ""
	});
}

function setParentView(_parent) {
	parent = _parent;
}

function getParentView() {
	return parent;
}

function setValue(_date) {
	$.picker.value = _date;
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
