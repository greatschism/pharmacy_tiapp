var args = arguments[0] || {},
    moment = require("alloy/moment"),
    uihelper = require("uihelper"),
    logger = require("logger"),
    http = require("requestwrapper"),
    app = require("core"),
    dialog = require("dialog"),
    doctor,
    prescriptions,
    profileImg,
    PRESCRIPTION_COUNT = 4;

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
	$.directionLbl.text = doctor.addressline1 + "\n" + doctor.addressline2 + "\n " + doctor.city + ", " + doctor.state + ", " + doctor.zip;
	$.notesTxta.setValue(doctor.notes);
	var len = prescriptions.length;
	if (len == 0) {
		$.prescriptionsSection = uihelper.createTableViewSection($, Alloy.Globals.strings.strPrescriptions);
		var row = $.UI.create("TableViewRow", {
			apiName : "TableViewRow"
		}),
		    contentView = $.UI.create("View", {
			apiName : "View",
			classes : ["padding-top", "auto-height"]
		}),
		    titleLbl = $.UI.create("Label", {
			apiName : "Label",
			text : Alloy.Globals.strings.msgNoActiveprescription,
			classes : ["fill-width", "padding-left", "padding-bottom"]
		});
		contentView.add(titleLbl);
		row.add(contentView);
		$.prescriptionsSection.add(row);
		$.tableView.data = [$.prescriptionsSection];

	} else {

		if (len > PRESCRIPTION_COUNT) {
		
			var footerView = $.UI.create("View", {
				apiName : "View",
				classes : ["auto-height", "vgroup"],
			}),
			    moreIcon = $.UI.create("Label", {
				apiName : "Label",
				color : "#6D6E71",
				font : Alloy.TSS.list_item_child.font,
				text : Alloy.CFG.icons.arrow_down,
				classes : ["text-center"]
			}),
			    moreLabel = $.UI.create("Label", {
				apiName : "Label",
				classes : ["text-center", "paddingTop"],
				color : "#599DFF",
				text : Alloy.Globals.strings.lblShowMore,
			});
			footerView.add(moreLabel);
			footerView.add(moreIcon);
			footerView.addEventListener("click", didClickMore);
			$.tableView.footerView = footerView;
			
		}

		var firstPrescriptions = _.first(prescriptions, PRESCRIPTION_COUNT);
		loadPrescriptions(firstPrescriptions);
		$.tableView.data = $.tableView.data;
	}
}

function didClickMore(e) {
	loadPrescriptions(_.last(prescriptions, prescriptions.length - PRESCRIPTION_COUNT));
	$.tableView.footerView = $.UI.create("View", {
		classes : ["auto"]
	});
}

function phoneDialer(e) {
	//alert("clicked");
	var number = "tel:+" + String(doctor.phone);
	Ti.Platform.openURL(number);
}

function loadPrescriptions(prescriptions) {
	if (!$.prescriptionsSection) {
		$.prescriptionsSection = uihelper.createTableViewSection($, Alloy.Globals.strings.strPrescriptions);
		for (var i in prescriptions) {
			$.prescriptionsSection.add(getRow(prescriptions[i]));

		}
		$.tableView.data = [$.prescriptionsSection];
	} else {
		for (var i in prescriptions) {
			$.tableView.appendRow(getRow(prescriptions[i]));

		}
	}
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
	rightLbl.text = prescription.latest_filled_date ? Alloy.Globals.strings.lblLastRefilled.concat(": " + moment(prescription.latest_filled_date, "YYYY-MM-DD HH:mm").format("D/M/YY")) : Alloy.Globals.strings.msgNotFilledYet;
	view.add(leftLbl);
	view.add(rightLbl);
	row.add(view);
	return row;
}

function didClickProfileImg(e) {
	$.photoDialog.show();
}

function didClickDirections(e) {
	dialog.show({
		message : Alloy.Globals.strings.msgUnderConstruction
	});
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
			allowImageEditing : true,
			saveToPhotoGallery : true
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
			}
		});
	} else {
		//cancel was tapped
		//user opted not to choose a photo
	}
}

function didClickEdit(e) {

	app.navigator.open({
		stack : true,
		titleid : "titleAddDoctor",
		ctrl : "addDoctor",
		ctrlArguments : {
			doctor : doctor,
			edit : "true"
		}

	});

}

exports.init = init;
