var args = arguments[0] || {},
    font = args.font || {
	fontSize : 12
},
    parent;

(function() {

	if (_.has(args, "toolbarDict")) {
		var toolbarDict = args.toolbarDict;
		if (_.has(toolbarDict, "height")) {
			delete toolbarDict.height;
		}
		$.toolbarView.applyProperties(args.toolbarDict);
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

	options = _.pick(args, ["type", "minDate", "maxDate", "value"]);
	if (!_.isEmpty(options)) {
		$.picker.applyProperties(options);
	}

})();

function init() {
	_.each(parent.children, function(child) {
		child.accessibilityHidden = true;
	});
	$.datePicker.addEventListener("postlayout", didPostlayout);
	parent.add($.datePicker);
}

function terminate(_callback) {
	_.each(parent.children, function(child) {
		child.accessibilityHidden = false;
	});
	var animation = Ti.UI.createAnimation({
		opacity : 0,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		parent.remove($.datePicker);
		if (_.isFunction(_callback)) {
			_callback();
		}
		$.trigger("terminate", {
			soruce : $,
			value : _callback.source && _callback.source == $.leftBtn ? null : $.picker.value,
			nextItem : args.nextItem || ""
		});
	});
	$.datePicker.animate(animation);
}

function didPostlayout(e) {
	$.datePicker.removeEventListener("postlayout", didPostlayout);
	var animation = Ti.UI.createAnimation({
		opacity : 1,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		$.datePicker.opacity = 1;
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.picker);
		}
	});
	$.datePicker.animate(animation);
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
