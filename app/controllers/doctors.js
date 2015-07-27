var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    swipeOptions,
    currentDoctor,
    isWindowOpen;

function init() {
	swipeOptions = [{
		action : 1,
		title : $.strings.doctorsSwipeOptDelete,
		type : "negative"
	}];
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		$.http.request({
			method : "doctors_list",
			params : {
				feature_code : "THXXX",
				data : [{
					doctors : [{
						code_name : apiCodes.code_sort_order_preference
					}]
				}]
			},
			keepLoader : true,
			success : didGetDoctors
		});
	}
}

function didGetDoctors(result, passthrough) {

}

function didClickTableView(e) {

}

exports.init = init;
exports.focus = focus;
