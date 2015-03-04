var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    logger = require("logger"),
    http = require("requestwrapper"),
    dialog = require("dialog"),
    uihelper = require("uihelper"),
    msgHasPrescribedYou = Alloy.Globals.strings.msgHasPrescribedYou,
    msgYouHaveNoActiveprescription = Alloy.Globals.strings.msgYouHaveNoActiveprescription,
    msgUpcomingAppointment = Alloy.Globals.strings.msgYouHaveUpcomingAppointmentWith,
    strAnd = Alloy.Globals.strings.strAnd,
    strMore = Alloy.Globals.strings.strMore,
    doctors,
    appointments,
    prescriptionsList,
    parentView,
    sourceElement,
    profileImg,
    noOfAppointment = 0,
    noOfDoctors = 0;

function init() {

	Alloy.Models.doctor.on("change:doctor_add", didAddDoctor);
	Alloy.Models.doctor.on("change:appointment_add", didAddAppointment);
	Alloy.Models.doctor.on("change:appointment_update", didEditAppointment);
	Alloy.Models.doctor.on("change:appointment_delete", didDeleteAppointment);

	http.request({
		method : "DOCTORS_LIST",
		success : getPrescriptions
	});
}

function getPrescriptions(_result) {
	doctors = _result.data.doctors || [];
	http.request({
		method : "PRESCRIPTIONS_LIST",
		success : didSuccess
	});
}

function didSuccess(_result) {
	prescriptionsList = _result.data.prescriptions || [];

	//console.log(prescriptionsList);
	http.request({

		method : "APPOINTMENTS_GET",
		success : didReceiveAppointments
	});
}

function firstToUpperCase(str) {
	var strTemp = str.split(' ');
	for (var i = 0; i < strTemp.length; i++) {
		strTemp[i] = strTemp[i].substr(0, 1).toUpperCase() + strTemp[i].substr(1).toLowerCase();
	};
	str = strTemp.join(" ");
	return str;
}

function didReceiveAppointments(_result) {

	appointments = _result.data.appointment || [];
	$.appointmentsSection = uihelper.createTableViewSection($, Alloy.Globals.strings.sectionUpcomingAppointments);
	$.doctorsSection = uihelper.createTableViewSection($, Alloy.Globals.strings.sectionMyDoctors);

	if (appointments.length) {

		for (var i in appointments) {
			var appointment = appointments[i],
			    doctor = _.findWhere(doctors, {
				id : appointment.doctor_id
			});
			noOfAppointment++;
			var row = createAppointmentRow(doctor, appointment);

			$.appointmentsSection.add(row);

		}

	} else {

		var row = $.UI.create("TableViewRow", {
			apiName : "TableViewRow"
		}),
		    contentView = $.UI.create("View", {
			apiName : "View",
			classes : ["auto-height", "paddingTop"]
		}),
		    titleLbl = $.UI.create("Label", {
			apiName : "Label",
			text : Alloy.Globals.strings.msgNoAppointment,
			classes : ["paddingBottom"]
		});

		contentView.add(titleLbl);
		row.add(contentView);
		row.rowId = "no appointment";
		$.appointmentsSection.add(row);
	}

	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),
	    appointmentFooterView = $.UI.create("View", {
		apiName : "View",
		horizontalWrap : "false",
		classes : ["auto-height", "hgroup"]
	}),
	    setReminderIcon = $.UI.create("Label", {
		apiName : "Label",
		height : 32,
		width : 32,
		classes : ["paddingLeft", "paddingTop", "paddingBottom", "additionIcon", "small-icon"]
	}),
	    setReminderLabel = $.UI.create("Label", {
		apiName : "Label",
		classes : ["width-90", "paddingLeft", "auto-height"],
		text : Alloy.Globals.strings.lblSetupAppointmentReminder,
	});
	appointmentFooterView.add(setReminderIcon);
	appointmentFooterView.add(setReminderLabel);
	appointmentFooterView.addEventListener("click", didClickSetAppointment);
	row.add(appointmentFooterView);
	row.rowId = "set appointment";
	$.appointmentsSection.add(row);

	if (doctors.length) {

		console.log("doctors found");

		for (var i in doctors) {

			var doctor = doctors[i];
			noOfDoctors++;
			var row = createDoctorRow(doctor, prescriptionsList);
			$.doctorsSection.add(row);

		}

	} else {

		var row = $.UI.create("TableViewRow", {
			apiName : "TableViewRow"
		}),
		    contentView = $.UI.create("View", {
			apiName : "View",
			horizontalWrap : "false",
			classes : ["auto-height", "paddingTop"]
		}),
		    titleLbl = $.UI.create("Label", {
			apiName : "Label",
			text : Alloy.Globals.strings.msgNoDoctor,
			classes : ["paddingBottom"]
		});

		contentView.add(titleLbl);
		row.add(contentView);
		row.rowId = "no doctor";
		$.doctorsSection.add(row);
	}

	var rowAddDoc = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),
	    mydocFooterView = $.UI.create("View", {
		apiName : "View",
		horizontalWrap : "false",
		classes : ["auto-height", "hgroup"]
	}),
	    addDoctorIcon = $.UI.create("Label", {
		apiName : "Label",
		height : 32,
		width : 32,
		classes : ["paddingLeft", "paddingTop", "paddingBottom", "additionIcon", "small-icon"]
	}),
	    addDoctorLabel = $.UI.create("Label", {
		apiName : "Label",
		classes : ["width-90", "paddingLeft", "auto-height"],
		text : Alloy.Globals.strings.btnAddAnotherDoctor,
	});

	mydocFooterView.add(addDoctorIcon);
	mydocFooterView.add(addDoctorLabel);
	mydocFooterView.addEventListener("click", didClickAddDoctor);
	rowAddDoc.add(mydocFooterView);
	rowAddDoc.rowId = "add doctor";
	$.doctorsSection.add(rowAddDoc);

	$.tableView.data = [$.appointmentsSection, $.doctorsSection];
	app.navigator.hideLoader();

}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e) {

}

