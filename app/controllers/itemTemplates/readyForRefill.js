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
		$.resetClass($.prescriptionView, ["left", "width-55", "auto-height", "vgroup"]);
		$.resetClass($.detailView, ["right", "width-40", "auto-height", "vgroup"]);
		$.resetClass($.hideView, ["right", "auto", "critical-option-view", "touch-disabled"]);
		$.resetClass($.infoLbl, ["padding-left", "padding-right", "critical-option-lbl", "touch-disabled"]);
		$.detailLbl.text = args.info + " " + args.detail;
		$.infoLbl.text = Alloy.Globals.strings.lblHideFromList;
	} else {
		$.infoLbl.text = args.info;
		$.detailLbl.text = args.detail;
	}
})();
