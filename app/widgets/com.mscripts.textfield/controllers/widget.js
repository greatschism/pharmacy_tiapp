var args = arguments[0] || {};

(function() {

	var options = {};

	var cls = "fill";
	if (args.search && (args.clearButton || args.rightImag || args.rightButtonTitle)) {
		cls = "left-right";
	} else if (args.search) {
		cls = "left";
	} else if (args.clearButton || args.rightImag || args.rightButtonTitle) {
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

		console.debug("adding search icon");

		$.widget.add($.UI.create("ImageView", {
			apiName : "ImageView",
			id : "search"
		}));
	}

	if (args.clearButton == true || _.has(args, "rightImage")) {

		console.debug("adding right image");

		$.rightImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			id : "rightImg"
		});

		$.rightImg.image = args.clearButton ? WPATH("cancel.png") : args.rightImage;

		if (args.rightImageWidth) {
			$.rightImg.width = args.rightImageWidth;
			$.txt.right = OS_MOBILEWEB ? ($.rightImg.width + 10) : $.rightImg.width;
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

		console.debug("adding right button");

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

		$.txt.right = $.rightBtn.width + ( OS_MOBILEWEB ? 20 : 10);

		$.rightBtn.addEventListener("click", didClick);
	}

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	options = _.pick(args, ["font", "color", "hintText", "value", "passwordMask", "returnKeyType", "autocorrect", "autocapitalization"]);
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
	if (OS_ANDROID) {
		$.txt.blur();
	}
	$.trigger("return");
}

function didClear(e) {
	$.txt.setValue("");
	$.rightImg.visible = false;
}

function didClick(e) {
	$.trigger("rightclick");
}

exports.focus = function() {
	$.txt.focus();
};

exports.blur = function() {
	$.txt.blur();
};

exports.setValue = function(value) {
	$.txt.setValue(value);
	if (args.clearButton == true) {
		$.rightImg.visible = $.txt.getValue() != "";
	}
};

exports.getValue = function() {
	return $.txt.getValue();
};

exports.setPasswordMask = function(value) {
	$.txt.setPasswordMask(value);
};
