var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    cached = " ",
    prepopulated_number = "",
    uihelper = require("uihelper");

function init() {
	console.log("init trigg");
	if ((OS_IOS || OS_ANDROID) && (cached != 0 || cached != "" )) {
		//utilities.setProperty(Alloy.CFG.PHARMACY_PHONE_LAST_USED, $.mobileTxt.getValue(), "string", false);
		prepopulated_number = utilities.getProperty(Alloy.CFG.PHARMACY_PHONE_LAST_USED, cached, "string", false);
		$.mobileTxt.setValue(prepopulated_number);
		console.log("prepopulated_number" + prepopulated_number);
	}
	console.log("ios");
}

function didChange(e) {
	console.log("didchng");
	var value = utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.mobileTxt.setValue(value);
	$.mobileTxt.setSelection(len, len);
}

function didClickContinue(e) {

	var mob = $.mobileTxt.getValue();
	console.log("mob" + mob);
	cached = utilities.setProperty(Alloy.CFG.pharmacy_phone_last_used, mob, "string", false);
	console.log("cached" + (cached));

var Barcode = require('ti.barcode');
Barcode.allowRotation = true;
Barcode.displayedMessage = '';
Barcode.useLED = true;

var window = Ti.UI.createWindow({
    backgroundColor: 'white'
});


/**
 * Create a chrome for the barcode scanner.
 */
var overlay = Ti.UI.createView({
    backgroundColor: 'transparent',
    top: 0, right: 0, bottom: 0, left: 0
});
var switchButton = Ti.UI.createButton({
    title: Barcode.useFrontCamera ? 'Back Camera' : 'Front Camera',
    textAlign: 'center',
    color: '#000', backgroundColor: '#fff', style: 0,
    font: { fontWeight: 'bold', fontSize: 16 },
    borderColor: '#000', borderRadius: 10, borderWidth: 1,
    opacity: 0.5,
    width: 220, height: 30,
    bottom: 10
});
switchButton.addEventListener('click', function () {
    Barcode.useFrontCamera = !Barcode.useFrontCamera;
    switchButton.title = Barcode.useFrontCamera ? 'Back Camera' : 'Front Camera';
});
overlay.add(switchButton);

var toggleLEDButton = Ti.UI.createButton({
    title: Barcode.useLED ? 'LED is On' : 'LED is Off',
    textAlign: 'center',
    color: '#000', backgroundColor: '#fff', style: 0,
    font: { fontWeight: 'bold', fontSize: 16 },
    borderColor: '#000', borderRadius: 10, borderWidth: 1,
    opacity: 0.5,
    width: 220, height: 30,
    bottom: 40
});
toggleLEDButton.addEventListener('click', function () {
    Barcode.useLED = !Barcode.useLED;
    toggleLEDButton.title = Barcode.useLED ? 'LED is On' : 'LED is Off';
});
overlay.add(toggleLEDButton);

var cancelButton = Ti.UI.createButton({
    title: ' <- Back', textAlign: 'left',
    color: '#000', style: 0,
    font: { fontWeight: 'bold', fontSize: 16 },
    opacity: 0.5,
    width: 220, height: 30,
    top: 20
});
cancelButton.addEventListener('click', function () {
    Barcode.cancel();
});
overlay.add(cancelButton);

var cameraTitleMessage = Ti.UI.createLabel({
	text: 'Center the barcode inside the box to scan',
	color: '#FFF',
	 font: { fontWeight: 'bold', fontSize: 16 },
	 textAlign: 'center',
	 top:20,
	 width: 100
});
overlay.add(cameraTitleMessage);
    // Note: while the simulator will NOT show a camera stream in the simulator, you may still call "Barcode.capture"
    // to test your barcode scanning overlay.
    Barcode.capture({
        animate: true,
        overlay: overlay,
        showCancel: false,
        showRectangle: true,
        keepOpen: true,
        acceptedFormats: [
            Barcode.FORMAT_CODE_128
        ]
    });




/**
 * Now listen for various events from the Barcode module. This is the module's way of communicating with us.
 */
var scannedBarcodes = {}, scannedBarcodesCount = 0;

Barcode.addEventListener('error', function (e) {
 Ti.API.info('error called with barcode: ' + e.message);
});
Barcode.addEventListener('cancel', function (e) {
    Ti.API.info('Cancel received');
});
Barcode.addEventListener('success', function (e) {
    Ti.API.info('Success called with barcode: ' + e.result);
    if (!scannedBarcodes['' + e.result]) {
        scannedBarcodes[e.result] = true;
        scannedBarcodesCount += 1;
        cancelButton.title = 'Finished (' + scannedBarcodesCount + ' Scanned)';
  
    }
});



}

exports.init = init;
