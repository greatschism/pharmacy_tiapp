var args = arguments[0] || {};

function init() {
	Alloy.Collections.upcomingAppointments.reset([{
		image : "/images/profile.png",
		desc : "You have an upcoming appointment with Dr. Doe on",
		time : "May 12th at 4.30 PM."
	}]);
	Alloy.Collections.myDoctors.reset([]);
}

function transformFunction(model) {
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

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e){
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
