var args = arguments[0] || {},
    CONSTS = "CONST_" + $.__controllerPath;

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

if (!Alloy.TSS[CONSTS]) {
	Alloy.TSS[CONSTS] = {
		height : $.contentView.top + $.contentView.bottom + $.titleLbl.height + $.subtitleLbl.top + $.subtitleLbl.height
	};
}

CONSTS = Alloy.TSS[CONSTS];

(function() {
	var detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : "");
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	$.row.height = CONSTS.height;
	if (!_.has(args, "selected")) {
		args.selected = false;
	}
	resetSelectionState();
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
})();

function didClickChecked(e) {
	args.selected = !args.selected;
	resetSelectionState();
}

function resetSelectionState() {
	$.resetClass($.selectionLbl, args.selected ? ["content-positive-left-icon", "icn-filled-success"] : ["content-inactive-left-icon", "icn-spot"]);
}

function getParams() {
	return args;
}

exports.getParams = getParams;
