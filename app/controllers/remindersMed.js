var args = arguments[0] || {};

function init() {
	$.patientSwitcher.set({
		title : $.strings.doctorsPatientSwitcher,
		where : {
			is_partial : false
		},
		selectable : {
			is_partial : false
		}
	});
	var top = $.uihelper.getHeightFromChildren($.headerView);
	$.tableView.top = top;
	$.addView.top = top;
}

function focus() {
	/*
	 * avoid null pointer if another controller or another instance of this controller
	 * used this global variable in it's life span
	 */
	Alloy.Globals.currentTable = $.tableView;
}

function didChangePatient(e) {

}

function didClickTableView(e) {

}

function didClickAdd(e) {

}

function setParentView(view) {
	$.patientSwitcher.setParentView(view);
}

function terminate() {
	//terminate patient switcher
	$.patientSwitcher.terminate();
	/**
	 * not resetting currentTable object
	 * as there are chance when nullify it here
	 * may affect the object being set on next
	 * controllers init / focus method
	 */
	Alloy.Globals.currentRow = null;
	Alloy.Globals.isSwipeInProgress = false;
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
exports.setParentView = setParentView;