function didItemClick(e) {
	var id = e.row.rowId,
	    section = e.section,
	    bindId = e.source.bindId;
	if (section == $.appointmentsSection) {

		if (!(id == "no appointment") && !(id == "set appointment")) {
			
			var appointment = _.findWhere(appointments, {
				appointment_id : id
			});
			console.log(appointment);
			var doctor = _.findWhere(doctors, {
				id : appointment.doctor_id
			});

			console.log(e.index);
			
			app.navigator.open({
				stack : true,
				titleid : "titleEditReminder",
				ctrl : "chooseTime",
				ctrlArguments : {
					doctorId : doctor.id,
					short_name : doctor.short_name,
					appointment : appointment,
					edit : true,
					index: e.index
				}
			});
		}
	} else {
		//doctors
		if (bindId == "profile") {

			$.photoDialog.doctorId = id;
			sourceElement = e.source;
			parentView = e.source.parent;
			$.photoDialog.show();

		} else if (!(id == "no doctor") && !(id == "add doctor")) {
			
			var doctor = _.findWhere(doctors, {
				id : String(id)
			});

			var prescriptions = [];
			if (prescriptionsList.length) {
				prescriptions = _.where(prescriptionsList, {
					doctor_id : doctor.id
				});

			}
			app.navigator.open({
				stack : true,
				title : doctor.short_name,
				ctrl : "doctorDetails",
				ctrlArguments : {
					doctor : doctor,
					prescriptions : prescriptions
				}
			});

		}

	}
}

function didClickAddDoctor(e) {
	app.navigator.open({
		stack : true,
		titleid : "titleAddDoctor",
		ctrl : "addDoctor",
		ctrlArguments : {
			edit : "false"
		}

	});
}

