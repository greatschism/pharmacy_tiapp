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

	$.addClass($.txt, "txt-" + cls);

	if (args.search == true || args.leftIcon) {
		$.search = $.UI.create("Label", {
			apiName : "Label",
			id : "search"
		});
		$.widget.add($.search);
		$.search.applyProperties({
			text : args.leftIcon || "Q",
			font : args.leftIconFont || {
				fontFamily : "mscripts",
				fontSize : 24
			},
			color : args.leftIconColor || "#000"
		});
	}

	if (_.has(args, "rightImage")) {

		$.rightImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			id : "rightImg"
		});
		var rightImgDict = {
			image : args.rightImage,
			visible : true
		};
		if (args.rightImageWidth) {
			rightImgDict.width = args.rightImageWidth;
			$.txt.right = rightImgDict.width + 10;
		}
		$.rightImg.applyProperties(rightImgDict);
		$.widget.add($.rightImg);
		$.rightImg.addEventListener("singletap", didClick);

	} else if (args.clearButton == true || _.has(args, "rightButtonTitle")) {

		$.rightBtn = $.UI.create("Button", {
			apiName : "Button",
			id : "rightBtn"
		});
		$.rightBtn.applyProperties({
			title : args.rightButtonTitle || "*",
			width : args.rightButtonWidth || 50,
			font : args.rightButtonFont || args.rightButtonTitle ? args.font || {
				fontSize : 12
			} : {
				fontFamily : "mscripts",
				fontSize : 24
			},
			color : args.rightButtonColor || "#000",
			visible : !args.clearButton
		});
		$.widget.add($.rightBtn);
		$.txt.right = $.rightBtn.width + 10;
		$.rightBtn.addEventListener("click", args.clearButton ? didClear : didClick);
	}

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "opacity", "visible", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		if (_.has(options, "left") && _.has(options, "right")) {
			delete options.width;
		}
		$.widget.applyProperties(options);
	}

	options = _.pick(args, ["font", "color", "hintText", "value", "textAlign", "maxLength", "passwordMask", "returnKeyType", "autocorrect", "autocapitalization", "keyboardType"]);
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
		$.rightBtn.visible = $.txt.getValue() != "";
	}
}

function didReturn(e) {
	$.trigger("return", {
		nextItem : args.nextItem || ""
	});
}

function didClear(e) {
	$.txt.setValue("");
	$.rightBtn.visible = false;
	$.trigger("clear");
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
		$.rightBtn.visible = $.txt.getValue() != "";
	}
}

function getValue() {
	return $.txt.getValue();
}

function setPasswordMask(value) {
	$.txt.passwordMask = value;
	var len = $.txt.value.length;
	$.txt.setSelection(len, len);
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

function animate(animationProp, callback) {
	var animation = Ti.UI.createAnimation(animationProp);
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		if (callback) {
			callback($.widget);
		}
	});
	$.widget.animate(animation);
}

exports.blur = blur;
exports.focus = focus;
exports.animate = animate;
exports.setValue = setValue;
exports.getValue = getValue;
exports.setRightImage = setRightImage;
exports.getRightImage = getRightImage;
exports.setPasswordMask = setPasswordMask;
exports.getPasswordMask = getPasswordMask;
exports.setRightButtonTitle = setRightButtonTitle;
exports.getRightButtonTitle = getRightButtonTitle;
