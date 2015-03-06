var args = arguments[0] || {};

(function() {
	$.titleLbl.text = args.presc_name;
	$.subtitleLbl.text = args.rx_number_formated;
	$.infoLbl.text = args.info;
	$.detailLbl.text = args.detail;
})();
