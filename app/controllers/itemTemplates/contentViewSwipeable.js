var args = $.args,
    TAG = "COVS",
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    CONSTS = "CONST_" + $.__controllerPath,
    touchInProgress = false,
    firstMove = true,
    touchX = 0,
    currentX = 0;

if (!Alloy.TSS[CONSTS]) {
	var app = require("core"),
	    margin = utilities.percentageToValue("30%", app.device.width),
	    endOffset = Math.round(app.device.width - margin);
	/**
	 * This template is used with
	 * prescriptions list where labels has static height
	 * prescriptions has a local search / filterText options too
	 * dynamic rows, with swipe options can't be used along with search / filterText
	 * this is a limitation with iOS
	 * dynamic rows, with swipe options has no issues without search / filterText
	 *
	 * Also if postlayout is used, className should not be assigned on android
	 * which may prevent postlayout being fired for differet rows of same className
	 */
	Alloy.TSS[CONSTS] = {
		startOffset : 0,
		endOffset : endOffset,
		decisionOffset : Math.round(endOffset - (endOffset / 1.85)),
		width : endOffset,
		imageWidth : utilities.percentageToValue("20%", app.device.width - ($.masterView.left + $.masterView.right))
	};
}

CONSTS = Alloy.TSS[CONSTS];

(function() {
	if (args.hasChild) {
		uihelper.wrapViews($.contentView, "right");
	}
	var imageView = $.img.getView();
	imageView.width = CONSTS.imageWidth;
	uihelper.wrapViews($.masterView);
	if (args.image) {
		$.img.setImage(args.image);
	} else if (args.defaultImage) {
		imageView.image = args.defaultImage;
	}
	var title = args.title || (args.data ? args.data[args.titleProperty] : "");
	if (args.titleClasses) {
		$.resetClass($.titleLbl, args.titleClasses, {
			text : title
		});
	} else {
		$.titleLbl.text = title;
	}
	var subtitle = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	if (args.subtitleClasses) {
		$.resetClass($.subtitleLbl, args.subtitleClasses, {
			text : subtitle
		});
	} else {
		$.subtitleLbl.text = subtitle;
	}
	_.each(["titleLbl", "subtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
	$.swipeView.width = CONSTS.width;
	if (args.options) {
		var len = args.options.length,
		    width = CONSTS.width / len;
		_.each(args.options, function(option, index) {
			var fromLeft = width * index,
			    btn = $.UI.create("Button", {
				classes : ["top", "fill-height", (option.type || "inactive") + "-bg-color", "light-fg-color", "h6", "border-disabled", "accessibility-disabled", "bubble-disabled"],
				width : width,
				left : fromLeft,
				title : option.title,
				action : option.action
			});
			if (index !== 0) {
				$.swipeView.add($.UI.create("View", {
					classes : ["top", "v-divider-light", "fill-height", "bg-color", "bubble-disabled", "accessibility-disabled"],
					left : fromLeft,
					zIndex : 4
				}));
			}
			btn.addEventListener("click", didClickOption);
			$.swipeView.add(btn);
		});
	}
	$.containerView.addEventListener("postlayout", didPostlayout);
})();

function didPostlayout(e) {
	$.containerView.removeEventListener("postlayout", didPostlayout);
	var height = e.source.rect.height;
	/**
	 * this avoids a know flickering issue with apple
	 * with dynamic row height
	 */
	if (OS_IOS) {
		height += 0.5;
	}
	$.containerView.height = $.dragView.height = height;
	/**
	 * to keep the swipe view completely
	 * hidden from content view
	 */
	if (OS_ANDROID) {
		height -= 0.5;
	}
	$.swipeView.height = height;
}

function didError(e) {
	require("logger").error(TAG, "unable to load image from url", args.image);
}

function didClickOption(e) {
	var source = e.source;
	$.trigger("clickoption", {
		title : source.title,
		action : source.action,
		data : args
	});
}

function didTouchstart(e) {
	if (!Alloy.Globals.isSwipeInProgress) {
		Alloy.Globals.isSwipeInProgress = touchInProgress = true;
	}
	touchX = e.x;
	currentX = $.contentView.right;
}

function didTouchmove(e) {
	if (touchInProgress) {
		if (firstMove) {
			Alloy.Globals.currentTable[ OS_IOS ? "scrollable" : "touchEnabled"] = firstMove = false;
		}
		currentX += touchX - e.x;
		touchX = e.x;
		if (currentX > CONSTS.startOffset && currentX < CONSTS.endOffset) {
			$.contentView.right = currentX;
		}
	}
}

function didTouchend(e) {
	if (touchInProgress) {
		if (firstMove) {
			Alloy.Globals.isSwipeInProgress = touchInProgress = false;
		} else {
			touchEnd(currentX <= CONSTS.decisionOffset ? CONSTS.startOffset : CONSTS.endOffset);
		}
	}
}

function touchEnd(x) {
	if (!x) {
		x = CONSTS.startOffset;
	}
	var anim = Ti.UI.createAnimation({
		right : x,
		duration : 200
	});
	anim.addEventListener("complete", function onComplete() {
		anim.removeEventListener("complete", onComplete);
		$.dragView.right = $.contentView.right = x;
		if (x === CONSTS.startOffset) {
			Alloy.Globals.isSwipeInProgress = touchInProgress = false;
			Alloy.Globals.currentRow = null;
		} else {
			Alloy.Globals.currentRow = $;
		}
		currentX = 0;
		Alloy.Globals.currentTable[ OS_IOS ? "scrollable" : "touchEnabled"] = firstMove = true;
	});
	$.contentView.animate(anim);
}

function getParams() {
	return args;
}

exports.touchEnd = touchEnd;
exports.getParams = getParams;
