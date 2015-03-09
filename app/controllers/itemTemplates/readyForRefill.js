var args = arguments[0] || {};

(function() {
	$.titleLbl.text = args.presc_name;
	$.subtitleLbl.text = args.rx_number_formated;
	if (args.is_overdue) {
		if (!args.autoHide) {
			$.infoLbl.applyProperties(args.info_style);
		}
		$.detailLbl.applyProperties(args.detail_style);
	}
	if (args.autoHide) {
		$.resetClass($.prescriptionView, ["left", "width-50", "auto-height", "vgroup"]);
		$.resetClass($.detailView, ["right", "width-45", "auto-height", "vgroup"]);
		$.addClass($.hideView, ["critical-option-view"]);
		$.resetClass($.infoLbl, ["padding-left", "padding-right", "critical-option-lbl", "touch-disabled"]);
		$.detailLbl.text = args.info + " " + args.detail;
		$.infoLbl.text = Alloy.Globals.strings.lblHideFromList;
	} else {
		$.infoLbl.text = args.info;
		$.detailLbl.text = args.detail;
	}
	$.row.sectionId = args.property;
	$.row.searchableText = (args.presc_name + args.rx_number_formated).toLowerCase();
})();
