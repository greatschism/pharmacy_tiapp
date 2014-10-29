var args = arguments[0] || {};

(function() {

	var options = {};

	var cls = "fill";
	if (args.search && (args.clearButton || args.rightImage || args.rightButtonTitle)) {
		cls = "left-right";
	} else if (args.search) {
		cls = "left";
	} else if (args.clearButton || args.rightImage || args.rightButtonTitle) {
		cls = "right";
	}

	$.addClass($.container, "container-" + cls);

	$.txt = $.UI.create("TextField", {
		apiName : "TextField",
		classes : [("txt-" + cls)],
		id : "txt"
	});
	$.txt.addEventListener("focus", didFocus);
	$.txt.addEventListener("blur", didBlur);
	$.txt.addEventListener("return", didReturn);
	$.txt.addEventListener("change", didChange);
	$.container.add($.txt);

	if (args.search == true) {

		$.widget.add($.UI.create("ImageView", {
			apiName : "ImageView",
			id : "search"
		}));
	}

	if (args.clearButton == true || _.has(args, "rightImage")) {

		$.rightImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			id : "rightImg"
		});

		$.rightImg.image = args.clearButton ? WPATH("cancel.png") : args.rightImage;

		if (args.rightImageWidth) {
			$.rightImg.width = args.rightImageWidth;
			$.txt.right = $.rightImg.width + 10;
		}

		$.container.add($.rightImg);

		var listener;
		if (args.clearButton == true) {
			listener = didClear;
		} else {
			$.rightImg.visible = true;
			listener = didClick;
		}

		$.rightImg.addEventListener("singletap", listener);

	} else if (_.has(args, "rightButtonTitle")) {

		$.rightBtn = $.UI.create("Button", {
			apiName : "Button",
			id : "rightBtn"
		});
		$.rightBtn.applyProperties({
			title : args.rightButtonTitle,
			width : args.rightButtonWidth || 50,
			font : args.font || {
				fontSize : 12
			},
			color : args.rightButtonColor || "#000"
		});
		$.container.add($.rightBtn);

		$.txt.right = $.rightBtn.width + 20;

		$.rightBtn.addEventListener("click", didClick);
	}

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	options = _.pick(args, ["font", "color", "hintText", "value", "passwordMask", "returnKeyType", "autocorrect", "autocapitalization", "keyboardType"]);
	if (!_.isEmpty(options)) {
		$.txt.applyProperties(options);
	}

})();

function didFocus(e) {
	$.trigger("focus");
}

function didBlur(e) {
	$.trigger("blur");
}

function didChange(e) {
	$.trigger("change");
	if (args.clearButton == true) {
		$.rightImg.visible = $.txt.getValue() != "";
	}
}

function didReturn(e) {
	$.trigger("return", {
		nextItem : args.nextItem || ""
	});
}

function didClear(e) {
	$.txt.setValue("");
	$.rightImg.visible = false;
}

function didClick(e) {
	$.trigger("rightclick");
}

function focus() {
	$.txt.focus();
}

function blur() {
	$.txt.blur();
}

function setValue(value) {
	$.txt.setValue(value);
	if (args.clearButton == true) {
		$.rightImg.visible = $.txt.getValue() != "";
	}
}

function getValue() {
	return $.txt.getValue();
}

function setPasswordMask(value) {
	$.txt.passwordMask = value;
}

function getPasswordMask() {
	return $.txt.passwordMask;
}

function setRightImage(image) {
	if ($.rightImg) {
		$.rightImg.image = image;
	}
}

function getRightImage() {
	if ($.rightImg) {
		return $.rightImg.image;
	}
	return false;
}

function setRightButtonTitle(value) {
	if ($.rightBtn) {
		$.rightBtn.title = value;
	}
}

function getRightButtonTitle() {
	if ($.rightBtn) {
		return $.rightBtn.title;
	}
	return false;
}

exports.blur = blur;
exports.focus = focus;
exports.setValue = setValue;
exports.getValue = getValue;
exports.setRightImage = setRightImage;
exports.getRightImage = getRightImage;
exports.setPasswordMask = setPasswordMask;
exports.getPasswordMask = getPasswordMask;
exports.setRightButtonTitle = setRightButtonTitle;
exports.getRightButtonTitle = getRightButtonTitle;
