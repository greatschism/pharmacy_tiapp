var args = arguments[0] || {};

(function() {
	$.titleLbl.text = args.presc_name;
	$.subtitleLbl.text = args.rx_number_formated;
	if (args.is_overdue) {
		$.infoLbl.applyProperties(args.info_style);
		$.detailLbl.applyProperties(args.detail_style);
	}
	$.infoLbl.text = args.info;
	$.detailLbl.text = args.detail;
})();
