var args = arguments[0] || {},
    prescriptionsData,
    strings = Alloy.Globals.strings,
    http = require("requestwrapper"),
    utilities = require("utilities"),
    moment = require("alloy/moment"),
    prescriptionsData,
    prescriptionDetailView,
    prescriptionNoContentGroup,
    prescriptionNoPmt,
    prescriptionNoPmtValue,
    expiratinDateContentGroup,
    expirationDatePmt,
    expirationDatePmtValue,
    doctorNameContentGroup,
    doctorNamePmt,
    doctorNamePmtValue,
    pharmacyNameContentGroup,
    pharmacyNamePmt,
    pharmacyNamePmtValue;

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
	$.prescriptionNoPmt.text = strings.lblPrescriptionNumber;
	$.prescriptionNoPmtValue.text = prescriptionsData[0].rx_number;
	$.expirationDatePmt.text = strings.lblExpirationDate;
	$.expirationDatePmtValue.text = prescriptionsData[0].expiration_date;
	$.doctorNamePmt.text = strings.lblDoctor;
	$.doctorNamePmtValue.text = prescriptionsData[0].doctor_id;
	$.pharmacyNamePmt.text = strings.lblPharmacy;
	$.pharmacyNamePmtValue.text = prescriptionsData[0].primary_store_id;
}

function expandCollapseView() {
	if($.expandCollapseView.height == "SIZE"){
		$.expandCollapseView.height=0;
	}
	else{
		$.expandCollapseView.height = "SIZE";
	}
}

exports.init = init;
