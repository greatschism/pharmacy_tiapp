var args = arguments[0] || {},
    app = require("core");

function init() {
	Alloy.Collections.doctors.trigger("reset");
}

function didItemClick(e) {
	var doctorId = e.row.rowId;
	app.navigator.open({
		stack : true,
		titleid : "titleChooseTime",
		ctrl : "chooseTime",
		ctrlArguments : {
			doctorId : doctorId
		}
	});
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
