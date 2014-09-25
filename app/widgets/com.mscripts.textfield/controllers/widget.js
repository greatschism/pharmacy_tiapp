var args = arguments[0] || {};

(function() {

	var options = {};

	var className = args.search && (args.clearButton || args.rightImage) ? "left-right" : (args.search ? "left" : (args.clearButton || args.rightImage ? "right" : "fill"));
	$.addClass($.container, "container-" + className);
	$.txt = $.UI.create("TextField", {
		apiName : "TextField",
		classes : ["txt", ("txt-" + className)],
		id : "txt"
	});
	$.txt.addEventListener("focus", didFocus);
	$.txt.addEventListener("blur", didBlur);
	$.txt.addEventListener("return", didReturn);
	$.container.add($.txt);

	if (args.search == true) {
		console.debug("adding search icon");
		$.widget.add(Widget.createController("search").getView());
	}

	if (args.clearButton == true || _.has(args, "rightImage")) {
		console.debug("adding right butotn");
		$.rightImg = Widget.createController("rightImg", {
			image : args.clearButton ? WPATH("cancel.png") : args.rightImage
		}).getView();
		$.container.add($.rightImg);
		var listener;
		if (args.clearButton == true) {
			$.txt.addEventListener("change", didChange);
			listener = didClear;
		} else {
			$.rightImg.visible = true;
			listener = didClick;
		}
		$.rightImg.addEventListener("singletap", listener);
	}
	
	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	options = _.pick(args, ["font", "color", "hintText", "value", "returnKeyType", "autocorrect", "autocapitalization"]);
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
	$.rightImg.visible = $.txt.getValue() != "";
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
};

exports.getValue = function() {
	return $.txt.getValue();
};
