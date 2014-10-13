var args = arguments[0] || {};

function didToggle(e) {

}

function didItemClick(e) {

}

function OpenCamera(e) {
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

