var args = $.args;

(function(){
	setData(args);
})();

function setData(dict) {
	$.headerLbl.text = dict.headerText;
}

function addRow(row) {
	$.tableViewSection.add(row);
}

function getSection() {
	return $.tableViewSection;
}

exports.setData = setData;
exports.addRow = addRow;
exports.getSection = getSection;

