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
		height : $.marginView.top + $.marginView.bottom + require("uihelper").getHeightFromChildren($.masterView, true)
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
		uihelper.wrapText($[val]);
	});
	$.swipeView.applyProperties({
		width : CONSTS.width,
		height : CONSTS.height
	});
	if (args.options) {
		var len = args.options.length,
		    width = CONSTS.width / len;
		_.each(args.options, function(option, index) {
			var fromLeft = width * index,
			    btn = $.UI.create("Button", {
				classes : ["top", "fill-height", (option.type || "inactive") + "-bg-color", "primary-light-fg-color", "h6", "border-disabled", "bubble-disabled"],
				width : width,
				left : fromLeft,
				title : option.title,
				action : option.action
			});
			if (index !== 0) {
				$.swipeView.add($.UI.create("View", {
					classes : ["top", "v-divider-light", "fill-height", "bg-color", "bubble-disabled"],
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
	if (touchInProgress && !firstMove) {
		touchEnd(currentX <= CONSTS.decisionOffset ? CONSTS.startOffset : CONSTS.endOffset);
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
