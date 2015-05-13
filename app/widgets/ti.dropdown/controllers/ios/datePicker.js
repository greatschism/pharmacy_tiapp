var args = arguments[0] || {},
    font = args.font || {
	fontSize : 12
},
    selectedDate = args.value || new Date(),
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

	if (_.has(args, "leftButtonDict")) {
		_.extend(args.leftButtonDict, {
			font : font
		});
		$.leftBtn.applyProperties(args.leftButtonDict);
	}

	if (_.has(args, "rightButtonDict")) {
		_.extend(args.rightButtonDict, {
			font : font
		});
		$.rightBtn.applyProperties(args.rightButtonDict);
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

function didChange(e) {
	selectedDate = e.value;
}

function terminate(_callback) {
	_.each(parent.children, function(child) {
		child.accessibilityHidden = false;
	});
	var isCancel = _callback.source && _callback.source == $.leftBtn,
	    animation = Ti.UI.createAnimation({
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
			value : isCancel ? null : selectedDate,
			cancel : isCancel,
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
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.picker);
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
	selectedDate = _date;
	$.picker.value = selectedDate;
}

function getValue() {
	return selectedDate;
}

exports.init = init;
exports.terminate = terminate;
exports.setValue = setValue;
exports.getValue = getValue;
exports.setParentView = setParentView;
exports.getParentView = getParentView;
