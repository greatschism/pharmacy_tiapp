var args = arguments[0] || {},
    moment = require("alloy/moment");

function init() {
	Alloy.Collections.chooseTime.reset([{
		label : Alloy.Globals.Strings.lblOnThisDate,
		value : moment().format("MMM Do, YYYY")
	}, {
		label : Alloy.Globals.Strings.lblAtThisTime,
		value : moment().format("h A")
	}]);
}

function didItemClick(e) {

}

function didClickSave(e){
	
}

function didClickEdit(e){
	
}

function didClickDelete(e){
	
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;