function didClickOption(e) {

	if (sourceElement.getApiName() == "Ti.UI.Label") {
		profileImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			height : 90,
			width : 50,
			borderColor : "#000000",
			classes : ["left"]

		});
	}

	if (e.index == 1) {
		//then we are getting image from camera
		Titanium.Media.showCamera({
			//we got something
			success : function(event) {
				//getting media
				var image = event.media;

				//checking if it is photo
				if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
					//we may create image view with contents from image variable
					//or simply save path to image

					if (sourceElement.getApiName() == "Ti.UI.Label") {
						parentView.removeAllChildren();
						profileImg.image = image;
						parentView.add(profileImg);
					} else {
						sourceElement.image = image;
					}

					Ti.App.Properties.setString("image", image.nativePath);
				}
			},
			cancel : function() {
				//do something if user cancels operation
			},
			error : function(error) {
				//error happend, create alert
				//var a = Titanium.UI.createAlertDialog({title:'Camera'});
				//set message
				if (error.code == Titanium.Media.NO_CAMERA) {
					alert('Device does not have camera');
				} else {
					alert('Unexpected error: ' + error.code);
				}

				// show alert
				// a.show();
			},
			allowImageEditing : true,
			saveToPhotoGallery : true
		});
	} else if (e.index == 0) {
		//obtain an image from the gallery
		Titanium.Media.openPhotoGallery({
			success : function(event) {
				//getting media
				var image = event.media;
				// set image view

				//checking if it is photo
				if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {

					if (sourceElement.getApiName() == "Ti.UI.Label") {
						parentView.removeAllChildren();
						profileImg.image = image;
						parentView.add(profileImg);
					} else {
						sourceElement.image = image;
					}

					Ti.App.Properties.setString("image", image.nativePath);
				}
			},
			cancel : function() {
				//user cancelled the action fron within
				//the photo gallery
			}
		});
	} else {
		//cancel was tapped
		//user opted not to choose a photo
	}

}

function didClickSetAppointment(e) {
	//Alloy.Collections.doctors.reset(doctors);
	if (doctors.length) {
		app.navigator.open({
			stack : true,
			titleid : "titleChooseDoctor",
			ctrl : "chooseDoctor",
			ctrlArguments : {
				doctors : doctors
			}
		});
	}
}

function createAppointmentRow(_doctor, _appointment) {
	_appointment.time = moment(_appointment.appointment_date, "YYYY-MM-DD").format("MMM Do") + " at " + _appointment.appointment_hour + ":" + _appointment.appointment_minute + " " + _appointment.appointment_meridiem;
	_appointment.desc = String.format(msgUpcomingAppointment, _doctor.last_name);

	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),
	    contentView = $.UI.create("View", {
		apiName : "View",
		horizontalWrap : "false",
		classes : ["hgroup", "auto-height"]
	}),
	    leftImgView = $.UI.create("View", {
		apiName : "View",
		height : 32,
		width : 32,
		classes : ["paddingLeft"]
	}),
	    descriptionView = $.UI.create("View", {
		apiName : "View",
		classes : ["vgroup", "auto-height", "auto-width", "paddingLeft", "paddingTop", "paddingBottom"]

	}),
	    leftIconLabel = $.UI.create("Label", {
		apiName : "Label",
		color : "#F6931E",
		classes : ["small-icon", "calenderIcon"]

	}),
	    appointmentLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["h1", "left", "width-90"]
	}),
	    doctorLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["h2", "left", "width-90"]
	}),
	    childLbl = $.UI.create("Label", {
		apiName : "Label",
		text : Alloy.CFG.icons.arrow_right,
		classes : ["iconLabel", "paddingRight"]
	});

	row.rowId = _appointment.appointment_id;
	appointmentLbl.text = _appointment.time;
	doctorLbl.text = _appointment.desc;
	// leftIconLabel.image = doctor.thumbnail_url;
	leftIconLabel.bindId = "profile";
	leftImgView.add(leftIconLabel);
	descriptionView.add(appointmentLbl);
	descriptionView.add(doctorLbl);

	contentView.add(leftImgView);
	contentView.add(descriptionView);
	contentView.add(childLbl);
	row.add(contentView);

	return row;

}

