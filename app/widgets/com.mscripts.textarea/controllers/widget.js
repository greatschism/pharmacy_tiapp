var args = arguments[0] || {};

(function() {

	var options = {};

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	if (_.has(args, "hintText")) {
		if (OS_IOS || OS_MOBILEWEB) {
			options = _.pick(args, ["font", "textAlign"]);
			_.extend(options, {
				text : args.hintText
			});
			$.hintLbl.applyProperties(options);
		} else if (OS_ANDROID) {
			$.txta.hintText = args.hintText;
		}
	} else {
		if (OS_IOS || OS_MOBILEWEB) {
			$.widget.remove($.hintLbl);
		}
	}

	options = _.pick(args, ["font", "color", "textAlign", "maxLength", "suppressReturn", "returnKeyType", "autocorrect", "autocapitalization", "keyboardType"]);
	if (!_.isEmpty(options)) {
		$.txta.applyProperties(options);
	}

	if (_.has(args, "value")) {
		setValue(args.value);
	}

})();

function didFocus(e) {
	$.trigger("focus");
	if (OS_MOBILEWEB && $.hintLbl) {
		$.hintLbl.visible = false;
	}
}

function didBlur(e) {
	$.trigger("blur");
	if (OS_MOBILEWEB && $.hintLbl) {
		$.hintLbl.visible = $.txta.value.length == 0;
	}
}

function didChange(e) {
	$.trigger("change");
	if (OS_IOS && $.hintLbl) {
		$.hintLbl.visible = $.txta.value.length == 0;
	}
}

function didReturn(e) {
	$.trigger("return", {
		nextItem : args.nextItem || ""
	});
}

function focus() {
	$.txta.focus();
}

function blur() {
	$.txta.blur();
}

function setValue(value) {
	$.txta.setValue(value);
	if ((OS_IOS || OS_MOBILEWEB) && $.hintLbl) {
		$.hintLbl.visible = value.length == 0;
	}
}

function getValue() {
	return $.txta.getValue();
}

exports.blur = blur;
exports.focus = focus;
exports.setValue = setValue;
exports.getValue = getValue;
