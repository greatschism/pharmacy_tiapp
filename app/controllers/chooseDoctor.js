var args = arguments[0] || {};

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

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
