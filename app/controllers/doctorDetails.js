var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    doctor = args.doctor;

function init() {
	updateInputs();
	if (doctor.image) {
		$.photoImg.setImage(doctor.image);
	} else {
		$.photoLbl.visible = true;
	}
	var currentDate = moment(),
	    section = $.uihelper.createTableViewSection($, $.strings.doctorDetSectionPrescribed),
	    promptClasses = ["content-group-prompt-60"],
	    replyClasses = ["content-group-right-inactive-reply-40"];
	if (doctor.doctor_type != apiCodes.doctor_type_manual) {
		if (doctor.prescriptions && doctor.prescriptions.length) {
			_.each(doctor.prescriptions, function(prescription) {
				var isExpired = moment(prescription.expiration_date, apiCodes.date_format).diff(currentDate, "days") < 0,
				    reply;
				if (isExpired) {
					reply = $.strings.doctorDetLblExpired;
				} else if (prescription.latest_sold_date) {
					reply = String.format($.strings.doctorDetLblRefilled, moment(prescription.latest_sold_date, apiCodes.date_time_format).format(Alloy.CFG.date_format));
				} else {
					reply = $.strings.doctorDetLblRefilledNone;
				}
				section.add(Alloy.createController("itemTemplates/promptReply", {
					prompt : $.utilities.ucword(prescription.presc_name),
					reply : reply,
					promptClasses : promptClasses,
					replyClasses : replyClasses
				}).getView());
			});
		} else {
			section.add(Alloy.createController("itemTemplates/label", {
				title : $.strings.doctorDetLblPrescribedNone,
				lblClasses : ["lbl-wrap"]
			}).getView());
		}
	} else {
		section.add(Alloy.createController("itemTemplates/label", {
			title : $.strings.doctorDetLblManual,
			lblClasses : ["lbl-wrap"]
		}).getView());
	}
	$.tableView.setData([section]);
}

function focus() {
	if (doctor.method == "doctors_update" && doctor.shouldUpdate) {
		doctor.title = $.strings.strPrefixDoctor.concat($.utilities.ucword(doctor.first_name || "") + " " + $.utilities.ucword(doctor.last_name || ""));
		delete doctor.shouldUpdate;
		updateInputs();
	}
}

function updateInputs() {
	$.titleLbl.text = doctor.title;
	$.notesLbl.text = doctor.notes;
	$.phoneLbl.text = $.utilities.formatPhoneNumber(doctor.phone) || $.strings.strNotAvailable;
	$.faxLbl.text = $.utilities.formatPhoneNumber(doctor.fax) || $.strings.strNotAvailable;
	var address = "";
	if (doctor.addressline1) {
		address += doctor.addressline1 + ",\n";
	}
	if (doctor.addressline2) {
		address += doctor.addressline2 + ",\n";
	}
	if (doctor.city) {
		address += doctor.city + ", ";
	}
	if (doctor.state) {
		address += doctor.state + ", ";
	}
	if (doctor.zip) {
		address += doctor.zip;
	}
	if (address) {
		var sliced = address.slice(-2);
		if (sliced == ", " || sliced == ",\n") {
			address = address.slice(0, address.length - 2);
		}
		doctor.address = address.replace(/[\s\r\n]+/g, "");
	} else {
		address = $.strings.strNotAvailable;
	}
	$.addressLbl.text = address;
}

function didError(e) {
	require("logger").error("doctorDetails", "unable to load image from url", doctor.image);
}

function didClickPhoto(e) {
	$.uihelper.getPhoto(didGetPhoto, $.window);
}

function didGetPhoto(blob) {
	var base64Str = Ti.Utils.base64encode(blob).text;
	/**
	 * TIMOB-9111
	 */
	if (OS_IOS) {
		base64Str = base64Str.replace(/[\r\n]+/g, "");
	}
	$.http.request({
		method : "upload_image",
		params : {
			feature_code : "THXXX",
			data : [{
				patient : {
					EncodedImageString : base64Str
				}
			}]
		},
		keepLoader : true,
		success : didUploadImage
	});
}

function didUploadImage(result, passthrough) {
	var imageURL = result.data;
	$.http.request({
		method : "doctors_update",
		params : {
			feature_code : "THXXX",
			data : [{
				doctors : {
					id : doctor.id,
					image_url : imageURL
				}
			}]
		},
		passthrough : imageURL,
		success : didSuccessDoctor
	});
}

function didSuccessDoctor(result, passthrough) {
	_.extend(doctor, {
		method : "doctors_update",
		image_url : passthrough
	});
	$.photoImg.setImage(passthrough);
	/**
	 * hide add photo
	 * label
	 */
	if ($.photoLbl.visible) {
		$.photoLbl.visible = false;
	}
}

function didClickPhone(e) {
	if (doctor.phone) {
		$.uihelper.getPhone({
			firstName : $.utilities.ucword(doctor.first_name || ""),
			lastName : $.utilities.ucword(doctor.last_name || ""),
			phone : {
				work : [$.phoneLbl.text]
			}
		}, doctor.phone);
	}
}

function didClickDirection(e) {
	if (doctor.address) {
		$.uihelper.getDirection(doctor.address);
	}
}

function didClickRightNav(e) {
	$.app.navigator.open({
		titleid : "titleDoctorUpdate",
		ctrl : "doctor",
		ctrlArguments : {
			isUpdate : true,
			doctor : doctor
		},
		stack : true
	});
}

exports.init = init;
exports.focus = focus;
