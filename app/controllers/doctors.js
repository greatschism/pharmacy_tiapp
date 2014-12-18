var args = arguments[0] || {},
    app = require("core"),
    moment = require("alloy/moment"),
    http = require("httpwrapper"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    msgHasPrescribedYou = Alloy.Globals.strings.msgHasPrescribedYou,
    msgYouHaveNoActiveprescription = Alloy.Globals.strings.msgYouHaveNoActiveprescription,
    msgUpcomingAppointment = Alloy.Globals.strings.msgYouHaveUpcomingAppointmentWith,
    strAnd = Alloy.Globals.strings.strAnd,
    strMore = Alloy.Globals.strings.strMore,
    doctors,
    appointments;

function init() {
	http.request({
		path : "doctors/list",
		keepBlook : true,
		dataTransform : false,
		format : "JSON",
		data : {},
		success : didSuccess
	});
}

function didSuccess(result) {
	doctors = result.doctor_details;
	http.request({
		path : "appointments/get",
		keepBlook : true,
		dataTransform : false,
		format : "JSON",
		data : {},
		success : didReceiveAppointments
	});
}

function didReceiveAppointments(result) {

	appointments = result.data.appointment;

	var footerView = $.UI.create("View", {
		apiName : "View",
		classes : ["bg-success"]
	}),
	    containerView = $.UI.create("View", {
		apiName : "View",
		classes : ["auto", "hgroup", "touch-disabled"]
	}),
	    addIcon = $.UI.create("Label", {
		apiName : "Label",
		classes : ["font-icon-tiny", "fg-primary", "touch-disabled"],
		id : "addIcon"
	}),
	    addLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["padding-left", "h4", "fg-primary", "touch-disabled"],
		id : "addLbl"
	});
	footerView.height = Alloy._content_height;
	containerView.add(addIcon);
	containerView.add(addLbl);
	footerView.add(containerView);
	footerView.addEventListener("click", didClickSetAppointment);

	$.appointmentsSection = utilities.createTableViewSection({
		title : Alloy.Globals.strings.sectionUpcomingAppointments
	}, footerView);
	$.doctorsSection = utilities.createTableViewSection({
		title : Alloy.Globals.strings.sectionMyDoctors
	});

	for (var i in doctors) {

		var doctor = doctors[i],
		    prescriptions = doctor.prescriptions,
		    description = "";
		doctor.short_name = "Dr. " + doctor.last_name;
		doctor.long_name = "Dr. " + doctor.first_name + " " + doctor.last_name;
		doctor.thumbnail_url = "/images/profile.png";

		/**
		 * Description format
		 * 0 drugs You have no active prescriptions associated with Dr. [LASTNAME]
		 * 1 drug Dr.[NAME] has prescribed you [DRUGNAME].
		 * 2 drugs Dr. [LASTNAME] has prescribed you [DRUGNAME] and [DRUGNAME].
		 * 3 drugs Dr. [LASTNAME] has prescribed you [DRUGNAME], [DRUGNAME] and [DRUGNAME].
		 * 4 or more Dr. [LASTNAME] has prescribed you [DRUGNAME], [DRUGNAME], and [X] more.
		 */
		len = prescriptions.length;
		if (len) {
			//When len is > 0
			description = String.format(msgHasPrescribedYou, doctor.short_name, prescriptions[0].prescription_name);
			if (len > 1) {
				//when > 1 and switch case used for defining when it is == 2, ==3 and > 3
				switch(len) {
				case 2:
					description += " " + strAnd + " " + prescriptions[1].prescription_name;
					break;
				case 3:
					description += ", " + prescriptions[1].prescription_name + " " + strAnd + " " + prescriptions[2].prescription_name;
					break;
				default:
					description += ", " + prescriptions[1].prescription_name + " " + strAnd + " [" + (len - 2) + "] " + strMore;
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
		    padView = $.UI.create("View", {
			apiName : "View",
			classes : ["list-item-view-with-child"]
		}),
		    childLbl = $.UI.create("Label", {
			apiName : "Label",
			classes : ["list-item-child"]
		}),
		    leftImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			classes : ["list-item-left-image"]
		}),
		    contentView = $.UI.create("View", {
			apiName : "View",
			classes : ["list-item-content-after-image", "vgroup"]
		}),
		    titleLbl = $.UI.create("Label", {
			apiName : "Label",
			classes : ["left", "h3", "fg-secondary"]
		}),
		    subtitleLbl = $.UI.create("Label", {
			apiName : "Label",
			classes : ["left", "h5", "fg-quaternary", "multi-line"]
		});
		row.rowId = doctor.doctor_id;
		titleLbl.text = doctor.long_name;
		subtitleLbl.text = description;
		leftImg.image = doctor.thumbnail_url;
		leftImg.bindId = "profile";
		contentView.add(titleLbl);
		contentView.add(subtitleLbl);
		padView.add(leftImg);
		padView.add(contentView);
		row.add(padView);
		row.add(childLbl);
		$.doctorsSection.add(row);
	}

	for (var i in appointments) {

		var appointment = appointments[i],
		    doctor = _.findWhere(doctors, {
			doctor_id : appointment.doctor_id
		});
		appointment.thumbnail_url = doctor.thumbnail_url;
		appointment.time = moment(appointment.appointment_time, "YYYY-MM-DD HH:mm").format("MMMM Do [at] h:mm A[.]");
		appointment.desc = String.format(msgUpcomingAppointment, doctor.short_name);

		var row = $.UI.create("TableViewRow", {
			apiName : "TableViewRow"
		}),
		    padView = $.UI.create("View", {
			apiName : "View",
			classes : ["list-item-view-with-child"]
		}),
		    childLbl = $.UI.create("Label", {
			apiName : "Label",
			classes : ["list-item-child"]
		}),
		    leftImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			classes : ["list-item-left-image"]
		}),
		    contentView = $.UI.create("View", {
			apiName : "View",
			classes : ["list-item-content-after-image", "vgroup"]
		}),
		    titleLbl = $.UI.create("Label", {
			apiName : "Label",
			classes : ["h3", "multi-line"]
		});
		if (OS_IOS) {
			var text = appointment.desc + appointment.time;
			titleLbl.applyProperties({
				left : 0,
				attributedString : Ti.UI.iOS.createAttributedString({
					text : text,
					attributes : [{
						type : Ti.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
						value : Alloy._fg_secondary,
						range : [0, text.length]
					}, {
						type : Ti.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
						value : Alloy._fg_tertiary,
						range : [appointment.desc.length, appointment.time.length]
					}, {
						type : Ti.UI.iOS.ATTRIBUTE_FONT,
						value : {
							fontFamily : Alloy.CFG.fonts.medium,
							fontSize : Alloy._typo_h3.fontSize
						},
						range : [appointment.desc.length, appointment.time.length]
					}]
				})
			});
		} else {
			titleLbl.html = appointment.desc + " <font color=\"" + Alloy._fg_tertiary + "\"><b>" + appointment.time + "</b></font>";
		}
		row.rowId = appointment.appointment_id;
		leftImg.image = doctor.thumbnail_url;
		leftImg.bindId = "profile";
		contentView.add(titleLbl);
		padView.add(leftImg);
		padView.add(contentView);
		row.add(padView);
		row.add(childLbl);
		$.appointmentsSection.add(row);
	}

	$.tableView.data = [$.appointmentsSection, $.doctorsSection];
	app.navigator.hideLoader();
}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e) {
	console.log(e);
}

function didItemClick(e) {
	var doctorId = e.row.rowId,
	    section = e.section,
	    bindId = e.source.bindId;
	if (section == $.appointmentsSection) {
		app.navigator.open({
			stack : true,
			titleid : "titleEditReminder",
			ctrl : "chooseTime",
			ctrlArguments : {
				doctorId : doctorId,
				edit : true
			}
		});
	} else {
		//doctors
		if (bindId == "profile") {
			$.photoDialog.doctorId = doctorId;
			$.photoDialog.show();
		} else {
			var doctor = _.findWhere(doctors, {
				doctor_id : String(doctorId)
			});
			app.navigator.open({
				stack : true,
				title : doctor.short_name,
				ctrl : "doctorDetails",
				ctrlArguments : {
					doctor : doctor
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
	console.log(e);
}

function openCamera() {

}

function openGallery() {

}

function didClickSetAppointment(e) {
	Alloy.Collections.doctors.reset(doctors);
	app.navigator.open({
		stack : true,
		titleid : "titleChooseDoctor",
		ctrl : "chooseDoctor"
	});
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
