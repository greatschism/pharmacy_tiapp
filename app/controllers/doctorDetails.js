	var args = $.args,
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    doctor = args.doctor;

function init() {
	$.photoView.width = $.utilities.percentageToValue("30%", $.app.device.width - ($.containerView.left + $.containerView.right));
	_.each(["containerView", "phoneView", "faxView", "addressView"], function(val) {
		$.uihelper.wrapViews($[val]);
	});
	updateInputs();
			
	$.photoImg.accessibilityLabel = "Doctor's image";

	if (doctor.image) {
		$.photoImg.setImage(doctor.image);
	} else {
		$.photoImg.getView().image = doctor.defaultImage;
	}
	var currentDate = moment(),
	    section = $.uihelper.createTableViewSection($, $.strings.doctorDetSectionPrescribed),
	    promptClasses = ["left", "width-65"],
	    replyClasses = ["right", "width-35", "txt-right", "inactive-fg-color"];
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
				title : $.strings.doctorDetLblPrescribedNone
			}).getView());
		}
	} else {
		section.add(Alloy.createController("itemTemplates/label", {
			title : $.strings.doctorDetLblManual
		}).getView());
	}
	$.tableView.setData([section]);
}

function focus() {
	/**
	 * shouldUpdate flag is used only by this controller
	 * method field is again used in doctors controller when going back from here
	 * the same filed will be deleted there, don't use method only as reference here
	 */
	if (doctor.method == "doctors_update" && doctor.shouldUpdate) {
		doctor.title = $.strings.strPrefixDoctor.concat($.utilities.ucword(doctor.first_name || "") + " " + $.utilities.ucword(doctor.last_name || ""));
		delete doctor.shouldUpdate;
		updateInputs();
	}
}

function updateInputs() {
	$.titleLbl.text = doctor.title;
	$.notesLbl.text = doctor.notes;
	$.phoneLbl.text =  doctor.phone!= null ? ($.utilities.isPhoneNumber((doctor.phone).substr(1, 10)) ? $.utilities.formatPhoneNumber((doctor.phone).substr(1, 10)) : $.strings.strNotAvailable) : $.strings.strNotAvailable ;

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
	//height is not being set to maintain the aspect ratio
	$.uihelper.getPhoto(false, didGetPhoto, $.window, Alloy.CFG.thumbnail_default_width);
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
	var data = _.pick(doctor, ["id", "doctor_type", "first_name", "last_name", "doctor_dea", "phone", "fax", "addressline1", "addressline2", "zip", "city", "state", "notes"]);
	data.image_url = result.data;
	$.http.request({
		method : "doctors_update",
		params : {
			data : [{
				doctors : data
			}]
		},
		passthrough : data,
		success : didSuccessDoctor
	});
}

function didSuccessDoctor(result, passthrough) {
	/**
	 * update original object only after
	 * successful api call
	 */
	_.extend(doctor, passthrough);
	doctor.method = "doctors_update";
	
	if(OS_IOS)
	{
		$.photoImg.setImage(doctor.image_url);
	} else {
		var decodedImageURL = '';
		var imageURL = '';
		if(doctor.image_url != null && doctor.image_url != '' && typeof(doctor.image_url) !== 'undefined')
		{
			decodedImageURL = decodeURIComponent(doctor.image_url);
			if(decodedImageURL.indexOf('?') != -1)
			{
				imageURL = decodedImageURL.split('?')[0];
			} else {
				imageURL = decodedImageURL;
			}
		}
	
		$.photoImg.setImage(imageURL);
	}
}

function didClickPhone(e) {
	if(!Titanium.Contacts.hasContactsPermissions()) {
		Titanium.Contacts.requestContactsPermissions(function(result){
			if(result.success) {
				contactsHandler();
			}
			else{
				$.analyticsHandler.trackEvent("Doctors-DoctorDetails", "click", "DeniedContactsPermission");
			}
		});
	} else {
		contactsHandler();
	}
}

function contactsHandler() {
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
		ctrl : "doctorSettings",
		ctrlArguments : {
			isUpdate : true,
			doctor : doctor
		},
		stack : true
	});
}

exports.init = init;
exports.focus = focus;
