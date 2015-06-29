var args = arguments[0] || {},
    prescriptions = args.prescriptions || [];

(function() {

	_.each(prescriptions, function(prescription) {

		//to do
		$.prescriptionRow.title = prescription.title;

	});

})();
