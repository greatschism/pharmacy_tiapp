var args = $.args,
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 75;

if (OS_ANDROID) {
	MAX_HEIGHT /= Ti.Platform.displayCaps.logicalDensityFactor;
}

(function() {

	var options = _.pick(args, ["top", "width", "height", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

	if (_.has(args, "children")) {
		_.each(args.children, function(child) {
			if (child.__iamalloy) {
				child = child.getView();
			}
			if (!child) {
				return;
			}
			$.contentView.add(child);
		});
		delete args.children;
	}

	$.contentView.addEventListener("postlayout", didPostlayout);

})();

function didPostlayout(e) {
	$.contentView.removeEventListener("postlayout", didPostlayout);
	if (e.source.rect.height > MAX_HEIGHT) {
		$.contentView.height = MAX_HEIGHT;
	}
}

function applyProperties(dict) {
	$.contentView.applyProperties(dict);
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
		//hide keyboard if any
		if (Ti.App.keyboardVisible) {
			Ti.App.hideKeyboard();
		}
		//disable accessibility of other elements
		_.each($.widget.getParent().children, function(child) {
			if (child == $.widget) {
				return;
			}
			child.accessibilityHidden = true;
		});
		$.widget.applyProperties({
			visible : true,
			zIndex : args.zIndex || 10,
		});
		var animation = Ti.UI.createAnimation({
			opacity : 1,
			duration : 200
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.widget.opacity = 1;
			if (Ti.App.accessibilityEnabled) {
				Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.tableView);
			}
			if (callback) {
				callback();
			}
		});
		$.widget.animate(animation);
		return true;
	}
	return false;
}

function hide(callback) {
	if ($.widget.visible) {
		//enable accessibility back
		_.each($.widget.getParent().children, function(child) {
			if (child == $.widget) {
				return;
			}
			child.accessibilityHidden = false;
		});
		var animation = Ti.UI.createAnimation({
			opacity : 0,
			duration : 200
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.widget.applyProperties({
				opacity : 0,
				visible : false,
				zIndex : 0
			});
			if (callback) {
				callback();
			}
		});
		$.widget.animate(animation);
		return true;
	}
	return false;
}

function toggle(callback) {
	if ($.widget.visible) {
		hide(callback);
	} else {
		show(callback);
	}
}

function getVisible() {
	return $.widget.visible;
}

_.extend($, {
	show : show,
	hide : hide,
	toggle : toggle,
	animate : animate,
	getVisible : getVisible,
	applyProperties : applyProperties
});
