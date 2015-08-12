var args = arguments[0] || {},
    childProxies,
    childProxy,
    rows = [];
function init() {
	updateTable();

}

function updateTable() {
	var data = [];

	childProxies = [{
		title : "Bobby James",
		subtitle : "My son"
	}, {
		title : "Daphie James",
		subtitle : "My daughter"
	}, {
		title : "Kerry James",
		subtitle : "My daughter"
	}, {
		title : "Kathy James",
		subtitle : "My daughter"
	}, {
		title : "Mathew James",
		subtitle : "My son"
	}];
	$.receiveTextSection = $.uihelper.createTableViewSection($, $.strings.receiveTextChildSectionLbl);
	var subtitleClasses = ["content-subtitle-wrap"],
	    titleClasses = ["content-title-wrap"],
	    selected = false;
	_.each(childProxies, function(childProxy) {
		_.extend(childProxy, {
			titleClasses : titleClasses,
			subtitleClasses : subtitleClasses,
			selected : selected
		});
		var row = Alloy.createController("itemTemplates/contentViewWithLIcon", childProxy);
		$.receiveTextSection.add(row.getView());
		rows.push(row);

	});
	$.childTable.setData([$.receiveTextSection]);
}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

function didClickTableView(e) {
	var row = rows[e.index];
	var params = row.getParams();
	if (params.selected === true) {
		params.selected = false;
	} else {
		params.selected = true;
	}
	row = Alloy.createController("itemTemplates/contentViewWithLIcon", params);
	$.childTable.updateRow( OS_IOS ? e.index : row.getView(), row.getView());

}

exports.init = init;
