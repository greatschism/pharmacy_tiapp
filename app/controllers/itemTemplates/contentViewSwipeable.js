var args = arguments[0] || {},
    TAG = "COVS",
    CONSTS = "CONST_" + $.__controllerPath,
    touchInProgress = false,
    firstMove = true,
    touchX = 0,
    currentX = 0;

if (!Alloy.TSS[CONSTS]) {
	var app = require("core"),
	    paddingLeft = $.swipeView.paddingLeft,
	    availableWidth = app.device.width - paddingLeft,
	    endOffset = app.device.width + $.swipeView.paddingRight;
	/**
	 * this row should not be used in combination with
	 * filterText as this row height is determined only
	 * when it is rendered on screen, this will throw errors
	 * on ios as apple is not happy with dynamic row height
	 *
	 * if postlayout is used, className should not be assigned on android
	 * which may prevent postlayout being fired for differet rows of same className
	 *
	 * The alternative could be use the apple's default swipe features
	 * but it is supported only on iOS 8 and above. if  we make sure we use only
	 * delete in swipe we can use native swipe options that is available from iOS 6
	 */
	Alloy.TSS[CONSTS] = {
		availableWidth : availableWidth,
		startOffset : paddingLeft,
		decisionOffset : endOffset - (endOffset / 3),
		endOffset : endOffset
	};
}

CONSTS = Alloy.TSS[CONSTS];

(function() {
	if (args.image) {
		$.img.setImage(args.image);
	} else if (args.defaultImage) {
		$.img.getView().image = args.defaultImage;
	}
	$.addClass($.titleLbl, args.titleClasses || ["content-title"], {
		text : args.title || (args.data ? args.data[args.titleProperty] : "")
	});
	$.addClass($.subtitleLbl, args.subtitleClasses || ["content-subtitle"], {
		text : args.subtitle || (args.data ? args.data[args.subtitleProperty] : "")
	});
	$.swipeView.applyProperties({
		left : CONSTS.endOffset,
		width : CONSTS.availableWidth
	});
	if (args.options) {
		var len = args.options.length,
		    width = CONSTS.availableWidth / len,
		    optionClassPrefix = "swipe-view-";
		_.each(args.options, function(option, index) {
			var fromLeft = width * index,
			    btn = $.UI.create("Button", {
				classes : [optionClassPrefix + (option.type ? option.type + "-" : "") + "btn"],
				width : width,
				left : fromLeft,
				title : option.title,
				action : option.action
			});
			if (index !== 0) {
				$.swipeView.add($.UI.create("View", {
					classes : ["swipe-view-divider"],
					left : fromLeft,
					height : btn.height,
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
	$.containerView.height = height;
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
		startX = touchX = e.x;
		currentX = $.swipeView.left;
	}
}

function didTouchmove(e) {
	if (touchInProgress) {
		if (firstMove) {
			Alloy.Globals.currentTable[ OS_IOS ? "scrollable" : "touchEnabled"] = firstMove = false;
		}
		currentX -= touchX - e.x;
		touchX = e.x;
		if (currentX > CONSTS.startOffset && currentX < CONSTS.endOffset) {
			$.swipeView.left = currentX;
		}
	}
}

function didTouchend(e) {
	if (touchInProgress && currentX != 0) {
		touchEnd(currentX <= CONSTS.decisionOffset ? CONSTS.startOffset : CONSTS.endOffset);
	}
}

function touchEnd(x) {
	if (!x) {
		x = CONSTS.endOffset;
	}
	var anim = Ti.UI.createAnimation({
		left : x,
		duration : 200
	});
	anim.addEventListener("complete", function onComplete() {
		anim.removeEventListener("complete", onComplete);
		$.swipeView.left = x;
		if (x === CONSTS.startOffset) {
			Alloy.Globals.currentRow = $;
		} else {
			Alloy.Globals.isSwipeInProgress = touchInProgress = false;
			Alloy.Globals.currentRow = null;
		}
		currentX = touchX = 0;
		Alloy.Globals.currentTable[ OS_IOS ? "scrollable" : "touchEnabled"] = firstMove = true;
	});
	$.swipeView.animate(anim);
}

function getParams() {
	return args;
}

exports.touchEnd = touchEnd;
exports.getParams = getParams;
