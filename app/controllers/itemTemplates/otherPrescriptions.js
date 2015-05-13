var args = arguments[0] || {};

(function() {
	$.titleLbl.text = args.presc_name;
	$.subtitleLbl.text = args.rx_number_formated;
	$.infoLbl.text = args.info;
	$.detailLbl.text = args.detail;
	$.row.sectionId = args.property;
	$.row.rowId = args.id;
	$.row.searchableText = (args.presc_name + args.rx_number_formated).toLowerCase();
})();
