var args = arguments[0] || {},
    App = require("core");

function init() {
	Alloy.Collections.doctors.reset([{
		id : 1,
		image : "",
		fname : "Jane",
		lname : "Doe",
		prescriptions : [{
			name : "Omeprazole"
		}, {
			name : "Omeprazole 500mg"
		}, {
			name : "Omeprazole 500mg"
		}, {
			name : "Omeprazole 500mg"
		}, {
			name : "Omeprazole 500mg"
		}]
	}, {
		id : 2,
		image : "/images/profile.png",
		fname : "Herman",
		lname : "Melville",
		prescriptions : [{
			name : "Omeprazole"
		}]
	}, {
		id : 3,
		image : "/images/profile.png",
		fname : "Hareesh",
		lname : "Khurana",
		prescriptions : []
	}]);
}

function transformDoctor(model) {
	var transform = model.toJSON();
	if (!transform.image) {
		transform.image = "/images/add_photo.png";
	}
	transform.name = "Dr. " + transform.fname + " " + transform.lname;
	return transform;
}

function didItemClick(e) {
	var itemId = OS_MOBILEWEB ? e.row.rowId : e.itemId;
	App.Navigator.open({
		stack : true,
		titleid : "titleChooseTime",
		ctrl : "chooseTime",
		ctrlArguments : {
			itemId : itemId
		}
	});
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
