var args = arguments[0] || {},
    app = require("core"),
    HEIGHT_CONST = "HEIGHT_" + $.__controllerPath,
    START_OFFSET_CONST = "SWIPE_LEFT_START_OFFSET" + $.__controllerPath,
    MIDDLE_OFFSET_CONST = "SWIPE_LEFT_MIDDLE_OFFSET" + $.__controllerPath,
    END_OFFSET_CONST = "SWIPE_LEFT_END_OFFSET" + $.__controllerPath,
    X = 0;

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

if (!Alloy.TSS[HEIGHT_CONST]) {
	Alloy.TSS[HEIGHT_CONST] = $.contentView.top + $.contentView.bottom + $.titleLbl.height + $.subtitleLbl.top + $.subtitleLbl.height;
}

if (!Alloy.TSS[START_OFFSET_CONST]) {
	Alloy.TSS[START_OFFSET_CONST] = app.device.width - ($.swipeContentView.left + Alloy.TSS.margin_left.left);
}

if (!Alloy.TSS[MIDDLE_OFFSET_CONST]) {
	Alloy.TSS[MIDDLE_OFFSET_CONST] = Alloy.TSS[START_OFFSET_CONST] / 2;
}

if (!Alloy.TSS[END_OFFSET_CONST]) {
	Alloy.TSS[END_OFFSET_CONST] = $.swipeContentView.left;
}

(function() {
	var detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : ""),
	    options = args.options || [{
		title : "Opt 1",
		type : "positive"
	}, {
		title : "Opt 2",
		type : "negative"
	}, {
		title : "Opt 3"
	}],
	    len = options.length;
	$.row.height = Alloy.TSS[HEIGHT_CONST];
	$.swipeView.left = Alloy.TSS[START_OFFSET_CONST];
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
		var width = len === 3 ? 30 : 40,
		    optionClassPrefix = "swipe-content-",
		    optionClassSuffix = "btn-" + width,
		    right = "0";
		_.each(options, function(option, index) {
			var fromRight = (width * index) + "%",
			    btn = $.UI.create("Button", {
				apiName : "Button",
				classes : [optionClassPrefix + (option.type ? option.type + "-" : "") + optionClassSuffix],
				right : fromRight,
				title : option.title
			});
			if (index !== 0) {
				$.swipeContentView.add($.UI.create("View", {
					apiName : "View",
					classes : ["v-divider"],
					right : fromRight,
					height : btn.height
				}));
			}
			btn.addEventListener("click", didClickOption);
			$.swipeContentView.add(btn);
		});
	}
})();

function didClickOption(e) {
	$.trigger("clickoption", e);
}

function didTouchstart(e) {
	if (!Alloy.Globals.isSwipeViewVisible) {
		Alloy.Globals.isSwipeViewVisible = true;
		X = e.x;
	}
}

function didTouchmove(e) {
	if (Alloy.Globals.isSwipeViewVisible) {
		$.swipeView.left += e.x - X;
	}
}

function didTouchend(e) {
	if (Alloy.Globals.isSwipeViewVisible) {
		Alloy.Globals.isSwipeViewVisible = false;
		var left = $.swipeView.left >= Alloy.TSS[MIDDLE_OFFSET_CONST] ? Alloy.TSS[END_OFFSET_CONST] : Alloy.TSS[START_OFFSET_CONST],
		    anim = Ti.UI.createAnimation({
			left : left,
			duration : 200
		});
		anim.addEventListener("complete", function onComplete() {
			anim.removeEventListener("complete", onComplete);
			$.swipeView.left = left;
			Alloy.Globals.isSwipeViewVisible = false;
			X = 0;
		});
		$.swipeView.animate(anim);
	}
}

