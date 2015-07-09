var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    CONSTS = "CONST_" + $.__controllerPath,
    touchInProgress = false,
    firstMove = true,
    touchX = 0,
    currentX = 0;

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

if (!Alloy.TSS[CONSTS]) {
	var paddingLeft = $.swipeView.paddingLeft,
	    availableWidth = app.device.width - paddingLeft,
	    endOffset = app.device.width + $.swipeView.paddingRight;
	Alloy.TSS[CONSTS] = {
		availableWidth : availableWidth,
		startOffset : paddingLeft,
		decisionOffset : endOffset - (endOffset / 3),
		endOffset : endOffset
	};
}

CONSTS = Alloy.TSS[CONSTS];

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	$.titleLbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
	$.subtitleLbl.text = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	var detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : "");
	$.addClass($.detailTitleLbl, [detailClassPrefix + "title"], {
		text : args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : "")
	});
	$.addClass($.detailSubtitleLbl, [detailClassPrefix + "subtitle"], {
		text : args.detailSubtitle || (args.data ? args.data[args.detailSubtitleProperty] : "")
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
	$.containerView.addEventListener("postlayout", didPostlayout);
})();

function didPostlayout(e) {
	$.containerView.removeEventListener("postlayout", didPostlayout);
	var height = e.source.rect.height;
	$.containerView.height = height;
	$.swipeView.height = height;
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
	if (!Alloy.Globals.swipeInProgress) {
		Alloy.Globals.swipeInProgress = touchInProgress = true;
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
			Alloy.Globals.swipeInProgress = touchInProgress = false;
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
