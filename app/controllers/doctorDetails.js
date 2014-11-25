var args = arguments[0] || {},
    http = require("httpwrapper");

function init() {
	http.request({
		url : "http://10.10.10.20:9000/services-demo/services/doctor",
		dataTransform : false,
		format : "JSON",
		action : "get",
		data : {
			doctor_details : {
				doctor_id : args.itemId
			}
		},
		success : didSuccess
	});
}

function didSuccess(result) {
	var doctor = result.doctor_details;
	doctor.short_name = "Dr. " + doctor.last_name;
	doctor.long_name = "Dr. " + doctor.first_name + " " + doctor.last_name;
	doctor.thumbnail_url = "/images/profile.png";
	if (doctor.prescriptions.length > 4) {
		var footerView = $.UI.create("View", {
			apiName : "View",
			classes : ["height-40d", "bg-aeroblue"]
		});
		var container = $.UI.create("View", {
			apiName : "View",
			classes : ["auto", "hgroup", "touch-disabled"]
		});
		var moreImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			classes : ["width-20d", "left", "touch-disabled"],
			id : "moreImg"
		});
		container.add(moreImg);
		var moreLbl = $.UI.create("Label", {
			apiName : "Label",
			classes : ["button-title", "h4", "gulfstream", "touch-disabled"],
			id : "moreLbl"
		});
		container.add(moreLbl);
		footerView.add(container);
		footerView.addEventListener("click", didClickMore);
		$.footerView.add(footerView);
	}
	$.notesTxta.setValue(doctor.notes);
	Alloy.Models.doctor.set(doctor);
	Alloy.Collections.prescriptions.reset(_.first(doctor.prescriptions, 4));
}

function didClickMore(e) {
	$.footerView.remove($.footerView.children[0]);
	Alloy.Collections.prescriptions.reset(Alloy.Models.doctor.get("prescriptions"));
}

function didClickProfileImg(e) {
	$.photoDialog.show();
}

function didClickHideDoctor(e) {

}

function didClickOption(e) {
	console.log(e);
}

function terminate() {
	$.destroy();
	Alloy.Models.doctor.clear();
}

exports.init = init;
exports.terminate = terminate;
