var args = arguments[0] || {},
    app = require("core");
    

function didClickContinue(e) {
	if(args.isScan==1){
		console.log("func");
		
		/*function doClick(e) {
 alert($.label.text);
 }*/
//function scanImage() {
	console.log("func1");
	alert("Please scan the barcode using the camera");
	var barcode = require("ti.barcode");

	// open a single window
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
	window.open();
	console.log("func2");
//}






	 // app.navigator.open({
		 // ctrl : "addPhoto",
		 // titleid : "strSignup",
		// stack : true
// 		
  // });
}
else if(args.isTyped==1){
	app.navigator.open({
		  ctrl : "refillSuccess",
		 titleid: "",
		 stack : true
		
	});
}
}
