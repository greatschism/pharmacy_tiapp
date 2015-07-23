var args = arguments[0] || {};

function didTakePhoto() {
	
}
function didTypePrescription() {
	$.app.navigator.open({
		titleid : "titleTransferRx",
		ctrl : "transferTxTypePresc",
		stack : true
	});
}