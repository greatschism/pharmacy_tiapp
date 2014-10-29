var args = arguments[0] || {},
    busy = false,
    _value,
    touchStartX = 0,
    disabledLeft = 2,
    enabledLeft,
    disabledColor,
    enabledColor;

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
		enabledLeft = $.widget.width - ($.swt.width + ( OS_MOBILEWEB ? 5 : 2));
	}

	if (_.has(args, "thumbColor")) {
		if (OS_ANDROID || OS_MOBILEWEB) {
			$.swt.backgroundColor = args.thumbColor;
		} else {
			$.swt.thumbTintColor = args.thumbColor;
		}
	}

	disabledColor = args.disabledColor || args.backgroundColor || "#CAC4C1";
	enabledColor = args.enabledColor || "#69D669";

	if (OS_IOS) {
		$.swt.tintColor = disabledColor;
		$.swt.onTintColor = enabledColor;
	}

	setValue(args.value || false, false);

})();

function didTouchcancel(e) {
	$.trigger("touch", {
		value : true
	});
	busy = true;
	touchStartX = e.x;
	if (_value) {
		enabledSwt(true);
	} else {
		disableSwt(true);
	}
}

function didTouchstart(e) {
	if (!busy) {
		$.trigger("touch", {
			value : false
		});
		touchStartX = e.x;
	}
}

function didTouchmove(e) {
	if (!busy) {
		var coords = $.swt.convertPointToView({
			x : e.x,
			y : e.y
		}, $.bgView);
		var newLeft = coords.x - touchStartX;
		if (newLeft > enabledLeft) {
			newLeft = enabledLeft;
		} else if (newLeft < disabledLeft) {
			newLeft = disabledLeft;
		}
		$.swt.left = newLeft;
	}
}

function didTouchend(e) {
	if (!busy) {
		$.trigger("touch", {
			value : true
		});
		busy = true;
		var left = $.swt.left;
		if (left == enabledLeft || left == disabledLeft) {
			var value = left == enabledLeft ? true : false;
			busy = false;
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
	if (!busy) {
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
	if (_value != value && busy == false) {
		_value = value;
		if (OS_ANDROID || OS_MOBILEWEB) {
			busy = true;
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
			left : enabledLeft,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.bgView.backgroundColor = enabledColor;
			$.swt.left = enabledLeft;
			busy = false;
		});
		$.swt.animate(animation);
	} else {
		$.bgView.backgroundColor = enabledColor;
		$.swt.left = enabledLeft;
		busy = false;
	}
}

function disableSwt(animate) {
	if (animate !== false) {
		var animation = Ti.UI.createAnimation({
			left : disabledLeft,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.bgView.backgroundColor = disabledColor;
			$.swt.left = disabledLeft;
			busy = false;
		});
		$.swt.animate(animation);
	} else {
		$.bgView.backgroundColor = disabledColor;
		$.swt.left = disabledLeft;
		busy = false;
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
