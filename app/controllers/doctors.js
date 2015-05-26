var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    logger = require("logger"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    msgHasPrescribedYou = Alloy.Globals.strings.msgHasPrescribedYou,
    msgYouHaveNoActiveprescription = Alloy.Globals.strings.msgYouHaveNoActiveprescription,
    strAnd = Alloy.Globals.strings.strAnd,
    strMore = Alloy.Globals.strings.strMore,
    doctors,
    prescriptionsList,
    parentView,
    sourceElement,
    profileImg,
    noOfDoctors = 0,
    clickedDoctorRow = 0;

function init() {
	Alloy.Models.doctor.on("change:doctor_add", invokeAPI);
	Alloy.Models.doctor.on("change:doctor_update", invokeAPI);
	Alloy.Models.doctor.on("change:doctor_remove", invokeAPI);
	invokeAPI();
}

function invokeAPI() {
	http.request({
		method : "DOCTORS_LIST",
		data : {
			data : [{
				doctors : {

				}
			}]
		},
		success : getPrescriptions
	});
}

function getPrescriptions(result) {
	doctors = result.data.doctors || [];
	//console.log(doctors);
	http.request({
		method : "PRESCRIPTIONS_LIST",
		data : {
			data : [{
				prescriptions : {
					id : null,
					sort_order_preferences : "By Name",
					prescription_display_status : "active"
				}
			}]
		},
		success : didSuccess
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

function didSuccess(result) {

	prescriptionsList = result.data.prescriptions || [];
	//console.log(prescriptionsList);
	addDoctorIcon = $.UI.create("Label", {
		apiName : "Label",
		height : 32,
		width : 32,
		classes : ["additionIcon", "small-icon", "right"]
	});
	addDoctorIcon.addEventListener("click", didClickAddDoctor);

	$.doctorsSection = uihelper.createTableViewSection($, Alloy.Globals.strings.sectionDoctors, null, addDoctorIcon);

	if (doctors.length) {

		for (var i in doctors) {

			doctor = doctors[i];

			noOfDoctors++;
			var row = createDoctorRow(doctor, prescriptionsList);
			$.doctorsSection.add(row);

		}

	} else {

		var noDoctorRow = createNoDoctorRow();
		$.doctorsSection.add(noDoctorRow);
	}

	$.tableView.data = [$.doctorsSection];
	app.navigator.hideLoader();

}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e) {

}

function didItemClick(e) {
	var id = e.row.rowId;
	console.log(id);
	console.log(e.index);
	if (!(id == "no doctor")) {

		var doctor = doctors[e.index];
		clickedDoctorRow = e.index;
		var prescriptions = [];

		if (prescriptionsList.length) {
			// prescriptions = _.where(prescriptionsList, {
			// id : prescriptionsList.doctor_id
			// });
			for ( i = 0; i < prescriptionsList.length; i++) {
				if (prescriptionsList[i].doctor_id === id) {
					prescriptions[i] = prescriptionsList[i];
				}
			}

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

function createDoctorRow(doctor, prescriptionsList) {

	description = "";
	doctor.short_name = "Dr. " + doctor.last_name;
	doctor.long_name = "Dr. " + doctor.first_name + " " + doctor.last_name;
	doctor.thumbnail_url = "/images/profile.png";

	var prescriptions = _.where(prescriptionsList, {
		doctor_id : doctor.id
	});
	len = prescriptions.length;
	if (doctor.doctor_type == "manual") {
		description = Alloy.Globals.strings.msgManuallyAddedByYou;
	} else {
		if (len) {

			/* Description format
			* 0 drugs You have no active prescriptions associated with Dr. [LASTNAME]
			* 1 drug Dr.[NAME] has prescribed you [DRUGNAME].
			* 2 drugs Dr. [LASTNAME] has prescribed you [DRUGNAME] and [DRUGNAME].
			* 3 drugs Dr. [LASTNAME] has prescribed you [DRUGNAME], [DRUGNAME] and [DRUGNAME].
			* 4 or more Dr. [LASTNAME] has prescribed you [DRUGNAME], [DRUGNAME], and [X] more.
			*/

			//When len is > 0
			description = msgHasPrescribedYou + " " + utilities.ucword(prescriptions[0].presc_name);
			if (len > 1) {
				//when > 1 and switch case used for defining when it is == 2, ==3 and > 3
				switch(len) {
				case 2:
					description += " " + strAnd + " " + utilities.ucword(prescriptions[1].presc_name);
					break;
				case 3:
					description += ", " + utilities.ucword(prescriptions[1].presc_name) + " " + strAnd + " " + utilities.ucword(prescriptions[2].presc_name);
					break;
				default:
					description += ", " + utilities.ucword(prescriptions[1].presc_name) + " " + strAnd + " [" + (len - 2) + "] " + strMore;
				}
			}
		} else {
			//When len is 0
			description = msgYouHaveNoActiveprescription;
		}
	}
	//description += ".";

	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),
	    contentView = $.UI.create("View", {
		apiName : "View",
		horizontalWrap : "false",
		classes : ["auto-height", "left"]
	}),
	    leftImgView = $.UI.create("View", {
		apiName : "View",
		classes : ["padding-left", "viewSize"]
	}),
	    descriptionView = $.UI.create("View", {
		apiName : "View",
		left : 84,
		classes : ["vgroup", "auto-height", "auto-width", "padding-bottom", "padding-top"]

	}),
	    leftIconLabel = $.UI.create("Label", {
		apiName : "Label",
		color : "#F6931E",
		classes : ["small-icon", "doctorIcon", "left"]

	}),
	    titleLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["h2", "left", "width-85"]
	}),
	    prescriptionLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["h3", "left", "width-85"]
	}),
	    childLbl = $.UI.create("Label", {
		apiName : "Label",
		text : Alloy.CFG.icons.arrow_right,
		classes : ["iconLabel", "padding-right"]
	}),
	    profileImg = $.UI.create("ImageView", {
		apiName : "ImageView",
		width : "55",
		borderColor : "#000000",
	});

	row.rowId = doctor.id;
	titleLbl.text = utilities.ucword(doctor.long_name);
	prescriptionLbl.text = description;
	// leftIconLabel.image = doctor.thumbnail_url;
	if (!_.isEmpty(doctor.image_url)) {
		profileImg.image = doctor.image_url;
		leftImgView.add(profileImg);
	} else {
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

function createNoDoctorRow() {
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

	return row;

}

function terminate() {
	$.destroy();
	Alloy.Models.doctor.off("change:doctor_add", invokeAPI);
	Alloy.Models.doctor.off("change:doctor_update", invokeAPI);
	Alloy.Models.doctor.off("change:doctor_remove", invokeAPI);
}

function didAddDoctor() {
	var doctor = Alloy.Models.doctor.get("doctor_add");
	var row = createDoctorRow(doctor, prescriptionsList);

	doctors.push(doctor);

	doctors = _.sortBy(doctors, 'last_name');

	var position = doctors.map(function(doc) {//get index of the doctor from the sorted list
		return doc.id;
	}).indexOf(doctor.id);

	if (noOfDoctors == 0)//1st doctor added
		$.tableView.updateRow(0, row);
	// 2 since 0th row- no appointment and 1st row is add appointment
	
else if (position == 0) {//if doctors exist and new doctor is 1st in the sorted list (if after used, row comes in appointment section)
		$.tableView.insertRowBefore(0, row);
	} else
		$.tableView.insertRowAfter(position - 1, row);

	noOfDoctors++;
}

function didEditDoctor() {

	var newDoctor = Alloy.Models.doctor.get("doctor_update");
	var oldDoctor = _.findWhere(doctors, {
		id : newDoctor.id
	});

	var updatedDoctor = _.extend(oldDoctor, newDoctor);

	var row = createDoctorRow(newDoctor, prescriptionsList);

	var position = doctors.map(function(doc) {//get index of the doctor from the sorted list
		return doc.id;
	}).indexOf(newDoctor.id);

	$.tableView.updateRow(position, row);

}

function didRemoveDoctor() {
	var doctor = Alloy.Models.doctor.get("doctor_remove");

	if (noOfDoctors == 1) {
		var row = createNoDoctorRow();
		$.tableView.updateRow(clickedDoctorRow, row);
	} else
		$.tableView.deleteRow(clickedDoctorRow);

	var position = doctors.map(function(doc) {//get index of the doctor tobe deleted
		return doc.id;
	}).indexOf(doctor.id);

	doctors.splice(position, 1);

	noOfDoctors--;

}

function didAndroidBack() {
	return $.toggleMenu.hide();
}

exports.init = init;
exports.terminate = terminate;
exports.androidback = didAndroidBack;

