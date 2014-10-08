var args = arguments[0] || {},
    _busy = false,
    _value,
    _touchStartX = 0,
    _disabledLeft = 2,
    _enabledLeft,
    _disabledColor,
    _enabledColor;

(function() {

	var options = {};

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		if (OS_ANDROID || OS_MOBILEWEB) {
			$.widget.applyProperties(options);
		} else {
			$.swt.applyProperties(options);
		}
	}

	if (OS_ANDROID || OS_MOBILEWEB) {
		options = _.pick(args, ["height", "borderRadius"]);
		if (!_.isEmpty(options) || _.has(args, "thumbWidth")) {
			options.width = args.thumbWidth || args.height || $.widget.height;
			$.swt.applyProperties(options);
		}
		_enabledLeft = $.widget.width - ($.swt.width + 2);
	}

	if (_.has(args, "thumbColor")) {
		if (OS_ANDROID || OS_MOBILEWEB) {
			$.swt.backgroundColor = args.thumbColor;
		} else {
			$.swt.thumbTintColor = args.thumbColor;
		}
	}

	_disabledColor = args.disabledColor || args.backgroundColor || "#CAC4C1";
	_enabledColor = args.enabledColor || "#69D669";

	if (OS_IOS) {
		$.swt.tintColor = _disabledColor;
		$.swt.onTintColor = _enabledColor;
	}

	setValue(args.value || false, false);

})();

function didTouchcancel(e) {
	_busy = true;
	_touchStartX = e.x;
	if (_value) {
		enabledSwt(true);
	} else {
		disableSwt(true);
	}
}

function didTouchstart(e) {
	if (!_busy) {
		_touchStartX = e.x;
	}
}

function didTouchmove(e) {
	if (!_busy) {
		var coords = $.swt.convertPointToView({
			x : e.x,
			y : e.y
		}, $.bgView);
		var newLeft = coords.x - _touchStartX;
		if (newLeft > _enabledLeft) {
			newLeft = _enabledLeft;
		} else if (newLeft < _disabledLeft) {
			newLeft = _disabledLeft;
		}
		$.swt.left = newLeft;
	}
}

function didTouchend(e) {
	if (!_busy) {
		_busy = true;
		var left = $.swt.left;
		if (left == _enabledLeft || left == _disabledLeft) {
			var value = left == _enabledLeft ? true : false;
			_busy = false;
			setValue(value);
		} else {
			_value = !_value;
			if (_value) {
				enabledSwt(true);
			} else {
				disableSwt(true);
			}
		}
		$.trigger("change", {
			value : _value
		});
	}
}

function didSingletap(e) {
	if (!_busy) {
		var value = !_value;
		if (setValue(value)) {
			$.trigger("change", {
				value : value
			});
		}
	}
}

function didChange(e) {
	_value = e.value;
	$.trigger("change", {
		value : _value
	});
}

function setValue(value, animate) {
	if (_value != value && _busy == false) {
		_value = value;
		if (OS_ANDROID || OS_MOBILEWEB) {
			_busy = true;
			if (_value) {
				enabledSwt(animate);
			} else {
				disableSwt(animate);
			}
		} else {
			$.swt.setValue(_value);
		}
		return true;
	}
	return false;
}

function enabledSwt(animate) {
	if (animate !== false) {
		var animation = Ti.UI.createAnimation({
			left : _enabledLeft,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.bgView.backgroundColor = _enabledColor;
			$.swt.left = _enabledLeft;
			_busy = false;
		});
		$.swt.animate(animation);
	} else {
		$.bgView.backgroundColor = _enabledColor;
		$.swt.left = _enabledLeft;
		_busy = false;
	}
}

function disableSwt(animate) {
	if (animate !== false) {
		var animation = Ti.UI.createAnimation({
			left : _disabledLeft,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.bgView.backgroundColor = _disabledColor;
			$.swt.left = _disabledLeft;
			_busy = false;
		});
		$.swt.animate(animation);
	} else {
		$.bgView.backgroundColor = _disabledColor;
		$.swt.left = _disabledLeft;
		_busy = false;
	}
}

function getValue() {
	return _value;
}

function setTouchEnabled(value) {
	$.swt.touchEnabled = value;
}

function getTouchEnabled() {
	return $.swt.touchEnabled;
}

exports.setValue = setValue;
exports.getValue = getValue;
exports.setTouchEnabled = setTouchEnabled;
exports.getTouchEnabled = getTouchEnabled;
