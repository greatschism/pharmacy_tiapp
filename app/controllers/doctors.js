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
    prescriptionsList;

function init() {
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

	//console.log("111");
	appointments = _result.data.appointment || [];
	//console.log("222");

	

	$.appointmentsSection = uihelper.createTableViewSection($, Alloy.Globals.strings.sectionUpcomingAppointments);
	//$.setReminderSection = uihelper.createTableViewSection($, Alloy.Globals.strings.lblSetupAppointmentReminder,footerView);
	$.doctorsSection = uihelper.createTableViewSection($, Alloy.Globals.strings.sectionMyDoctors);

	if (appointments.length) {

		for (var i in appointments) {
			//console.log(doctors);
			var appointment = appointments[i],
			    doctor = _.findWhere(doctors, {
				id : appointment.doctor_id
			});

			appointment.image_url = doctor.image_url;

			appointment.time = moment(appointment.appointment_time, "YYYY-MM-DD HH:mm").format("MMM Do [at] h:mm A[.]");
			appointment.desc = String.format(msgUpcomingAppointment, doctor.last_name);

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
			    leftImg = $.UI.create("Label", {
				apiName : "Label",
				color : "#F6931E",
				classes : ["small-icon", "icon"]

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

			row.rowId = appointment.appointment_id;
			appointmentLbl.text = appointment.time;
			leftImg.text = Alloy.CFG.icons.calendar;
			doctorLbl.text = appointment.desc;
			// leftImg.image = doctor.thumbnail_url;
			leftImg.bindId = "profile";
			leftImgView.add(leftImg);
			descriptionView.add(appointmentLbl);
			descriptionView.add(doctorLbl);

			contentView.add(leftImgView);
			contentView.add(descriptionView);
			contentView.add(childLbl);
			row.add(contentView);
			$.appointmentsSection.add(row);

		}

	}//if appointment exits
	else {

		var row = $.UI.create("TableViewRow", {
			apiName : "TableViewRow"
		}),
		    contentView = $.UI.create("View", {
			apiName : "View",
			classes : ["padding-top", "auto-height"]
		}),
		    titleLbl = $.UI.create("Label", {
			apiName : "Label",
			text : Alloy.Globals.strings.msgNoAppointment,
			classes : ["fill-width", "paddingLeft", "paddingBottom","paddingTop"]
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
		classes : ["auto-height","hgroup"]
	}),
	setReminderIcon = $.UI.create("Label", {
		apiName : "Label",
		color : "#000000",
		font : Alloy.TSS.list_item_child.font,
		text : Alloy.CFG.icons.plus,
		height : 32,
		width : 32,
		classes : ["paddingLeft","paddingTop","paddingBottom"]
	}),
	setReminderLabel = $.UI.create("Label", {
		apiName : "Label",
		classes : ["paddingTop"],
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

			var doctor = doctors[i],
			    prescriptions = _.where(prescriptionsList, {
				doctor_id : doctor.id
			});

			description = "";
			doctor.short_name = "Dr. " + doctor.last_name;
			doctor.long_name = "Dr. " + doctor.first_name + " " + doctor.last_name;
			doctor.thumbnail_url = "/images/profile.png";

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
				description = String.format(msgHasPrescribedYou, doctor.short_name, prescriptions[0].presc_name);
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
				description = String.format(msgYouHaveNoActiveprescription, doctor.short_name);
			}
			description += ".";

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
				height : 95,
				width : 50,
				classes : ["paddingLeft"]
			}),
			    descriptionView = $.UI.create("View", {
				apiName : "View",
				classes : ["vgroup", "auto-height", "auto-width", "paddingLeft"]

			}),
			    leftImg = $.UI.create("Label", {
				apiName : "Label",
				color : "#F6931E",
				classes : ["small-icon", "icon"]

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
			});

			row.rowId = doctor.id;
			titleLbl.text = doctor.long_name;
			leftImg.text = Alloy.CFG.icons.user;
			prescriptionLbl.text = description;
			// leftImg.image = doctor.thumbnail_url;
			leftImg.bindId = "profile";
			leftImgView.add(leftImg);
			descriptionView.add(titleLbl);
			descriptionView.add(prescriptionLbl);
			contentView.add(leftImgView);
			contentView.add(descriptionView);
			contentView.add(childLbl);
			row.add(contentView);
			$.doctorsSection.add(row);

		}

	} else {

		var row = $.UI.create("TableViewRow", {
			apiName : "TableViewRow"
		}),
		    contentView = $.UI.create("View", {
			apiName : "View",
			classes : ["padding-top", "auto-height"]
		}),
		    titleLbl = $.UI.create("Label", {
			apiName : "Label",
			text : Alloy.Globals.strings.msgNoDoctor,
			classes : ["fill-width", "padding-left", "padding-bottom"]
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
		classes : ["auto-height","hgroup"]
	}),
		addDoctorIcon = $.UI.create("Label", {
		apiName : "Label",
		color : "#000000",
		font : Alloy.TSS.list_item_child.font,
		text : Alloy.CFG.icons.plus,
		height : 32,
		width : 32,
		classes : ["paddingLeft","paddingTop","paddingBottom"]
	}),
	    addDoctorLabel = $.UI.create("Label", {
		apiName : "Label",
		classes : ["paddingTop"],
		text : Alloy.Globals.strings.btnAddAnotherDoctor,
	});

	mydocFooterView.add(addDoctorIcon);
	mydocFooterView.add(addDoctorLabel);
	mydocFooterView.addEventListener("click", didClickAddDoctor);
	rowAddDoc.add(mydocFooterView);
	rowAddDoc.rowId = "add doctor";
	$.doctorsSection.add(rowAddDoc);
	
	$.tableView.data = [$.appointmentsSection,  $.doctorsSection];
	app.navigator.hideLoader();

}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e) {
	
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
					//we may create image view with contents from image variable
					//or simply save path to image
					//$.profileImg.image = image;
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

function didItemClick(e) {
	var id = e.row.rowId,
	    section = e.section,
	    bindId = e.source.bindId;
	if (section == $.appointmentsSection) {

		if (!(id == "no appointment")) {
			app.navigator.open({
				stack : true,
				titleid : "titleEditReminder",
				ctrl : "chooseTime",
				ctrlArguments : {
					doctorId : id,
					edit : true
				}
			});
		}
	} else {
		//doctors
		if (bindId == "profile") {
			$.photoDialog.doctorId = id;
			//console.log(doctorId);
			$.photoDialog.show();
		} else if (!(id == "no doctor") && !(id== "add doctor")) {
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
		ctrl : "addDoctor"
	});
}

function didClickOption(e) {
	logger.i(e);
}

function openCamera() {

}

function openGallery() {

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

function terminate() {
	$.destroy();
}

function didAndroidBack() {
	return $.toggleMenu.hide();
}

exports.init = init;
exports.terminate = terminate;
exports.androidback = didAndroidBack;
