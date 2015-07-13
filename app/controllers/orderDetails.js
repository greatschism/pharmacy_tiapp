var args = arguments[0] || {},
    prescriptions = args.prescriptions || [],
    iconClasses = ["content-negative-right-icon", "icon-unfilled-remove"],
    rows = [];

function init() {
	//prescriptions section
	var iconDict = $.createStyle({
		classes : ["content-header-right-icon", "icon-add"]
	});
	iconDict.isIcon = true;
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.orderDetSectionList, null, false, false, iconDict);
	//if more than one prescription is there add right icon to remove a prescription
	var isRemoveable = prescriptions.length > 1;
	_.each(prescriptions, function(prescription) {
		if (isRemoveable) {
			prescription.iconClasses = iconClasses;
		}
		var row = Alloy.createController("itemTemplates/labelWithRIcon", prescription);
		$.prescSection.add(row.getView());
		rows.push(row);
	});
	$.tableView.setData([$.prescSection]);
}

exports.init = init;
