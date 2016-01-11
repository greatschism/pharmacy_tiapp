var args = arguments[0] || {},
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
	    availableWidth = app.device.width - margin,
	    endOffset = app.device.width + $.contentView.left;
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
		height : $.contentView.top + $.contentView.bottom + require("uihelper").getHeightFromChildren($.masterView, true),
		availableWidth : availableWidth,
		startOffset : margin,
		decisionOffset : endOffset - (endOffset / 3),
		endOffset : endOffset
	};
}

CONSTS = Alloy.TSS[CONSTS];

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	/**
	 *  keep different class names for different layouts
	 */
	$.row.className = "masterDetail" + (args.masterWidth || "") + (args.detailWidth || "") + "Swipeable";
	$.containerView.height = CONSTS.height;
	if (args.masterWidth) {
		$.resetClass($.masterView, ["left", "width-" + args.masterWidth, "auto-height", "vgroup"]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["right", "width-" + args.detailWidth, "auto-height", "vgroup"]);
	}
	$.titleLbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
	$.subtitleLbl.text = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	var detailClassPrefix = args.detailType ? args.detailType + "-" : "";
	$.addClass($.detailTitleLbl, [detailClassPrefix + "fg-color"], {
		text : args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : "")
	});
	$.addClass($.detailSubtitleLbl, [detailClassPrefix + "fg-color"], {
		text : args.detailSubtitle || (args.data ? args.data[args.detailSubtitleProperty] : "")
	});
	_.each(["titleLbl", "subtitleLbl", "detailTitleLbl", "detailSubtitleLbl"], function(val) {
		uihelper.disableWrap($[val]);
	});
	$.swipeView.applyProperties({
		left : CONSTS.endOffset,
		width : CONSTS.availableWidth,
		height : CONSTS.height
	});
	if (args.options) {
		var len = args.options.length,
		    width = CONSTS.availableWidth / len;
		_.each(args.options, function(option, index) {
			var fromLeft = width * index,
			    btn = $.UI.create("Button", {
				classes : ["top", "fill-height", (option.type || "inactive") + "-bg-color", "primary-light-fg-color", "h5", "border-disabled"],
				width : width,
				left : fromLeft,
				title : option.title,
				action : option.action
			});
			if (index !== 0) {
				$.swipeView.add($.UI.create("View", {
					classes : ["top", "v-divider-light", "fill-height", "bg-color"],
					left : fromLeft,
					zIndex : 4
				}));
			}
			btn.addEventListener("click", didClickOption);
			$.swipeView.add(btn);
		});
	}
})();

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
