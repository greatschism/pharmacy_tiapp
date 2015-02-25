var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    uihelper = require("uihelper");

function didChange(e) {
	var value = e.value,
	    len;
	value = value.replace('(', '').replace(')', '').replace(' ', '').replace('-', '');
	len = value.length;
	if (len >= 10) {
		value = '(' + value.substr(0, 3) + ')' + value.substr(3, 3) + '-' + value.substr(6, 4);
	} else if (len >= 7) {
		value = '(' + value.substr(0, 3) + ')' + value.substr(3, 3) + '-' + value.substr(6, 4);
	} else if (len >= 4) {
		value = '(' + value.substr(0, 3) + ')' + value.substr(3, 3);
	} else if (len > 0) {
		value = '(' + value.substr(0, len);
	}
	$.mobileTxt.setValue(value);
}

function didClickContinue(e) {
	var mob = $.mobileTxt.getValue();
	if (isNaN(mob) == false) {
		if (args.isScan == 1) {
			console.log("func");

			/*function doClick(e) {
			alert($.label.text);
			}*/
			//function scanImage() {
			
			alert("Please scan the barcode using the camera");
			var barcode = require("ti.barcode");

			//open a single window
			var window = Ti.UI.createWindow({
				backgroundColor : 'white'
			});
			window.open();

			var button = Ti.UI.createButton({
				title : "Scan Barcode",
				width : 150,
				height : 40,
				top : 20
			});

			window.add(button);

			var cancel = Ti.UI.createButton({
				title : "Cancel",
				width : 150,
				height : 40,
				bottom : 20
			});

			window.add(cancel);

			button.addEventListener('click', function() {
				barcode.capture({
					success : function(event) {
						alert("success = " + event.result);
					},
					cancel : function(event) {
						console.log("cancel");
						app.navigator.open({
							ctrl : "scanFailure",
							titleid : "",
							stack : true

						});
						alert("cancel");
					},
					error : function(event) {
						app.navigator.open({
							ctrl : "scanFailure",
							titleid : "",
							stack : true

						});
						alert("Error. " + event.message);
					}
				});
			});

			cancel.addEventListener('click', function() {
				window.close();
			});
			//window.open();

		console.log("func1");
		app.navigator.open({
							ctrl : "scanFailure",
							titleid : "",
							stack : true

						});
		} else if (args.isTyped == 1) {
			app.navigator.open({
				ctrl : "refillSuccess",
				titleid : "titleYourRefillIsOnTheWay",
				stack : false

			});
		}
	} else {
		alert("please enter a valid 10 digit number");
	}
}
