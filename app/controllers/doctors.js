var args = arguments[0] || {};

function init() {
	Alloy.Collections.upcomingAppointments.reset([{
		image : "/images/profile.png",
		desc : "You have an upcoming appointment with Dr. Doe on",
		time : "May 12th at 4.30 PM."
	}]);
	Alloy.Collections.doctors.reset([{
		image : "/images/add_photo.png",
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
		image : "/images/profile.png",
		fname : "Herman",
		lname : "Melville",
		prescriptions : [{
			name : "Omeprazole"
		}]
	}, {
		image : "/images/profile.png",
		fname : "Hareesh",
		lname : "Khurana",
		prescriptions : []
	}]);
}

function transformAppointment(model) {
	var transform = model.toJSON();
	if (OS_IOS) {
		var text = transform.desc + " " + transform.time;
		var len = transform.desc.length;
		transform.title = Ti.UI.iOS.createAttributedString({
			text : text,
			attributes : [{
				type : Titanium.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
				value : "#8b8b8b",
				range : [0, len]
			}, {
				type : Titanium.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
				value : "#F79538",
				range : [len + 1, transform.time.length]
			}]
		});
	} else {
		transform.title = transform.desc + " <font color=\"#F79538\">" + transform.time + "</font>";
	}
	return transform;
}

function transformDoctor(model) {
	var transform = model.toJSON();
	transform.name = "Dr. " + transform.fname + " " + transform.lname;
	var prescriptions = transform.prescriptions;
	var description = "";
	var len = prescriptions.length;
	if (len) {
		description = "Dr. " + transform.lname + " has prescribed you " + prescriptions[0].name;
		if (len > 1) {
			switch(len) {
			case 2:
				description += " and " + prescriptions[1].name;
				break;
			case 3:
				description += ", " + prescriptions[1].name + " and " + prescriptions[2].name;
				break;
			default:
				description += ", " + prescriptions[1].name + " and [" + (len - 2) + "] more";
			}
		}
	} else {
		description = "You have no active prescriptions associated with Dr. " + transform.lname;
	}
	description += ".";
	transform.description = description;
	return transform;
}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e) {
	console.log(e);
}

function didItemClick(e) {

}

function openCamera(e) {
	var win = Ti.UI.createWindow({
		backgroundColor : "#00ff00"
	});
	win.addEventListener("open", function() {
		Titanium.Media.showCamera({
			success : function(event) {
				var cropRect = event.cropRect;
				var image = event.media;

				Ti.API.debug('Our type was: ' + event.mediaType);
				if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
					anImageView.image = image;
					//new_upload_profile_picture_update(anImageView.image);
				} else {
					alert("got the wrong type back =" + event.mediaType);
				}
			},
			cancel : function() {
			},
			error : function(error) {
				// create alert
				var a = Titanium.UI.createAlertDialog({
					title : 'Camera'
				});
				// set message
				if (error.code == Titanium.Media.NO_CAMERA) {
					a.setMessage('Please run this test on device');
				} else {
					a.setMessage('Unexpected error: ' + error.code);
				}
				// show alert
				a.show();
			},
			saveToPhotoGallery : true,
			allowEditing : false,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});
	});
	win.open();
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
