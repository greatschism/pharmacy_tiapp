var args = arguments[0] || {},
    app = require("core");

function init() {
	Alloy.Collections.doctors.trigger("reset");
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
	app.Navigator.open({
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
