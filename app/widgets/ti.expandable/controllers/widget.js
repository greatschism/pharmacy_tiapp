var args = arguments[0] || {},
    masterView,
    detailView,
    masterHeight,
    detailHeight,
    stopListening;

(function() {

	var options = _.pick(args, ["top", "bottom", "left", "right", "width", "height", "layout", "backgroundColor", "backgroundImage", "borderColor", "borderRadius", "borderWidth"]);
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

	if (args.children) {
		_.each(args.children, function(child) {
			var role = child.role;
			if (child.__iamalloy) {
				child = child.getView();
			}
			if (!child) {
				return;
			}
			if (!role) {
				role = child.role;
			}
			switch(role) {
			case "masterView":
				masterView = child;
				break;
			case "detailView":
				detailView = child;
				break;
			}
			child.addEventListener("postlayout", didPostlayout);
			$.widget.add(child);
		});
		delete args.children;
	}

})();

function didPostlayout(e) {
	var view = e.source,
	    height = view.rect.height;
	if (!height) {
		var blob = view.toImage();
		height = blob.height;
		blob = null;
		if (OS_ANDROID) {
			height /= Ti.Platform.displayCaps.logicalDensityFactor;
		}
	}
	if (view == masterView) {
		$.widget.height = masterHeight = height + (view.top || 0) + (view.bottom || 0);
		view.removeEventListener("postlayout", didPostlayout);
	} else {
		detailHeight = height + (view.top || 0) + (view.bottom || 0);
		if (stopListening) {
			view.removeEventListener("postlayout", didPostlayout);
			if (isExpanded()) {
				$.widget.height = masterHeight + detailHeight;
			}
		}
	}
}

function applyProperties(dict) {
	$.widget.applyProperties(dict);
}

function expand() {
	if (masterHeight && detailHeight) {
		$.widget.height = masterHeight + detailHeight;
		return animate(1);
	}
	return false;
}

function collapse() {
	if (masterHeight && detailHeight) {
		return animate(0, function() {
			$.widget.height = masterHeight;
		});
	}
	return false;
}

function animate(opacity, callback) {
	var dAnim = Ti.UI.createAnimation({
		opacity : opacity,
		duration : 200
	});
	dAnim.addEventListener("complete", function onComplete() {
		dAnim.removeEventListener("complete", onComplete);
		detailView.opacity = opacity;
		if (callback) {
			callback();
		}
	});
	detailView.animate(dAnim);
	return true;
}

function isExpanded() {
	return $.widget.height !== masterHeight;
}

function setStopListening(value) {
	stopListening = value;
}

exports.expand = expand;
exports.collapse = collapse;
exports.isExpanded = isExpanded;
exports.applyProperties = applyProperties;
exports.setStopListening = setStopListening;
