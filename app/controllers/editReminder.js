var args = arguments[0] || {},
    moment = require("alloy/moment");

(function() {
	if (args.edit) {
		$.deleteBtn.show();
	}
	//$.dateLbl.text = moment().format("MMM Do, YYYY");
	//$.timeLbl.text = moment().format("h A");
})();

function didItemClick(e) {

}

function setParentViews(view) {
	$.dateLbl.setParentView(view);
}

function didClickSave(e) {

}

function didClickEdit(e) {

}

function didClickDelete(e) {

}
exports.setParentViews = setParentViews;