function createDoctorRow(_doctor, _prescriptionsList) {

	description = "";
	_doctor.short_name = "Dr. " + _doctor.last_name;
	_doctor.long_name = "Dr. " + _doctor.first_name + " " + _doctor.last_name;
	_doctor.thumbnail_url = "/images/profile.png";

	var prescriptions = _.where(_prescriptionsList, {
		doctor_id : _doctor.id
	});

	/* Description format
	 * 0 drugs You have no active prescriptions associated with Dr. [LASTNAME]
	 * 1 drug Dr.[NAME] has prescribed you [DRUGNAME].
	 * 2 drugs Dr. [LASTNAME] has prescribed you [DRUGNAME] and [DRUGNAME].
	 * 3 drugs Dr. [LASTNAME] has prescribed you [DRUGNAME], [DRUGNAME] and [DRUGNAME].
	 * 4 or more Dr. [LASTNAME] has prescribed you [DRUGNAME], [DRUGNAME], and [X] more.
	 */

	len = prescriptions.length;
	if (len) {

		//When len is > 0
		description = String.format(msgHasPrescribedYou, _doctor.short_name, prescriptions[0].presc_name);
		if (len > 1) {
			//when > 1 and switch case used for defining when it is == 2, ==3 and > 3
			switch(len) {
			case 2:
				description += " " + strAnd + " " + prescriptions[1].presc_name;
				break;
			case 3:
				description += ", " + prescriptions[1].presc_name + " " + strAnd + " " + prescriptions[2].presc_name;
				break;
			default:
				description += ", " + prescriptions[1].presc_name + " " + strAnd + " [" + (len - 2) + "] " + strMore;
			}
		}
	} else {
		//When len is 0
		description = String.format(msgYouHaveNoActiveprescription, _doctor.short_name);
	}
	description += ".";

	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),
	    contentView = $.UI.create("View", {
		apiName : "View",
		horizontalWrap : "false",
		classes : ["hgroup", "auto-height", "left"]
	}),
	    leftImgView = $.UI.create("View", {
		apiName : "View",
		height : 95,
		width : 50,
		classes : ["paddingLeft"]
	}),
	    descriptionView = $.UI.create("View", {
		apiName : "View",
		classes : ["vgroup", "auto-height", "auto-width", "paddingLeft"]

	}),
	    leftIconLabel = $.UI.create("Label", {
		apiName : "Label",
		color : "#F6931E",
		classes : ["small-icon", "doctorIcon", "left"]

	}),
	    titleLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["h2", "left", "width-90"]
	}),
	    prescriptionLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["h3", "left", "width-90"]
	}),
	    childLbl = $.UI.create("Label", {
		apiName : "Label",
		text : Alloy.CFG.icons.arrow_right,
		classes : ["iconLabel", "paddingRight"]
	}),
	    profileImg = $.UI.create("ImageView", {
		apiName : "ImageView",
		height : "60",
		width : "50",
		borderColor : "#000000",
	});

	row.rowId = _doctor.id;
	titleLbl.text = _doctor.long_name;
	prescriptionLbl.text = description;
	// leftIconLabel.image = _doctor.thumbnail_url;
	if (_doctor.image_url.length) {
		//profileImg.image=_doctor.image_url;
		profileImg.bindId = "profile";
		leftImgView.add(profileImg);
	} else {
		leftIconLabel.bindId = "profile";
		leftImgView.add(leftIconLabel);
	}

	descriptionView.add(titleLbl);
	descriptionView.add(prescriptionLbl);
	contentView.add(leftImgView);
	contentView.add(descriptionView);
	contentView.add(childLbl);
	row.add(contentView);

	return row;
}

function terminate() {
	$.destroy();
	Alloy.Models.doctor.off("change:doctor_add", didAddDoctor);
	Alloy.Models.doctor.off("change:appointment_add", didAddAppointment);
	Alloy.Models.doctor.off("change:appointment_update", didEditAppointment);
	Alloy.Models.doctor.off("change:appointment_delete", didDeleteAppointment);
}

function didAddDoctor() {
	var doctor = Alloy.Models.doctor.get("doctor_add");
	var row = createDoctorRow(doctor, prescriptionsList);
	console.log(doctor);
	doctors.push(doctor);
	$.tableView.insertRowAfter(noOfDoctors + noOfAppointment, row);
	noOfDoctors++;
}

function didAddAppointment() {

	var newAppointment = Alloy.Models.doctor.get("appointment_add");

	var doctor = _.findWhere(doctors, {
		id : newAppointment.doctor_id
	});

	var row = createAppointmentRow(doctor, newAppointment);
	appointments.push(newAppointment);
	$.tableView.insertRowAfter(noOfAppointment - 1, row);
	noOfAppointment++;

}

function didEditAppointment() {
	var newAppointment = Alloy.Models.doctor.get("appointment_update");
	/*var oldAppointment=_.findWhere(appointments, {
		id : newAppointment.doctor_id
	});
	extend*/
	//console.log(ap);
	//console.log("alskhdaklsugdjlakshndasd");

}

function didDeleteAppointment(){
	var rowId = Alloy.Models.doctor.get("appointment_delete");
	//console.log("delete");
	//console.log(rowId.index);
	$.tableView.deleteRow(rowId.index);
}

function didAndroidBack() {
	return $.toggleMenu.hide();
}

exports.init = init;
exports.terminate = terminate;
exports.androidback = didAndroidBack;

