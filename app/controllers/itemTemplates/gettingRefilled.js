var args = arguments[0] || {};

(function() {
	$.titleLbl.text = args.presc_name;
	$.subtitleLbl.text = args.info;
	$.progressView.width = args.progress;
	$.row.sectionId = args.property;
	$.row.searchableText = (args.presc_name + args.rx_number_formated).toLowerCase();
})();
