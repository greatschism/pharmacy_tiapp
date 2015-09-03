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

}

function didChangePatient(e) {

}

function didClickAdd(e) {

}

exports.init = init;
exports.focus = focus;
