var args = arguments[0] || {},
    prescriptionsData,
    strings = Alloy.Globals.strings,
    http = require("requestwrapper"),
    utilities = require("utilities"),
    moment = require("alloy/moment"),
    prescriptionsData;

function init() {
	http.request({
		method : "prescriptions_get",
		params : {
			data : [{
				prescriptions : {
					id : "877",
					sort_order_preferences : "x",
					prescription_display_status : "active/hidden"
				}
			}],

		},
		success : didGetPrescriptionDetail
	});
}

function didGetPrescriptionDetail(_result) {
	prescriptionsData = _result.data.prescriptions;
	$.prescriptionNameLbl.text = utilities.ucfirst(prescriptionsData[0].presc_name);
	$.prescriptionNoPmtValue.text = prescriptionsData[0].rx_number;
	$.expirationDatePmtValue.text = moment(prescriptionsData[0].expiration_date || "03-21-2015 11:30 AM", Alloy.CFG.apiCodes.date_time_format).format(Alloy.CFG.date_format);;
	$.doctorNamePmtValue.text = prescriptionsData[0].doctor_id;
	$.pharmacyNamePmtValue.text = prescriptionsData[0].primary_store_id;
	$.refillsLeftLblValue.title=prescriptionsData[0].refill_left;
	$.lastFilledLblValue.title=prescriptionsData[0].presc_last_filled_date ?moment(prescriptionsData[0].presc_last_filled_date || "03-21-2015 11:30 AM", Alloy.CFG.apiCodes.date_time_format).format(Alloy.CFG.date_format): "NA";
	$.dueForRefillLblValue.title= prescriptionsData[0].anticipated_refill_date ? moment(prescription.anticipated_refill_date, Alloy.CFG.apiCodes.date_format).format(Alloy.CFG.date_format) : "NA";
	$.remindeMeMedicationSwt.setValue(true);
	$.setMedicationSwt.setValue(true);
}


function expandCollapseView() {
	$.expandCollapseView.height == "SIZE" ? $.expandCollapseView.height=0 : $.expandCollapseView.height = "SIZE";
}

exports.init = init;
