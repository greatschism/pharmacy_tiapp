var args = $.args,
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (args.hasChild) {
		uihelper.wrapViews($.row, "right");
	}
	var pDict = $.createStyle({
		classes : args.promptClasses || ["left", "width-40", "inactive-fg-color"],
		text : args.prompt || (args.data ? args.data[args.promptProperty] : "")
	}),
	    rDict = $.createStyle({
		classes : args.replyClasses || ["margin-left-medium", "width-60"],
		text : args.reply || (args.data ? args.data[args.replyProperty] : "")
	});
	if (pDict.width === Ti.UI.SIZE) {
		rDict.visible = false;
		$.contentView.layout = "composite";
		$.promptLbl.addEventListener("postlayout", didPostlayout);
	} else {
		$.row.className = "promptReply" + parseInt(pDict.width) + parseInt(rDict.width) + (args.hasChild && "WithChild" || "");
	}
	$.promptLbl.applyProperties(pDict);
	$.replyLbl.applyProperties(rDict);
	_.each(["promptLbl", "replyLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
})();

function didPostlayout(e) {
	$.promptLbl.removeEventListener("postlayout", didPostlayout);
	$.replyLbl.applyProperties({
		left : ($.replyLbl.left || 0) + $.promptLbl.rect.width,
		visible : true
	});
}

function getParams() {
	return args;
}

exports.getParams = getParams;
