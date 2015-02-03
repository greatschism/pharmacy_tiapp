var args = arguments[0] || {};

(function() {
	var options = _.pick(args, ["font", "color", "textAlign", "text"]);
	if (!_.isEmpty(options)) {
		$.messageLbl.applyProperties(options);
	}

	if (_.has(args, "message")) {
		setMessage(args.message);
	}

	$.activityIndicator.show();
})();

function setMessage(message) {
	$.messageLbl.setText(message);
}

function show(_callback, _animated, _duration) {
	if (_animated !== false) {
		animate(true, _callback, _duration);
	} else {
		toggleProperties(true, _callback);
	}
}

function hide(_callback, _animated, _duration) {
	if (_animated !== false) {
		animate(false, _callback, _duration);
	} else {
		toggleProperties(false, _callback);
	}
}

function animate(_visible, _callback, _duration) {
	var animation = Ti.UI.createAnimation({
		opacity : _visible ? 1 : 0,
		duration : _duration || 300
	});
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		toggleProperties(_visible, _callback);
	});
	$.widget.animate(animation);
}

function toggleProperties(_visible, _callback) {
	$.widget.applyProperties({
		opacity : _visible ? 1 : 0,
		visible : _visible
	});
	if (_callback) {
		_callback();
	}
}

exports.show = show;
exports.hide = hide;
exports.setMessage = setMessage;
