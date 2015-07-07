var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    CONSTS = "CONST_" + $.__controllerPath + "_" + (args.detailWidth || 45);

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

if (!Alloy.TSS[CONSTS]) {
	var detailBtnWidth = ((app.device.width - ($.contentView.left || 0) - ($.contentView.right || 0)) / 100) * (args.detailWidth || 45),
	    maxWidth = $.detailBtn.maxWidth;
	Alloy.TSS[CONSTS] = {
		detailBtnWidth : detailBtnWidth > maxWidth ? maxWidth : detailBtnWidth,
		height : ($.contentView.top || 0) + ($.contentView.bottom || 0) + uihelper.getHeightFromChildren($.masterView, true),
	};
}

CONSTS = Alloy.TSS[CONSTS];

(function() {
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	$.row.height = CONSTS.height;
	$.titleLbl.text = args.title;
	$.subtitleLbl.text = args.subtitle;
	//keep secondary button as default
	$.detailBtn.applyProperties($.createStyle({
		classes : ["content-detail-" + (args.detailType ? args.detailType + "-" : "secondary-") + "btn"],
		title : args.detailTitle,
		width : CONSTS.detailBtnWidth
	}));
})();

function didClickDetail(e) {
	var source = e.source;
	$.trigger("clickdetail", {
		title : source.title,
		data : args
	});
}

function getParams() {
	return args;
}

exports.getParams = getParams;
