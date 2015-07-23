function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}
function didClickPharmacyTransferFromPickerClose(e) {
	$.pharmacyTransferFromPicker.hide();
}
function updatePharmacyTransferPicker() {
	
}
