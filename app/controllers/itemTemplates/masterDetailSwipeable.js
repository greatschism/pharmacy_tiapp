var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    CONSTS = "CONST_" + $.__controllerPath,
    touchInProgress = false,
    touchX = 0,
    currentX = 0;

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

if (!Alloy.TSS[CONSTS]) {
	var paddingLeft = $.swipeView.paddingLeft,
	    availableWidth = app.device.width - paddingLeft,
	    endOffset = app.device.width + paddingLeft;
	Alloy.TSS[CONSTS] = {
		height : ($.contentView.top || 0) + ($.contentView.bottom || 0) + uihelper.getHeightFromChildrenWithPadding($.masterView),
		availableWidth : availableWidth,
		startOffset : paddingLeft,
		decisionOffset : endOffset / 2,
		endOffset : endOffset
	};
}

CONSTS = Alloy.TSS[CONSTS];

(function() {
	var detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : ""),
	    options = args.options || [],
	    len = options.length;
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	$.swipeView.applyProperties({
		left : CONSTS.endOffset,
		width : CONSTS.availableWidth
	});
	$.containerView.height = CONSTS.height;
	$.titleLbl.text = args.title;
	$.subtitleLbl.text = args.subtitle;
	$.detailTitleLbl.applyProperties($.createStyle({
		classes : [detailClassPrefix + "title"],
		text : args.detailTitle
	}));
	$.detailSubtitleLbl.applyProperties($.createStyle({
		classes : [detailClassPrefix + "subtitle"],
		text : args.detailSubtitle
	}));
	if (len) {
		var width = CONSTS.availableWidth / len,
		    optionClassPrefix = "swipe-view-";
		_.each(options, function(option, index) {
			var fromLeft = width * index,
			    btn = $.UI.create("Button", {
				apiName : "Button",
				classes : [optionClassPrefix + (option.type ? option.type + "-" : "") + "btn"],
				width : width,
				left : fromLeft,
				title : option.title
			});
			if (index !== 0) {
				$.swipeView.add($.UI.create("View", {
					apiName : "View",
					classes : ["v-divider"],
					left : fromLeft,
					height : btn.height,
					zIndex : 4
				}));
			}
			btn.addEventListener("click", didClickOption);
			$.swipeView.add(btn);
		});
	}
})();

function didClickOption(e) {
	$.trigger("clickoption", _.findWhere(args.options, {
		title : e.source.title,
		data : args
	}) || {});
}

function didTouchstart(e) {
	if (!Alloy.Globals.swipeInProgress) {
		Alloy.Globals.swipeInProgress = touchInProgress = true;
		Alloy.Globals.currentTable[ OS_IOS ? "scrollable" : "touchEnabled"] = false;
		startX = touchX = e.x;
		currentX = $.swipeView.left;
	}
}

function didTouchmove(e) {
	if (touchInProgress) {
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
			Alloy.Globals.swipeInProgress = touchInProgress = false;
			Alloy.Globals.currentRow = null;
		}
		currentX = touchX = 0;
		Alloy.Globals.currentTable[ OS_IOS ? "scrollable" : "touchEnabled"] = true;
	});
	$.swipeView.animate(anim);
}

function getParams() {
	return args;
}

exports.touchEnd = touchEnd;
exports.getParams = getParams;
