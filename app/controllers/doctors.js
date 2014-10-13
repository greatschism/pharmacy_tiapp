var args = arguments[0] || {};
  App = require("core");
  
function didToggle(e) {

}

function didItemClick(e) {

}

$.listView.addEventListener('itemclick', function(e) {
	var item = e.section.getItemAt(e.itemIndex);

	e.section.updateItemAt(e.itemIndex, item);
	OpenCamera();
});

function OpenCamera(e) {
	
		Titanium.Media.showCamera({

			success : function(event) {
				var cropRect = event.cropRect;
				var image = event.media;

				Ti.API.debug('Our type was: ' + event.mediaType);
				if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
					$.icon.image = image;
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
	

	
}

function doctorDetails() {

App.Navigator.open({
		ctrl : "addDoctor",
		title : "Add a Doctor",
		
		stack : true
	});

}

