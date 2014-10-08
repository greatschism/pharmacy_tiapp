var args = arguments[0] || {};

(function() {

	var options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "opacity", "visible"]);
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

	options = _.pick(args, ["text", "font", "color", "textAlign", "wordWrap", "ellipsize"]);
	if (!_.isEmpty(options)) {
		$.label.applyProperties(options);
	}

})();

function applyProperties(dict) {
	$.widget.applyProperties(dict);
}

function animate(dict, callback) {
	var animation = Ti.UI.createAnimation(dict);
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		if (callback) {
			callback();
		}
	});
	$.widget.animate(animation);
}

function show(callback) {
	if (!$.widget.visible) {
		$.widget.visible = true;
		$.widget.zIndex = args.zIndex || 1;
		var animation = Ti.UI.createAnimation({
			opacity : 1,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			if (callback) {
				callback();
			}
		});
		$.widget.animate(animation);
	}
}

function hide(callback) {
	if ($.widget.visible) {
		var animation = Ti.UI.createAnimation({
			opacity : 0,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.widget.visible = false;
			$.widget.zIndex = 0;
			if (callback) {
				callback();
			}
		});
		$.widget.animate(animation);
	}
}

function getVisible() {
	return $.widget.visible;
}

function setText(text) {
	$.label.setText(text);
}

exports.show = show;
exports.hide = hide;
exports.animate = animate;
exports.setText = setText;
exports.getVisible = getVisible;
exports.applyProperties = applyProperties;
