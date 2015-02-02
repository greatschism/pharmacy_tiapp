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

function show(_callback, _duration) {
	toggle(true, _callback, _duration);
}

function hide(_callback, _duration) {
	toggle(false, _callback, _duration);
}

function toggle(_visible, _callback, _duration) {
	var animation = Ti.UI.createAnimation({
		opacity : _visible ? 1 : 0,
		duration : _duration || 300
	});
	animation.addEventListener("complete", function onComplete() {
		$.activityIndicator[_visible ? "show" : "hide"]();
		animation.removeEventListener("complete", onComplete);
		if (_callback) {
			_callback();
		}
	});
	$.widget.animate(animation);
}

exports.show = show;
exports.hide = hide;
exports.setMessage = setMessage;
