var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    uihelper = require("uihelper");

function didChange(e) {
	var value = e.value,
	    len;
	value = value.replace('(', '').replace(') ', '').replace(' ', '').replace('-', '');
	len = value.length;
	if (len >= 11) {
		value = '(' + value.substr(0, 3) + ') ' + value.substr(4, 3) + '-' + value.substr(6, 5);
	} else if (len >= 7) {
		value = '(' + value.substr(0, 3) + ') ' + value.substr(3, 3) + '-' + value.substr(6, 5);
	} else if (len >= 4) {
		value = '(' + value.substr(0, 3) + ') ' + value.substr(3, 3);
	} else if (len > 0) {
		value = '(' + value.substr(0, len);
	}
	$.mobileTxt.setValue(value);
}

function didClickContinue(e) {
	var mob = $.mobileTxt.getValue();
	if (isNaN(mob) == true && mob.length == 14) {
		if (args.isScan == 1) {
			console.log("func");

			var Barcode = require('ti.barcode');
			Barcode.allowRotation = true;
			Barcode.displayedMessage = '';
			Barcode.useLED = true;

			var window = Ti.UI.createWindow({
				backgroundColor : 'white'
			});
			var scrollView = Ti.UI.createScrollView({
				contentWidth : 'auto',
				contentHeight : 'auto',
				top : 0,
				showVerticalScrollIndicator : true,
				layout : 'vertical'
			});

			/**
			 * Create a chrome for the barcode scanner.
			 */
			var overlay = Ti.UI.createView({
				backgroundColor : 'transparent',
				top : 0,
				right : 0,
				bottom : 0,
				left : 0
			});
			var switchButton = Ti.UI.createButton({
				title : Barcode.useFrontCamera ? 'Back Camera' : 'Front Camera',
				textAlign : 'center',
				color : '#000',
				backgroundColor : '#fff',
				style : 0,
				font : {
					fontWeight : 'bold',
					fontSize : 16
				},
				borderColor : '#000',
				borderRadius : 10,
				borderWidth : 1,
				opacity : 0.5,
				width : 220,
				height : 30,
				bottom : 10
			});
			switchButton.addEventListener('click', function() {
				Barcode.useFrontCamera = !Barcode.useFrontCamera;
				switchButton.title = Barcode.useFrontCamera ? 'Back Camera' : 'Front Camera';
			});
			overlay.add(switchButton);

			var toggleLEDButton = Ti.UI.createButton({
				title : Barcode.useLED ? 'LED is On' : 'LED is Off',
				textAlign : 'center',
				color : '#000',
				backgroundColor : '#fff',
				style : 0,
				font : {
					fontWeight : 'bold',
					fontSize : 16
				},
				borderColor : '#000',
				borderRadius : 10,
				borderWidth : 1,
				opacity : 0.5,
				width : 220,
				height : 30,
				bottom : 40
			});
			toggleLEDButton.addEventListener('click', function() {
				Barcode.useLED = !Barcode.useLED;
				toggleLEDButton.title = Barcode.useLED ? 'LED is On' : 'LED is Off';
			});
			overlay.add(toggleLEDButton);

			var cancelButton = Ti.UI.createButton({
				title : 'Cancel',
				textAlign : 'center',
				color : '#000',
				backgroundColor : '#fff',
				style : 0,
				font : {
					fontWeight : 'bold',
					fontSize : 16
				},
				borderColor : '#000',
				borderRadius : 10,
				borderWidth : 1,
				opacity : 0.5,
				width : 220,
				height : 30,
				top : 20
			});
			cancelButton.addEventListener('click', function() {
				Barcode.cancel();
			});
			overlay.add(cancelButton);

			/**
			 * Create a button that will trigger the barcode scanner.
			 */
			var scanCode = Ti.UI.createButton({
				title : 'Scan Code',
				width : 200,
				height : 60,
				top : 20
			});
			scanCode.addEventListener('click', function() {
				reset();
				// Note: while the simulator will NOT show a camera stream in the simulator, you may still call "Barcode.capture"
				// to test your barcode scanning overlay.
				Barcode.capture({
					animate : true,
					overlay : overlay,
					showCancel : false,
					showRectangle : false,
					keepOpen : true/*,
					 acceptedFormats: [
					 Barcode.FORMAT_QR_CODE
					 ]*/
				});
			});
			scrollView.add(scanCode);

			// creating cancel button on screen
			var Cancel = Ti.UI.createButton({
				title : 'Cancel',
				width : 200,
				height : 60,
				top : 20
			});
			Cancel.addEventListener('click', function(e) {
				//reset();
				app.navigator.open({
					ctrl : "scanFailure",
					titleid : "strRefillNow",
					stack : true,

				});
				window.close();

			});

			scrollView.add(Cancel);

			/**
			 * Create a button that will show the gallery picker.
			 */
			// var scanImage = Ti.UI.createButton({
				// title : 'Scan Image from Gallery',
				// width : 200,
				// height : 60,
				// top : 20
			// });
			// scanImage.addEventListener('click', function() {
				// reset();
				// Ti.Media.openPhotoGallery({
					// success : function(evt) {
						// Barcode.parse({
							// image : evt.media/*,
							 // acceptedFormats: [
							 // Barcode.FORMAT_QR_CODE
							 // ]*/
						// });
					// }
				// });
			// });
			// scrollView.add(scanImage);

			/**
			 * Now listen for various events from the Barcode module. This is the module's way of communicating with us.
			 */
			var scannedBarcodes,
			    scannedBarcodesCount = 0;
			function reset() {
				scannedBarcodes=0;
				scannedBarcodesCount = 0;
				cancelButton.title = 'Cancel';

				scanResult.text = ' ';
				scanContentType.text = ' ';
				scanParsed.text = ' ';
			}


			Barcode.addEventListener('error', function(e) {
				console.log("error");
				
				scanContentType.text = ' ';
				scanParsed.text = ' ';
				scanResult.text = e.message;
				Ti.API.info('error received');
				app.navigator.open({
					ctrl : "scanfailure",
					titleid : "strRefillNow",
					stack : true,

				});
			});
			Barcode.addEventListener('cancel', function(e) {
				Ti.API.info('Cancel received');
				Barcode.cancel();
			});
			Barcode.addEventListener('success', function(e) {
				//Ti.API.info('Success called with barcode: ' + e.result);
				if (scannedBarcodesCount == 0){
					Ti.API.info('Success called with barcode: ' + e.result);
					console.log("success1");
					Ti.API.info('success received');
					scannedBarcodesCount += 1;
					cancelButton.title = 'Finished (' + scannedBarcodesCount + ' Scanned)';
console.log("successscannedBarcodesCount1"+ scannedBarcodesCount);
					scanResult.text += e.result + ' ';
					scanContentType.text += parseContentType(e.contentType) + ' ';
					scanParsed.text += parseResult(e) + ' ';
					//cancel();
				
console.log("scan success2");
				//function didClickOrderRefill(e) {
				// mob = $.mobileNumber.getValue();

				http.request({
					method : "PRESCRIPTIONS_REFILL",
					data : {

						"client_identifier" : "x",
						"version" : "x",
						"session_id" : "x",
						"filter" : [{
							"refill_type" : "quick/scan/text"
						}],
						"data" : [{
							"prescriptions" : [{
								"id" : "x",
								"rx_number" : "x",
								"store_id" : "x",
								"mobile_number" : mob,
								"pickup_time_group" : "x",
								"pickup_mode" : "instore/mailorder",
								"barcode_data" : e.result,
								"barcode_format" : e.format
							}
							// }, {
// 
								// id : "x",
								// rx_number : "x",
								// store_id : "x",
								// mobile_number : "x",
								// pickup_time_group : "x",
								// pickup_mode : "instore/mailorder",
								// barcode_data : e.result,
								// barcode_format : e.format
							// }]
							]
						}]
					},
					success : didSuccess,
				});	
	}	}		
);
				function didSuccess(e) {
					console.log("api success");
					
					Barcode.cancel();
					window.close();
					app.navigator.open({
						titleid : "titleYourRefillIsOnTheWay",
						ctrl : "refillSuccess",
						stack : false
					});
					//alert("Under Construction");
				}

			

			/**
			 * Finally, we'll add a couple labels to the window. When the user scans a barcode, we'll stick information about it in
			 * to these labels.
			 */
			scrollView.add(Ti.UI.createLabel({
				text : 'You may need to rotate the device',
				top : 10,
				height : Ti.UI.SIZE || 'auto',
				width : Ti.UI.SIZE || 'auto'
			}));

			scrollView.add(Ti.UI.createLabel({
				text : 'Result: ',
				textAlign : 'left',
				top : 10,
				left : 10,
				color : 'black',
				height : Ti.UI.SIZE || 'auto'
			}));

			var scanResult = Ti.UI.createLabel({
				text : ' ',
				textAlign : 'left',
				top : 10,
				left : 10,
				color : 'black',
				height : Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanResult);

			scrollView.add(Ti.UI.createLabel({
				text : 'Content Type: ',
				top : 10,
				left : 10,
				textAlign : 'left',
				color : 'black',
				height : Ti.UI.SIZE || 'auto'
			}));
			var scanContentType = Ti.UI.createLabel({
				text : ' ',
				textAlign : 'left',
				top : 10,
				left : 10,
				color : 'black',
				height : Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanContentType);

			scrollView.add(Ti.UI.createLabel({
				text : 'Parsed: ',
				textAlign : 'left',
				top : 10,
				left : 10,
				color : 'black',
				height : Ti.UI.SIZE || 'auto'
			}));
			var scanParsed = Ti.UI.createLabel({
				text : ' ',
				textAlign : 'left',
				top : 10,
				left : 10,
				color : 'black',
				height : Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanParsed);

			function parseContentType(contentType) {
				switch (contentType) {
				case Barcode.URL:
					return 'URL';
				case Barcode.SMS:
					return 'SMS';
				case Barcode.TELEPHONE:
					return 'TELEPHONE';
				case Barcode.TEXT:
					return 'TEXT';
				case Barcode.CALENDAR:
					return 'CALENDAR';
				case Barcode.GEOLOCATION:
					return 'GEOLOCATION';
				case Barcode.EMAIL:
					return 'EMAIL';
				case Barcode.CONTACT:
					return 'CONTACT';
				case Barcode.BOOKMARK:
					return 'BOOKMARK';
				case Barcode.WIFI:
					return 'WIFI';
				default:
					return 'UNKNOWN';
				}
			}

			function parseResult(event) {
				var msg = '';
				switch (event.contentType) {
				case Barcode.URL:
					msg = 'URL = ' + event.result;
					break;
				case Barcode.SMS:
					msg = 'SMS = ' + JSON.stringify(event.data);
					break;
				case Barcode.TELEPHONE:
					msg = 'Telephone = ' + event.data.phonenumber;
					break;
				case Barcode.TEXT:
					msg = 'Text = ' + event.result;
					break;
				case Barcode.CALENDAR:
					msg = 'Calendar = ' + JSON.stringify(event.data);
					break;
				case Barcode.GEOLOCATION:
					msg = 'Latitude = ' + event.data.latitude + '\nLongitude = ' + event.data.longitude;
					break;
				case Barcode.EMAIL:
					msg = 'Email = ' + event.data.email + '\nSubject = ' + event.data.subject + '\nMessage = ' + event.data.message;
					break;
				case Barcode.CONTACT:
					msg = 'Contact = ' + JSON.stringify(event.data);
					break;
				case Barcode.BOOKMARK:
					msg = 'Bookmark = ' + JSON.stringify(event.data);
					break;
				case Barcode.WIFI:
					return 'WIFI = ' + JSON.stringify(event.data);
				default:
					msg = 'unknown content type';
					break;
				}
				return msg;
			}


			window.add(scrollView);
			window.open();

		} else if (args.isTyped == 1) {
			app.navigator.open({
				ctrl : "refillTypeRx",
				titleid : "titleYourRefillIsOnTheWay",
				stack : true

			});
		}
	} else {
		alert("please enter a valid 10 digit number");
	}
}
