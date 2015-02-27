var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper");

function init() {
	//	Alloy.Collections.doctors.trigger("reset");

	
	$.doctorsList = uihelper.createTableViewSection($, Alloy.Globals.strings.lblWhichDoctorYouHaveAppointment);
	
	if (args.doctors) {
		var doctors=args.doctors;
		console.log("found docs");
		for (var i in doctors) {
			var doctor = doctors[i];
			doctor.long_name = "Dr. " + doctor.first_name + " " + doctor.last_name;
			console.log(doctor);
			var row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),
			    contentView =  $.UI.create("View", {
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
				classes : ["auto-height", "auto-width", "paddingLeft", "paddingTop", "paddingBottom"]

			}),
			    leftImg = $.UI.create("Label", {
				apiName : "Label",
				color : "#F6931E",
				classes : ["small-icon", "doctorIcon"]

			}),
			    titleLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["h1", "left", "width-90","paddingLeft","auto-height"]
			});
			row.rowId = doctor.id;
			titleLbl.text = doctor.long_name;
			leftImgView.add(leftImg);
			//descriptionView.add(titleLbl);
			contentView.add(leftImgView);
			contentView.add(titleLbl);
			row.add(contentView);
			$.doctorsList.add(row);
			

		}
	}

	$.tableView.data = [$.doctorsList];
}

function didItemClick(e) {
	var doctorId = e.row.rowId;
	var doctor=_.findWhere(args.doctors, {
				id : String(doctorId)
			});
			console.log(doctor);
	app.navigator.open({
		stack : true,
		titleid : "titleChooseTime",
		ctrl : "chooseTime",
		ctrlArguments : {
			doctorId : doctorId,
			short_name: doctor.short_name
		}
	});
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
