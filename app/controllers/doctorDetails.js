var args = arguments[0] || {},
    moment = require("alloy/moment"),
    uihelper = require("uihelper"),
    logger = require("logger"),
    http = require("requestwrapper"),
    app = require("core"),
    dialog = require("dialog"),
    doctor,
    prescriptions,
    profileImg;

function init() {

	doctor = args.doctor;
	prescriptions = args.prescriptions || [];

	if (doctor.image_url.length) {
		$.profileImageView.remove($.profileIconLabel);

		profileImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			height : "70",
			width : "70",
			classes : ["paddingLeft", " paddingTop"],
			borderColor : "#000000",
		});

		//set the image property
		$.profileImageView.add(profileImg);

	}

	$.nameLbl.text = doctor.long_name;

	$.phoneLbl.text = doctor.phone;
	$.faxLbl.text = doctor.fax;

	$.directionLbl.text=doctor.addressline1 ? doctor.addressline2 ? doctor.addressline1+"\n"+doctor.addressline2 : doctor.addressline1 : doctor.addressline2 ? doctor.addressline2 : "";
	
	if((doctor.city || doctor.state || doctor.zip) && $.directionLbl.text)
	{
		$.directionLbl.text+="\n";
	}
	if(doctor.city || doctor.state || doctor.zip)
	{
		$.directionLbl.text+=doctor.city ? doctor.state ? doctor.city+","+doctor.state : doctor.city : doctor.state ? doctor.state : "";
		
		if((doctor.city || doctor.state) && doctor.zip)
		$.directionLbl.text+=","+ doctor.zip;
		else if(doctor.zip)
		$.directionLbl.text+=doctor.zip;
	}
	

	$.notesTxta.setValue(doctor.notes);
	var len = prescriptions.length;
	$.prescriptionsSection = uihelper.createTableViewSection($, Alloy.Globals.strings.sectionHasPrescribedYou);

	if (doctor.doctor_type == "manual") {
		var row = createNoPrescriptionRow(Alloy.Globals.strings.msgManuallyAddedDoctor);
		$.prescriptionsSection.add(row);
		$.tableView.data = [$.prescriptionsSection];

	} else {
		if (len == 0) {
			var row = createNoPrescriptionRow(Alloy.Globals.strings.msgYouHaveNoActiveprescription);
			$.prescriptionsSection.add(row);
			$.tableView.data = [$.prescriptionsSection];

		} else {

			for (var i in prescriptions) {
				$.prescriptionsSection.add(getRow(prescriptions[i]));

			}
			$.tableView.data = [$.prescriptionsSection];
		}
	}
}

function phoneDialer(e) {

	var number = "tel:" + String(doctor.phone);
	Ti.Platform.openURL(number);
}

function getRow(prescription) {
	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),
	    view = $.UI.create("View", {
		apiName : "View",
		classes : ["list-item-view"]
	}),
	    leftLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["list-item-title-lbl", "left"]
	}),
	    rightLbl = $.UI.create("Label", {
		apiName : "Label",
		color : "#808285",
		classes : ["list-item-info-lbl", "right"]
	});
	leftLbl.text = prescription.presc_name;
	var expiryDate=moment(prescription.expiration_date, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD");
	if(moment().diff(expiryDate,"days")>0)
	rightLbl.text=Alloy.Globals.strings.lblExpired;
	else
	rightLbl.text = prescription.latest_filled_date ? Alloy.Globals.strings.lblRefilled.concat(": " + moment(prescription.latest_filled_date, "YYYY-MM-DD HH:mm").format("D/M/YY")) : Alloy.Globals.strings.msgNotFilledYet;
	view.add(leftLbl);
	view.add(rightLbl);
	row.add(view);
	row.rowId = prescription.id;

	return row;
}

function didItemClick(e) {
	var id = e.row.rowId;
	var prescription = _.findWhere(prescriptions, {
		id : id
	});

	app.navigator.open({
		stack : true,
		title : Alloy.Globals.strings.lblDrugDetails,
		ctrl : "prescriptionDetails",
		ctrlArguments : {
			prescription : prescription
		}
	});

}

function didClickProfileImg(e) {
	$.photoDialog.show();
}

function didClickDirections(e) {
	dialog.show({
		message : Alloy.Globals.strings.msgUnderConstruction
	});
}

function createNoPrescriptionRow(message) {
	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow"
	}),
	    contentView = $.UI.create("View", {
		apiName : "View",
		classes : ["padding-top", "auto-height"]
	}),
	    titleLbl = $.UI.create("Label", {
		apiName : "Label",
		text : message,
		classes : ["fill-width", "padding-left", "padding-bottom", "h2"]
	});
	contentView.add(titleLbl);
	row.add(contentView);
	return row;
}

function didClickOption(e) {

	if (!(profileImg)) {

		var profileImg = $.UI.create("ImageView", {
			apiName : "ImageView",
			height : "70",
			width : "70",
			classes : ["paddingLeft", " paddingTop"],
			borderColor : "#000000",
		});
	}

	if (e.index == 1) {
		//then we are getting image from camera
		Titanium.Media.showCamera({
			//we got something
			success : function(event) {
				//getting media
				var image = event.media;

				//checking if it is photo
				if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
					//we may create image view with contents from image variable
					//or simply save path to image

					if (!(profileImg))
						$.profileImageView.remove($.profileIconLabel);

					profileImg.image = image;
					$.profileImageView.add(profileImg);

					Ti.App.Properties.setString("image", image.nativePath);
				}
			},
			cancel : function() {
				//do something if user cancels operation
			},
			error : function(error) {
				//error happend, create alert
				//var a = Titanium.UI.createAlertDialog({title:'Camera'});
				//set message
				if (error.code == Titanium.Media.NO_CAMERA) {
					alert('Device does not have camera');
				} else {
					alert('Unexpected error: ' + error.code);
				}

				// show alert
				// a.show();
			},
			saveToPhotoGallery : true,
			allowEditing : true
		});
	} else if (e.index == 0) {
		//obtain an image from the gallery
		Titanium.Media.openPhotoGallery({
			success : function(event) {
				//getting media
				var image = event.media;
				// set image view

				//checking if it is photo
				if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
					//we may create image view with contents from image variable
					//or simply save path to image
					if (!(profileImg))
						$.profileImageView.remove($.profileIconLabel);

					profileImg.image = image;
					$.profileImageView.add(profileImg);

					Ti.App.Properties.setString("image", image.nativePath);
				}
			},
			cancel : function() {
				//user cancelled the action fron within
				//the photo gallery
			},
			allowEditing : true
		});
	} else {
		//cancel was tapped
		//user opted not to choose a photo
	}
}

function didClickEdit(e) {

	app.navigator.open({
		stack : true,
		titleid : "titleEditDoctor",
		ctrl : "addDoctor",
		ctrlArguments : {
			doctor : doctor,
			edit : "true"
		}

	});

}

exports.init = init;
