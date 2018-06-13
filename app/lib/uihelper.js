var TAG = "UIHE",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    config = require("config"),
    utilities = require("utilities"),
    logger = require("logger"),
    analyticsHandler = require("analyticsHandler"),
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
	 * force accessibility to be hidden / shown based on given input
	 * @param {View} view to focus
	 * @param {Boolean} value for `Ti.UI.View.accessibilityHidden`
	 * @param {Boolean} recursive decides whether or not to apply on all it's individual children
	 */
	toggleAccessibility : function(view, value, recursive) {
		if (Ti.App.accessibilityEnabled) {
			var children = view.children;
			_.each(children, function(child) {
				child.accessibilityHidden = value;
				// console.log(child, child.accessibilityHidden, value);
				if (recursive && _.has(child, "children")) {
					Helper.toggleAccessibility(child, value, recursive);
				}
			});
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

		//must check whether service is enabled
		if (!Ti.Geolocation.locationServicesEnabled) {
			/**
			 * clear cached location when
			 * location service is turned off
			 */
			Helper.userLocation = {};
			if (errorDialogEnabled !== false) {
				Helper.showDialog({
					message : Alloy.Globals.strings.msgGeoAuthorizationRestricted
				});
			}
			return Helper.fireLocationCallback(callback);
		}

		if (forceUpdate !== true && !_.isEmpty(Helper.userLocation) && moment().diff(Helper.userLocation.timestamp) < Alloy.CFG.location_timeout) {
			Helper.fireLocationCallback(callback, Helper.userLocation);
			return;
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

	checkLocationPermission : function(callback, forceUpdate, errorDialogEnabled, loader) {
		if (!OS_IOS && !Titanium.Geolocation.hasLocationPermissions(Titanium.Geolocation.AUTHORIZATION_ALWAYS)) {
			Titanium.Geolocation.requestLocationPermissions(Titanium.Geolocation.AUTHORIZATION_ALWAYS, function(result) {
				if (!result.success) {
					analyticsHandler.trackEvent("StoreFinder", "click", "DeniedLocationPermission");
					if (loader) {
						loader.hide(false);
					}
				} else {
					Helper.getLocation(callback, forceUpdate, errorDialogEnabled);
				}
			});
		} else {
			Helper.getLocation(callback, forceUpdate, errorDialogEnabled);
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

		if (_.isObject(source)) {
			source = source.latitude + "," + source.longitude;
		}

		var params = "&daddr=" + destination + "&dirflg=" + (mode || "d");

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
						baseUrl = "http://maps.apple.com/maps?saddr=" + (source || "Current%20Location");
						break;
					case 1:
						baseUrl = (Ti.Platform.canOpenURL("comgooglemaps://") ? "comgooglemaps://?saddr=" : "http://maps.google.com/maps?saddr=") + (source || "");
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

			Ti.Platform.openURL("http://maps.google.com/maps?saddr=" + (source || "") + params);

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
					if (phone && !utilities.isPhoneNumber(phone)) {
						phone = utilities.validatePhoneNumber(phone);
					};
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

	getPhoneWithContactsPrompt : function(personObj, phone) {
		var optDialog = Alloy.createWidget("ti.optiondialog", "widget", {
			options : [Alloy.Globals.strings.dialogBtnPhone, Alloy.Globals.strings.dialogBtnContactAdd, Alloy.Globals.strings.dialogBtnCancel],
			cancel : 2
		});
		optDialog.on("click", function didClick(evt) {
			if (!evt.cancel) {
				switch(evt.index) {
				case 0:
					if (phone && !utilities.isPhoneNumber(phone)) {
						phone = utilities.validatePhoneNumber(phone);
					};
					Helper.openDialer(phone);
					break;
				case 1:
					if (!Titanium.Contacts.hasContactsPermissions()) {
						Titanium.Contacts.requestContactsPermissions(function(result) {
							if (result.success) {
								Helper.addContact(personObj);
							} else {
								analyticsHandler.trackEvent("Prescriptions-CallPharmacy", "click", "DeniedContactsPermission");
								// alert(Alloy.Globals.strings.msgDenyFeaturePermission);
								Helper.showDialogWithButton({
									message : Alloy.Globals.strings.msgDenyFeaturePermission,
									deactivateDefaultBtn : true,
									btnOptions : [{
										title : Alloy.Globals.strings.dialogBtnSettings,
										onClick : Helper.openSettings
									}, {
										title : Alloy.Globals.strings.dialogBtnCancel
									}]
								});
							}
						});
					} else {
						Helper.addContact(personObj);
					}

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
	getPhoto : function(watermark, callback, window, callbackError, width, height) {
		// alert(watermark);
		var optDialog = Alloy.createWidget("ti.optiondialog", "widget", {
			options : [Alloy.Globals.strings.dialogBtnCamera, Alloy.Globals.strings.dialogBtnGallery, Alloy.Globals.strings.dialogBtnCancel],
			cancel : 2,
			title : "Select an option"
		});

		var watermarker = function(blob) {
			var container = Ti.UI.createView();
			var watermarkMe;
			var label1;

			if (OS_ANDROID) {
				label1 = Ti.UI.createLabel({
					color : '#fff',
					font : {
						fontSize : 24
					},
					shadowColor : '#000',
					shadowOffset : {
						x : 3,
						y : 3
					},
					shadowRadius : 5,
					text : Alloy.Globals.strings.faxImageMessage,
					textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
					top : 2,
					width : Ti.UI.SIZE,
					height : Ti.UI.SIZE
				});

			} else {
				label1 = Ti.UI.createLabel({
					color : '#fff',
					font : {
						fontSize : 36
					},
					shadowColor : '#000',
					shadowOffset : {
						x : 3,
						y : 3
					},
					shadowRadius : 5,
					text : Alloy.Globals.strings.faxImageMessage,
					textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
					bottom : 2,
					width : blob.width,
					height : Ti.UI.SIZE
				});
				label1.anchorPoint = {
					x : 0,
					y : 0
				};
			}

			if (OS_ANDROID) {
				var imageFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "notwatermarked.jpg");
				imageFile.write(blob);
				var blobOfImage = imageFile.read();

				watermarkMe = Ti.UI.createImageView({
					defaultImage : blobOfImage.nativePath,
					top : 0,
					left : 0,
					height : 'auto',
					width : 'auto',
				});
				container.add(watermarkMe);
				container.add(label1);
			} else {
				watermarkMe = Ti.UI.createImageView({
					image : blob,
					width : 'auto',
					height : 'auto'
				});
				watermarkMe.transform = Ti.UI.create2DMatrix().rotate(270);
				label1.transform = Ti.UI.create2DMatrix().rotate(270);
				container.add(watermarkMe);
				container.add(label1);
			}

			var newBlob = container.toImage();
			callback(newBlob);
		};

		optDialog.on("click", function didClick(evt) {
			if (!evt.cancel) {
				switch(evt.index) {
				case 0:
					if (!Titanium.Media.hasCameraPermissions()) {
						Titanium.Media.requestCameraPermissions(function(result) {
							if (!result.success) {
								analyticsHandler.trackEvent("UploadPhoto", "click", "DeniedCameraPermission");
								Helper.showDialogWithButton({
									message : Alloy.Globals.strings.msgDenyFeaturePermission,
									deactivateDefaultBtn : true,
									btnOptions : [{
										title : Alloy.Globals.strings.dialogBtnSettings,
										onClick : Helper.openSettings
									}, {
										title : Alloy.Globals.strings.dialogBtnCancel
									}]
								});
								callbackError();
							} else {
								if (watermark)
									Helper.openCamera(watermarker, callbackError, window, width, height);
								else
									Helper.openCamera(callback, callbackError, window, width, height);
							}
						});
					} else {
						if (watermark)
							Helper.openCamera(watermarker, callbackError, window, width, height);
						else
							Helper.openCamera(callback, callbackError, window, width, height);
					}
					break;
				case 1:
					if (watermark)
						Helper.openGallery(watermarker, callbackError, window, width, height);
					else
						Helper.openGallery(callback, callbackError, window, width, height);
					break;
				}
			}
			else
			{
				callbackError();
			}
			optDialog.off("click", didClick);
			optDialog.destroy();
			optDialog = null;
		});
		optDialog.show();
	},

	openSettings : function(e) {
		if (OS_IOS) {
			var settingsURL = Ti.App.iOS.applicationOpenSettingsURL;
			if (Ti.Platform.canOpenURL(settingsURL)) {
				Ti.Platform.openURL(settingsURL);
			}
		} else {
			var activity = Ti.Android.currentActivity;

			var intent = Ti.Android.createIntent({
				action : 'android.settings.APPLICATION_DETAILS_SETTINGS',
				data :"package:"+Ti.App.id
			});
			intent.addFlags(Ti.Android.FLAG_ACTIVITY_NEW_TASK);
			activity.startActivity(intent);
		}
	},
	/**
	 * open camera for a photo
	 * @param callback called upon success
	 * @param window through which we can get current activity
	 * @param width to resize
	 * @param height to resize
	 */
	openCamera : function(callback, callbackError, window, width, height) {
		if (OS_IOS) {
			var authorization = Ti.Media.cameraAuthorization;
			if (authorization == Ti.Media.CAMERA_AUTHORIZATION_DENIED) {
				Helper.showDialog({
					message : Alloy.Globals.strings.msgCameraAuthorizationDenied
				});
				callbackError();
			} else if (authorization == Ti.Media.CAMERA_AUTHORIZATION_RESTRICTED) {
				Helper.showDialog({
					message : Alloy.Globals.strings.msgCameraAuthorizationRestricted
				});
				callbackError();	
			}
		} else {
			if (!Ti.Filesystem.isExternalStoragePresent()) {
				Helper.showDialog({
					message : Alloy.Globals.strings.msgExternalStorageError
				});
				callbackError();
			}
		}
			Ti.Media.showCamera({
				allowEditing : true,
				saveToPhotoGallery : false,
				mediaTypes : [Titanium.Media.MEDIA_TYPE_PHOTO],
				success : function didSuccess(e) {
					var blob = e.media;
					if (blob) {
						blob = Helper.imageAsResized(blob, width || Alloy.CFG.photo_default_width, height).blob;
						callback(blob);
					}
				},
				cancel : function didCanceled() {
					callbackError();
				},
				error : function didFail(e) {
					Helper.showDialog({
						message : Alloy.Globals.strings.msgCameraError
					});
					callbackError();
				}
			});
	},

	/**
	 * open gallery for a photo
	 * @param callback called upon success
	 * @param window through which we can get current activity
	 * @param width to resize
	 * @param height to resize
	 */
	openGallery : function(callback, callbackError, window, width, height) {
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
						blob = Helper.imageAsResized(blob, width || Alloy.CFG.photo_default_width, height).blob;
						callback(blob);
					}
				},
				cancel : function didCanceled(){
					callbackError();
				},
				error : function didFail(e) {
					Helper.showDialog({
						message : Alloy.Globals.strings.msgGalleryError
					});
					callbackError();
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
				Helper.showDialog({
					message : Alloy.Globals.strings.msgExternalStorageError
				});
				callbackError();
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
						blob = Helper.imageAsResized(tempFile.read(), width || Alloy.CFG.photo_default_width, height).blob;
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
							blob = Helper.imageAsResized(blob, width || Alloy.CFG.photo_default_width, height).blob;
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
								callbackError();
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
							callbackError();
						}
					} else {
						Helper.showDialog({
							message : Alloy.Globals.strings.msgGalleryInvalid
						});
						callbackError();
					}
				} else if (resultCode != Ti.Android.RESULT_CANCELED) {
					/**
					 *  it is not success and user has not cancelled it
					 *  so something else went wrong
					 */
					Helper.showDialog({
						message : Alloy.Globals.strings.msgGalleryError
					});
					callbackError();
				}
				else
				{
					callbackError();
				}
			});
		}
	},

	/**
	 * resize image with aspect ratio
	 * @param {Object} TiBlob
	 * @param {Number} width in dp
	 * @param {Number} height in dp
	 * returns {Object} resized blob
	 */
	imageAsResized : function(blob, newWidth, newHeight) {
		if (!newWidth || !newHeight) {
			var imgWidth = blob.width,
			    imgHeight = blob.height;
			/**
			 * px to dp
			 * Note: Android returns
			 * blob's height in px
			 */
			if (OS_ANDROID) {
				imgWidth /= app.device.logicalDensityFactor;
				imgHeight /= app.device.logicalDensityFactor;
			}
			if (!newWidth) {
				newHeight = utilities.percentageToValue(newHeight, app.device.height);
				newWidth = Math.floor((imgWidth / imgHeight) * newHeight);
			} else if (!newHeight) {
				newWidth = utilities.percentageToValue(newWidth, app.device.width);
				newHeight = Math.floor((imgHeight / imgWidth) * newWidth);
			}
		}
		/**
		 * converting dp to px for TiBlob.imageAsResized
		 * Note: done for both platforms as px from android converted to dp above
		 */
		return {
			width : newWidth,
			height : newHeight,
			blob : blob.imageAsResized(newWidth * app.device.logicalDensityFactor, newHeight * app.device.logicalDensityFactor)
		};
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

	showDialogWithButton : function(params) {
		var btnOptions = params.deactivateDefaultBtn ? [] : [Alloy.Globals.strings.dialogBtnOK];
		_.each(params.btnOptions, function(btnObj) {
			btnOptions.push(btnObj.title);
		});

		_.defaults(params, {
			title : Ti.App.name,
			cancelIndex : -1,
			persistent : true,
			buttonNames : btnOptions
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
			params.deactivateDefaultBtn && index++;
			if (params.deactivateDefaultBtn || index >= 1) {
				params.btnOptions[index - 1].onClick && params.btnOptions[index - 1].onClick();
			} else if (params.success && index !== cancel) {
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
	 * @param {Boolean} isWrap whether text should wrap
	 * @param {Object} rightItem content on right
	 * @param {String} filterText used only when it is  call from createTableViewSection
	 */
	createHeaderView : function($, title, isWrap, rightItem, filterText) {
		var vClasses = ["inactive-light-bg-color"],
		    tClasses = ["margin-left", "h5", "inactive-fg-color"];
		if (isWrap) {
			vClasses.push("auto-height");
			tClasses = tClasses.concat(["margin-top", "margin-bottom"]);
		} else {
			vClasses.push("min-height");
			tClasses.push("wrap-disabled");
		}
		if (rightItem) {
			//if length is 1, it will be a icon
			if (rightItem.title.length === 1) {
				_.extend(rightItem, $.createStyle({
					classes : ["icon-width"]
				}));
				tClasses.push("margin-right-icon");
			} else {
				_.extend(rightItem, $.createStyle({
					classes : ["title-width"]
				}));
				tClasses.push("margin-right-title");
			}
		} else {
			tClasses.push("margin-right");
		}
		logger.debug("\n\n\n rightItem		", JSON.stringify(rightItem, null, 4), "\n\n\n");

		// Ti.API.info("rightItem ++ " + JSON.stringify(rightItem));
		// Ti.API.info("vclasses ++ " + JSON.stringify(vClasses));
		// Ti.API.info("tclasses ++ " + JSON.stringify(tClasses));
		var headerView;

		//TODO: this logic needs to live in the prescriptions controller
		//all in this 'Checkout' conditional is for building the custom (checkout) banner inside of the ready for pickup section header of this tableview
		if (rightItem && (rightItem.title === "Checkout" || rightItem.title === $.strings.titleCheckoutCompleteHeader || rightItem.title === $.strings.titleContinueExpressPickupHeader)) {

			var headerCheckoutTitle = rightItem.title;
			logger.debug("\n\n\n headerCheckoutTitle		", headerCheckoutTitle, "\n\n\n");

			var rightItemClasses;

			if (utilities.isNarrowScreen()) {
				rightItemClasses = ["i4", "margin-right-small"];
			} else {
				rightItemClasses = ["i4", "margin-right-large"];
			}

			if (rightItem) {
				rightItem.title = "";
				_.extend(rightItem, $.createStyle({
					classes : rightItemClasses
				}));
				tClasses.push("margin-right-icon");
			}
			var headerView = $.UI.create("View", {
				classes : vClasses,
				height : 90
			});

			var headerViewTop = $.UI.create("View", {
				classes : vClasses,
				title : filterText,
				height : 40,
				top : 0
			});

			var lbl = $.UI.create("Label", {
				classes : tClasses,
				text : title
			});

			if (!isWrap) {
				Helper.wrapText(lbl);
			}

			headerViewTop.add(lbl);
			headerView.add(headerViewTop);

			//Build 'headerViewHelp', which is the bottom part of the section header including the shopping cart image
			//TODO: color shouldn't be hard coded here
			var headerViewHelp;
			if (OS_IOS) {
				headerViewHelp = Ti.UI.createView({
					height : 50,
					backgroundColor : '#EEFFCFF',
					bottom : 0
				});
			} else {
				var headerViewHelp = Ti.UI.createView({
					height : 50,
					backgroundColor : '#EFFCFF',
					bottom : 0
				});
				headerViewHelp.backgroundColor = '#EFFCFF';
			}
			var headerLabel = $.UI.create("Label", {
				classes : ["margin-left"],
				color : "gray",
				text : headerCheckoutTitle === "Checkout" ? $.strings.orderCheckoutLbl : headerCheckoutTitle
			});

			headerViewHelp.add(headerLabel);

			if (rightItem) {
				var callback;
				if (_.has(rightItem, "callback")) {
					callback = rightItem.callback;
				}

				if (!OS_IOS) {
					rightItem.backgroundColor = null;
				}

				if (headerCheckoutTitle === "Checkout" || headerCheckoutTitle === $.strings.titleContinueExpressPickupHeader) {
					
					var rightImg = Ti.UI.createImageView(rightItem);
						_.extend(rightImg, $.createStyle({
							classes : ["margin-right-small"],
							width: 54,
							height: 54
							}));
						rightImg.image = Helper.getImage("cart_arrow").image;
						headerViewHelp.add(rightImg);	
							
					if (callback) {
						headerViewHelp.addEventListener("click", callback);
						rightImg.addEventListener("click", callback);
					}
					//headerViewHelp.add(rightImg);

					headerViewHelp.setBubbleParent(false);
				}
			}

			var lbl = $.UI.create("Label", {
				classes : tClasses,
				text : title
			});

			headerView.add(headerViewHelp);

		} else if (rightItem && rightItem.secondaryHeader) {

			var headerView = $.UI.create("View", {
				classes : vClasses,
				height : 90
			});

			var headerViewPrimary = $.UI.create("View", {
				classes : vClasses,
				height : 40,
				top : 0
			});

			var lbl = $.UI.create("Label", {
				classes : tClasses,
				text : title
			});

			if (!isWrap) {
				Helper.wrapText(lbl);
			}

			headerViewPrimary.add(lbl);
			headerView.add(headerViewPrimary);

			// vClasses.shift();
			vClasses.push("hgroup");
			var headerViewSecondary = $.UI.create("View", {
				classes : vClasses,
				height : 50,
				backgroundColor : '#EFFCFF',
				bottom : 0
			});

			var lblSecondary = $.UI.create("Label", {
				classes : ["h6", "margin-left", "margin-top-large"],
				text : rightItem.title
			});

			if (!isWrap) {
				Helper.wrapText(lblSecondary);
			}

			headerViewSecondary.add(lblSecondary);

			if (rightItem.secondaryHeaderRightItem) {
				if (rightItem.secondaryHeaderRightIcon) {

				} else {
					var callback;
					if (_.has(rightItem, "callback")) {
						callback = rightItem.callback;
						delete rightItem.callback;
					}

					var rightBtn = $.UI.create("Button", {
						classes : rightItem.secondaryHeaderRightItem.classes,
						title : rightItem.secondaryHeaderRightItem.title,
						id : rightItem.secondaryHeaderRightItem.id
					});
					_.extend(rightBtn, $.createStyle({
						classes : ["margin-right-small"]
					}));

					if (callback) {
						rightBtn.addEventListener("click", callback);
					}
					headerViewSecondary.add(rightBtn);

				}
			}
			headerView.add(headerViewSecondary);

		} else {

			headerView = $.UI.create("View", {
				classes : vClasses,
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
			logger.debug("\n\n\n headerView title		",title, "\n\n\n");
			var lbl = $.UI.create("Label", {
				classes : tClasses,
				text : title
			});
			if (!isWrap) {
				Helper.wrapText(lbl);
			}

			if (title === "") {
				//if no title is given, don't show the header!
				headerView.height = 0;
			} else {
				headerView.add(lbl);
			}
		}

		return headerView;
	},

	/**
	 * create table view section
	 * @param {Controller} $ controller object
	 * @param {String} title section header's title
	 * @param {String} filterText for the section
	 * @param {Boolean} isWrap whether text should wrap
	 * @param {Object} rightItem content on right
	 * @param {View} footerView footer view for section
	 */
	createTableViewSection : function($, title, filterText, isWrap, rightItem, footerView) {
		/**
		 * http://developer.appcelerator.com/question/145117/wrong-height-in-the-headerview-of-a-tableviewsection
		 */
		var dict = {
			headerView : Helper.createHeaderView($, title, isWrap, rightItem, filterText)
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
				height += (child.top || 0) + (child.bottom || 0) + (Number(child.height) || child.font && (child.font.fontSize + 5) || 0);
			});
		} else {
			var child = view.children[0];
			if (child) {
				height += (child.top || 0) + (child.bottom || 0) + (Number(child.height) || child.font && (child.font.fontSize + 5) || 0);
			}
		}
		return height;
	},

	/**
	 * Handle height of label when wrap is disabled
	 * Required for iOS at least
	 */
	wrapText : function(label) {
		/**
		 * 5 - is a extra padding around label
		 * which makes it look better
		 */
		if (label.ellipsize) {
			/**
			 * Width should be Ti.UI.FILL
			 * for making ellipsize effective
			 * APPC JIRA refs -
			 * TIMOB-14256,TIMOB-13220,TIMOB-13895
			 */
			label.applyProperties({
				width : Ti.UI.FILL,
				height : label.font.fontSize + 5
			});
		} else {
			label.height = Ti.UI.SIZE;
		}
	},

	/**
	 * @param {Object} view
	 * set border radius to 1/2 of view's height
	 * for rounded corners
	 */
	roundedCorners : function(view) {
		view.borderRadius = view.height / 2;
	},

	/**
	 * wrap elements on horizontal direction
	 * Note: using horizontal layout has issues
	 * with android platform, APPC JIRA refs -
	 * TIMOB-19536, TIMOB-16367, TIMOB-12577
	 */
	wrapViews : function(view, direction) {
		var children = view.children,
		    value = 0;
		if (!direction) {
			direction = "left";
		} else if (direction === "right") {
			children = children.reverse();
		}
		_.each(children, function(child, index) {
			value += child[direction] || 0;
			child[direction] = value;
			value += child.width || child.font && child.font.fontSize || 0;
		});
	}
};

module.exports = Helper;
