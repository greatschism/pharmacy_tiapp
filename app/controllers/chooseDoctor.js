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
			    contentView = $.UI.create("View", {
				apiName : "View",
				classes : ["auto-height","padding-top","padding-bottom"]
			}),
			    orderPickUpLblIcon = $.UI.create("Label", {
				apiName : "Label",
				color:"#F6931E",
				classes : ["small-icon", "left", "width-10", "auto-height"]

			}),
			    titleLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["options", "width-80"]
			}),
			    childLbl = $.UI.create("Label", {
				apiName : "Label",
				text : Alloy.CFG.icons.arrow_right,
				classes : ["iconLabel", "width-10", "auto-height"]
			});

			row.rowId = doctor.id;
			titleLbl.text = doctor.long_name;
			orderPickUpLblIcon.text = Alloy.CFG.icons.user;
			contentView.add(orderPickUpLblIcon);
			contentView.add(titleLbl);
			contentView.add(childLbl);
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
