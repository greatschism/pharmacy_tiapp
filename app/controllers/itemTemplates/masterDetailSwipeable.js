var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    CONSTS = "CONST_" + $.__controllerPath,
    touchInProgress = false,
    touchX,
    currentX;

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

if (!Alloy.TSS[CONSTS]) {
	var dragWidth = $.dragView.width,
	    endOffset = app.device.width - dragWidth;
	Alloy.TSS[CONSTS] = {
		height : $.contentView.top + $.contentView.bottom + $.titleLbl.height + $.subtitleLbl.top + $.subtitleLbl.height,
		dragWidth : dragWidth,
		availableWidth : endOffset,
		startOffset : 0,
		middleOffset : endOffset / 2,
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
	currentX = CONSTS.endOffset;
	$.swipeView.left = currentX;
	$.dragView.left = currentX;
	if (len) {
		var width = CONSTS.availableWidth / len,
		    optionClassPrefix = "swipe-view-";
		_.each(options, function(option, index) {
			var fromLeft = CONSTS.dragWidth + (width * index),
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
		title : e.source.title
	}) || {});
}

function didTouchstart(e) {
	if (!Alloy.Globals.isSwiped) {
		Alloy.Globals.isSwiped = touchInProgress = true;
		touchX = e.x;
		Alloy.Globals.swipeableTable[ OS_IOS ? "scrollable" : "touchEnabled"] = false;
	}
}

function didTouchmove(e) {
	if (touchInProgress) {
		currentX += e.x - touchX;
		touchX = e.x;
		if (currentX > CONSTS.startOffset) {
			$.swipeView.left = currentX;
		}
	}
}

function didTouchend(e) {
	currentX = currentX <= CONSTS.middleOffset ? CONSTS.startOffset : CONSTS.endOffset;
	var anim = Ti.UI.createAnimation({
		left : currentX,
		duration : 200
	});
	anim.addEventListener("complete", function onComplete() {
		anim.removeEventListener("complete", onComplete);
		$.swipeView.left = currentX;
		if (currentX === CONSTS.startOffset) {
			currentX = CONSTS.endOffset;
			$.dragView.visible = false;
		} else if (touchInProgress) {
			Alloy.Globals.isSwiped = touchInProgress = false;
			$.dragView.visible = true;
		}
		Alloy.Globals.swipeableTable[ OS_IOS ? "scrollable" : "touchEnabled"] = true;
	});
	$.swipeView.animate(anim);
}

function getParams() {
	return args;
}

exports.getParams = getParams;
