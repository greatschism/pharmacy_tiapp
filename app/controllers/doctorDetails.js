var args = arguments[0] || {};

(function() {
	var doctor = Alloy.Collections.doctors.where({
	id: args.itemId
	})[0].toJSON();
	doctor.name = "Dr. " + doctor.fname + " " + doctor.lname;
	if (!doctor.image) {
		doctor.image = "/images/add_photo.png";
	}
	if (doctor.prescriptions.length > 4) {
		var footerView = $.UI.create("View", {
			apiName : "View",
			classes : ["row-h40", "bg-aeroblue"]
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
	Alloy.Collections.prescriptions.reset(doctor.prescriptions.slice(0, 4));
	Alloy.Models.doctor.set(doctor);
})();

function didClickMore(e) {
	$.footerView.remove($.footerView.children[0]);
	Alloy.Collections.prescriptions.reset(Alloy.Models.doctor.get("prescriptions"));
}

function didClickProfileImg(e) {
	if (Alloy.Models.doctor.get("image") == "/images/add_photo.png") {
		$.photoDialog.show();
	}
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

exports.terminate = terminate;
