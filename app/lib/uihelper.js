var TAG = "UIHE",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    config = require("config"),
    utilities = require("utilities"),
    logger = require("logger"),
    moment = require("alloy/moment");

var Helper = {

	userLocation : {},

	/**
	 * force accessibility system to focus a view when there is a major change on UI
	 * Note : Supported only on custom SDK.
	 * @param {View} view to focus
	 */
	requestViewFocus : function(view) {
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_SCREEN_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, view);
		}
	},

	/**
	 * force accessibility system to focus a view when there is a layout change on window
	 * Note : Supported only on custom SDK.
	 * @param {View} view to focus
	 */
	requestAccessibilityFocus : function(view) {
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_FOCUS_CHANGED, view);
		}
	},

	/**
	 * Accessibility system announcement
	 * @param {String} str for announcement
	 */
	requestAnnouncement : function(str) {
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent(Ti.App.EVENT_ACCESSIBILITY_ANNOUNCEMENT, str);
		}
	},

	/**
	 * Get current location of user
	 * @param {Function} callback
	 * @param {Boolean} forceUpdate
	 * @param {Boolean} errorDialogEnabled
	 */
	getLocation : function(callback, forceUpdate, errorDialogEnabled) {

		if (forceUpdate !== true && !_.isEmpty(Helper.userLocation) && moment().diff(Helper.userLocation.timestamp) < Alloy.CFG.location_timeout) {
			Helper.fireLocationCallback(callback, Helper.userLocation);
			return;
		}

		if (!Ti.Geolocation.locationServicesEnabled) {
			if (errorDialogEnabled !== false) {
				Helper.showDialog({
					message : Alloy.Globals.strings.msgGeoAuthorizationRestricted
				});
			}
			return Helper.fireLocationCallback(callback);
		}

		if (OS_IOS) {
			var authorization = Ti.Geolocation.locationServicesAuthorization;
			if (authorization == Ti.Geolocation.AUTHORIZATION_DENIED) {
				if (errorDialogEnabled !== false) {
					Helper.showDialog({
						message : Alloy.Globals.strings.msgGeoAuthorizationDenied
					});
				}
				return Helper.fireLocationCallback(callback);
			} else if (authorization == Ti.Geolocation.AUTHORIZATION_RESTRICTED) {
				if (errorDialogEnabled !== false) {
					Helper.showDialog({
						message : Alloy.Globals.strings.msgGeoAuthorizationRestricted
					});
				}
				return Helper.fireLocationCallback(callback);
			}
		}

		Ti.Geolocation.getCurrentPosition(function(e) {
			Helper.fireLocationCallback(callback, e.success && !_.isEmpty(e.coords) ? e.coords : {});
		});
	},

	fireLocationCallback : function(callback, coords) {
		Helper.userLocation = coords ? coords : {};
		if (callback) {
			callback(Helper.userLocation);
		}
	},

	/**
	 * Open maps for direction
	 * @param {String|Object} destination address query or latitude and longitude
	 * @param {String|Object} source address query or latitude and longitude
	 * @param {String} mode direction mode
	 */
	getDirection : function(destination, source, mode) {

		if (_.isObject(destination)) {
			destination = destination.latitude + "," + destination.longitude;
		}

		if (_.isUndefined(source)) {
			if (_.isEmpty(Helper.userLocation)) {
				return Helper.getLocation(function(userLocation) {
					if (!_.isEmpty(userLocation)) {
						Helper.getDirection(destination, userLocation);
					}
				});
			}
			source = Helper.userLocation;
		}

		if (_.isObject(source)) {
			source = source.latitude + "," + source.longitude;
		}

		var params = "?saddr=" + source + "&daddr=" + destination + "&directionsmode=" + (mode || "transit");

		if (OS_IOS) {

			var optDialog = Alloy.createWidget("ti.optiondialog", "widget", {
				options : [Alloy.Globals.strings.dialogBtnMapApple, Alloy.Globals.strings.dialogBtnMapGoogle, Alloy.Globals.strings.dialogBtnCancel],
				cancel : 2
			});
			optDialog.on("click", function didClick(evt) {
				if (!evt.cancel) {
					var baseUrl;
					switch(evt.index) {
					case 0:
						baseUrl = "http://maps.apple.com/";
						break;
					case 1:
						baseUrl = Ti.Platform.canOpenURL("comgooglemaps://") ? "comgooglemaps://" : "http://maps.google.com/maps";
						break;
					}
					Ti.Platform.openURL(baseUrl + params);
				}
				optDialog.off("click", didClick);
				optDialog.destroy();
				optDialog = null;
			});
			optDialog.show();

		} else {

			Ti.Platform.openURL("http://maps.google.com/maps" + params);

		}
	},

	/**
	 *  Open option dialog for phone number
	 *  @param {Object} personObj Titanium.Contacts.Person dictionary for creating contact
	 *  @param {String} phone actual phone number to be sent for dialer
	 */
	getPhone : function(personObj, phone) {
		var optDialog = Alloy.createWidget("ti.optiondialog", "widget", {
			options : [Alloy.Globals.strings.dialogBtnPhone, Alloy.Globals.strings.dialogBtnContactAdd, Alloy.Globals.strings.dialogBtnCancel],
			cancel : 2
		});
		optDialog.on("click", function didClick(evt) {
			if (!evt.cancel) {
				switch(evt.index) {
				case 0:
					Helper.openDialer(phone);
					break;
				case 1:
					Helper.addContact(personObj);
					break;
				}
			}
			optDialog.off("click", didClick);
			optDialog.destroy();
			optDialog = null;
		});
		optDialog.show();
	},

	/**
	 * Add phone number to contacts
	 * @param {Object} personObj Titanium.Contacts.Person dictionary for creating contact
	 * @param {Boolean} requestAccess whether to request for access
	 */
	addContact : function(personObj, requestAccess) {
		switch(Ti.Contacts.contactsAuthorization) {
		case Ti.Contacts.AUTHORIZATION_AUTHORIZED:
			Ti.Contacts.createPerson(personObj);
			Helper.showDialog({
				message : Alloy.Globals.strings.msgContactAdded
			});
			break;
		case Ti.Contacts.AUTHORIZATION_DENIED:
			Helper.showDialog({
				message : Alloy.Globals.strings.msgContactsAuthorizationDenied
			});
			break;
		case Ti.Contacts.AUTHORIZATION_RESTRICTED:
			Helper.showDialog({
				message : Alloy.Globals.strings.msgContactAuthorizationRestricted
			});
			break;
		default:
			if (requestAccess !== false) {
				Ti.Contacts.requestAuthorization(function(e) {
					if (e.success) {
						Helper.addContact(personObj, false);
					} else {
						Helper.showDialog({
							message : Alloy.Globals.strings.msgContactsAuthorizationDenied
						});
					}
				});
			}
		}
	},

	/**
	 * Open phone's dialer
	 * @param {String} phone number to be dialed
	 */
	openDialer : function(phone) {
		Ti.Platform.openURL("tel:" + phone);
	},

	/**
	 *  Open option dialog for photo
	 *  @param callback called upon success
	 *  @param window through which we can get current activity
	 *  @param width to resize
	 *  @param height to resize
	 */
	getPhoto : function(callback, window, width, height) {
		var optDialog = Alloy.createWidget("ti.optiondialog", "widget", {
			options : [Alloy.Globals.strings.dialogBtnCamera, Alloy.Globals.strings.dialogBtnGallery, Alloy.Globals.strings.dialogBtnCancel],
			cancel : 2
		});
		optDialog.on("click", function didClick(evt) {
			if (!evt.cancel) {
				switch(evt.index) {
				case 0:
					Helper.openCamera(callback, window, width, height);
					break;
				case 1:
					Helper.openGallery(callback, window, width, height);
					break;
				}
			}
			optDialog.off("click", didClick);
			optDialog.destroy();
			optDialog = null;
		});
		optDialog.show();
	},

	/**
	 * open camera for a photo
	 * @param callback called upon success
	 * @param window through which we can get current activity
	 * @param width to resize
	 * @param height to resize
	 */
	openCamera : function(callback, window, width, height) {
		if (OS_IOS) {
			var authorization = Ti.Media.cameraAuthorizationStatus;
			if (authorization == Ti.Media.CAMERA_AUTHORIZATION_DENIED) {
				return Helper.showDialog({
					message : Alloy.Globals.strings.msgCameraAuthorizationDenied
				});
			} else if (authorization == Ti.Media.CAMERA_AUTHORIZATION_RESTRICTED) {
				return Helper.showDialog({
					message : Alloy.Globals.strings.msgCameraAuthorizationRestricted
				});
			}
			Ti.Media.showCamera({
				allowEditing : true,
				saveToPhotoGallery : false,
				mediaTypes : [Titanium.Media.MEDIA_TYPE_PHOTO],
				success : function didSuccess(e) {
					var blob = e.media;
					if (blob) {
						blob = blob.imageAsResized(width || Alloy.CFG.photo_default_width, height || Alloy.CFG.photo_default_height);
						callback(blob);
					}
				},
				error : function didFail(e) {
					Helper.showDialog({
						message : Alloy.Globals.strings.msgCameraError
					});
				}
			});
		} else {
			/**
			 * TiCameraActivity doesn't handle orientations of images
			 * so just use a intent, this also gives user an option
			 * to pickup different camera apps he has
			 */
			if (!Ti.Filesystem.isExternalStoragePresent()) {
				return Helper.showDialog({
					message : Alloy.Globals.strings.msgExternalStorageError
				});
			}
			var tempFile = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, "tempCamera.jpg"),
			    intent = Ti.Android.createIntent({
				action : "android.media.action.IMAGE_CAPTURE"
			});
			intent.putExtraUri("output", tempFile.nativePath);
			window.getActivity().startActivityForResult(intent, function didSuccess(e) {
				var resultCode = e.resultCode,
				    blob;
				if (resultCode == Ti.Android.RESULT_OK) {
					if (tempFile.exists()) {
						blob = tempFile.read().imageAsResized(width || Alloy.CFG.photo_default_width, height || Alloy.CFG.photo_default_height);
						tempFile.deleteFile();
						tempFile = null;
						callback(blob);
					} else if (e.intent && e.intent.data) {
						/**
						 * output file was was not written
						 * by the camera app
						 * Note: some third party applications
						 * just returns the content-uri (e.intent.data),
						 * doesn't write the file properly.
						 */
						intent.putExtraUri(Ti.Android.EXTRA_STREAM, e.intent.data);
						blob = intent.getBlobExtra(Ti.Android.EXTRA_STREAM);
						if (blob) {
							blob = blob.imageAsResized(width || Alloy.CFG.photo_default_width, height || Alloy.CFG.photo_default_height);
							if (blob) {
								callback(blob);
							} else {
								/**
								 * something went wrong
								 * may be not enough memory
								 * for processing this bitmap
								 */
								Helper.showDialog({
									message : Alloy.Globals.strings.msgCameraInvalid
								});
							}
						} else {
							/**
							 * if at all the blob
							 * is not available then
							 * show an alert
							 */
							Helper.showDialog({
								message : Alloy.Globals.strings.msgCameraInvalid
							});
						}
					} else {
						Helper.showDialog({
							message : Alloy.Globals.strings.msgCameraInvalid
						});
					}
				} else if (resultCode != Ti.Android.RESULT_CANCELED) {
					/**
					 *  it is not success and user has not cancelled it
					 *  so something else went wrong
					 */
					Helper.showDialog({
						message : Alloy.Globals.strings.msgCameraError
					});
				}
			});
		}
	},

	/**
	 * open gallery for a photo
	 * @param callback called upon success
	 * @param window through which we can get current activity
	 * @param width to resize
	 * @param height to resize
	 */
	openGallery : function(callback, window, width, height) {
		if (OS_IOS) {
			/**
			 * authorization status is handled by
			 * system, the gallery itself
			 * shows a error message on the
			 * gallery's modal window
			 */
			Ti.Media.openPhotoGallery({
				allowEditing : true,
				mediaTypes : [Titanium.Media.MEDIA_TYPE_PHOTO],
				success : function didSuccess(e) {
					var blob = e.media;
					if (blob) {
						blob = blob.imageAsResized(width || Alloy.CFG.photo_default_width, height || Alloy.CFG.photo_default_height);
						callback(blob);
					}
				},
				error : function didFail(e) {
					Helper.showDialog({
						message : Alloy.Globals.strings.msgGalleryError
					});
				}
			});
		} else {
			/**
			 * Ti.Media.openPhotoGallery on android
			 * also calls a intent for picking up a photo
			 * but that doesn't add edit / crop flags
			 * to the intent so making our own
			 */
			if (!Ti.Filesystem.isExternalStoragePresent()) {
				return Helper.showDialog({
					message : Alloy.Globals.strings.msgExternalStorageError
				});
			}
			var tempFile = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, "tempGallery.jpg"),
			    intent = Ti.Android.createIntent({
				action : Ti.Android.ACTION_PICK,
				type : "image/*"
			});
			intent.putExtraUri("output", tempFile.nativePath);
			intent.putExtra("crop", "true");
			window.getActivity().startActivityForResult(intent, function didSuccess(e) {
				var resultCode = e.resultCode,
				    blob;
				if (resultCode == Ti.Android.RESULT_OK) {
					if (tempFile.exists()) {
						blob = tempFile.read().imageAsResized(width || Alloy.CFG.photo_default_width, height || Alloy.CFG.photo_default_height);
						tempFile.deleteFile();
						tempFile = null;
						callback(blob);
					} else if (e.intent && e.intent.data) {
						/**
						 * output file was was not written
						 * by the gallery app
						 * Note: some third party applications
						 * just returns the content-uri (e.intent.data),
						 * doesn't write the file properly.
						 */
						intent.putExtraUri(Ti.Android.EXTRA_STREAM, e.intent.data);
						blob = intent.getBlobExtra(Ti.Android.EXTRA_STREAM);
						if (blob) {
							blob = blob.imageAsResized(width || Alloy.CFG.photo_default_width, height || Alloy.CFG.photo_default_height);
							if (blob) {
								callback(blob);
							} else {
								/**
								 * something went wrong
								 * may be not enough memory
								 * for processing this bitmap
								 */
								Helper.showDialog({
									message : Alloy.Globals.strings.msgGalleryInvalid
								});
							}
						} else {
							/**
							 * if at all the blob
							 * is not available then
							 * show an alert
							 */
							Helper.showDialog({
								message : Alloy.Globals.strings.msgGalleryInvalid
							});
						}
					} else {
						Helper.showDialog({
							message : Alloy.Globals.strings.msgGalleryInvalid
						});
					}
				} else if (resultCode != Ti.Android.RESULT_CANCELED) {
					/**
					 *  it is not success and user has not cancelled it
					 *  so something else went wrong
					 */
					Helper.showDialog({
						message : Alloy.Globals.strings.msgGalleryError
					});
				}
			});
		}
	},

	/*
	 * Standard AlertDialog
	 * @param {Object} params The arguments for the method
	 * @param {String} params.title title of alert box
	 * @param {String} params.message message of alert box
	 * @param {Array} params.buttonNames buttonNames of alert box
	 * @param {String} params.cancelIndex cancel index of alert box
	 * @param {String} params.ok ok text of alert box
	 * @param {View} params.androidView androidView of alert box
	 * @param {Function} params.success callback, if any button is clicked other than cancel
	 * @param {Function} params.cancel callback for cancel button
	 */
	showDialog : function(params) {
		_.defaults(params, {
			title : Ti.App.name,
			cancelIndex : -1,
			persistent : true,
			buttonNames : [Alloy.Globals.strings.dialogBtnOK]
		});
		var cancel = params.cancelIndex,
		    dict = _.pick(params, ["title", "buttonNames", "persistent", "style", "androidView"]);
		_.extend(dict, {
			cancel : cancel,
			message : ( OS_IOS ? "\n" : "").concat(params.message || "")
		});
		var dialog = Ti.UI.createAlertDialog(dict);
		dialog.addEventListener("click", function(e) {
			var index = e.index;
			if (params.success && index !== cancel) {
				params.success(index, e);
			} else if (params.cancel && index === cancel) {
				params.cancel();
			}
		});
		dialog.show();
	},

	/**
	 * Open email dialog
	 * @param {Object} o options
	 * @param {Array} attachments array of blob or files to attach
	 */
	openEmailDialog : function(o, attachments) {
		var dialog = Ti.UI.createEmailDialog(o);
		_.each(attachments, function(attachment) {
			dialog.addAttachment(attachment);
		});
		dialog.open();
	},

	/**
	 * get aspect ratio of image
	 * @param {String} name
	 * @param {ImageView} where image to be applied (optional)
	 */
	getImage : function(name, imgView) {
		var properties = Alloy.Images[name];
		if (!properties) {
			logger.error(TAG, "invalid image name", name);
			return {};
		}
		if (imgView) {
			imgView.applyProperties(properties);
		}
		return properties;
	},

	/**
	 * create header view
	 * @param {Controller} $ controller object
	 * @param {String} title section header's title
	 * @param {Boolean} isAttributed whether text is attributed
	 * @param {Boolean} isWrap whether text should ellipsize
	 * @param {Object} rightItem content on right
	 * @param {String} filterText used only when it is  call from createTableViewSection
	 */
	createHeaderView : function($, title, isAttributed, isWrap, rightItem, filterText) {
		var vClassName = "content-header-view",
		    tClassName = "content-header-lbl";
		if (isAttributed) {
			tClassName.replace("lbl", "attributed");
		}
		if (isWrap) {
			vClassName += "-wrap";
			tClassName += "-wrap";
		}
		if (rightItem) {
			tClassName += "-with-r" + (rightItem.isIcon ? "icon" : "btn");
		}
		var headerView = $.UI.create("View", {
			classes : vClassName,
			title : filterText
		});
		if (rightItem) {
			var callback;
			if (_.has(rightItem, "callback")) {
				callback = rightItem.callback;
				delete rightItem.callback;
			}
			var rightBtn = Ti.UI.createButton(rightItem);
			if (callback) {
				rightBtn.addEventListener("click", callback);
			}
			headerView.add(rightBtn);
		}
		headerView.add($.UI.create("Label", {
			classes : [tClassName],
			text : title
		}));
		return headerView;
	},

	/**
	 * create table view section
	 * @param {Controller} $ controller object
	 * @param {String} title section header's title
	 * @param {String} filterText for the section
	 * @param {Boolean} isAttributed whether text is attributed
	 * @param {Boolean} isWrap whether text should ellipsize
	 * @param {Object} rightItem content on right
	 * @param {View} footerView footer view for section
	 */
	createTableViewSection : function($, title, filterText, isAttributed, isWrap, rightItem, footerView) {
		/**
		 * http://developer.appcelerator.com/question/145117/wrong-height-in-the-headerview-of-a-tableviewsection
		 */
		var dict = {
			headerView : Helper.createHeaderView($, title, isAttributed, isWrap, rightItem, filterText)
		};
		if (footerView) {
			_.extend(dict, {
				footerView : footerView
			});
		}
		return Ti.UI.createTableViewSection(dict);
	},

	/**
	 * Calculates the height of the view by calulating the height of it's children (with fixed height)
	 * @param {Object} view
	 * @param {Boolean} withPadding
	 */
	getHeightFromChildren : function(view, withPadding) {
		var height = 0;
		if (withPadding) {
			height = (view.top || 0) + (view.bottom || 0);
		}
		if (view.layout == "vertical") {
			_.each(view.children, function(child) {
				height += (child.top || 0) + (child.bottom || 0) + (child.height || 0);
			});
		} else {
			var child = view.children[0];
			if (child) {
				height += (child.top || 0) + (child.bottom || 0) + (child.height || 0);
			}
		}
		return height;
	}
};

module.exports = Helper;
