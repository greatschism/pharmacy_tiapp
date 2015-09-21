var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    rows = [],
    reminder = args.reminder,
    prescriptions = args.isUpdate ? reminder.prescriptions : args.prescriptions,
    selectedPrescriptions = [],
    nonRemovableDict = {
	masterWidth : 100,
	detailWidth : 0,
	btnClasses : false
},
    removableDict = {
	masterWidth : 70,
	detailWidth : 30,
	btnClasses : ["content-detail-negative-icon", "icon-unfilled-remove"]
},
    selectedColor;

function init() {
	//reminder section
	$.reminderSection = Ti.UI.createTableViewSection();
	//color box row
	var colorRow = getColorBoxRow(reminder.color_code || Alloy.CFG.default_color);
	$.reminderSection.add(colorRow.getView());
	rows.push(colorRow);
	//remind frequency

	//prescriptions section
	var iconDict;
	/*
	 * only allow add prescriptions
	 * if canAdd flag is not false
	 */
	if (args.canAdd !== false) {
		iconDict = $.createStyle({
			classes : ["content-header-right-icon", "icon-add"]
		});
		_.extend(iconDict, {
			isIcon : true,
			callback : didClickAddPresc
		});
	}
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.remindersMedSettingsSectionPresc, null, false, false, iconDict);
	//if more than one prescription is there add right icon to remove a prescription
	var isRemovable = prescriptions.length > 1;
	_.each(prescriptions, function(prescription) {
		/**
		 * if this is a update
		 * then prescriptions won't
		 * have any more information
		 * than it's id, so get it
		 * from collection
		 */
		if (!_.has(prescription, "title")) {
			prescription = Alloy.Collections.prescriptions.findWhere({
				id : prescription.id
			}).toJSON();
		}
		_.extend(prescription, isRemovable ? removableDict : nonRemovableDict);
		var row = getPrescRow(prescription);
		$.prescSection.add(row.getView());
		rows.push(row);
	});
	//set data
	$.tableView.setData([$.reminderSection, $.prescSection]);
}

function getPrescRow(prescription) {
	var row = Alloy.createController("itemTemplates/masterDetailBtn", prescription);
	row.on("clickdetail", didClickRemovePresc);
	return row;
}

function getColorBoxRow(color) {
	return Alloy.createController("itemTemplates/labelWithColorBox", {
		title : $.strings.remindersMedSettingsLblReminderColor,
		color : color
	});
}

function focus() {
	if (selectedPrescriptions.length) {
		/**
		 * make existing first row removable
		 * if prescriptions.length is already > 1 then it would already be removable
		 */
		if (prescriptions.length == 1) {
			var prescFirstIndex = $.reminderSection.rowCount,
			    currentCtrl = rows[prescFirstIndex],
			    currentRow = currentCtrl.getView(),
			    currentParams = currentCtrl.getParams();
			_.extend(currentParams, removableDict);
			rows[prescFirstIndex] = getPrescRow(currentParams);
			$.tableView.updateRow( OS_IOS ? prescFirstIndex : currentRow, rows[prescFirstIndex].getView());
		}
		_.each(selectedPrescriptions, function(prescription) {
			prescriptions.push(prescription);
			_.extend(prescription, removableDict);
			var row = getRow(prescription);
			$.tableView.insertRowAfter($.prescSection.rowCount - 1, row.getView());
			rows.push(row);
		});
		selectedPrescriptions = [];
	} else if (selectedColor) {
		//color picker is always on 0th index
		if (selectedColor.hex != rows[0].getParams().color) {
			updateColorBoxRow(selectedColor.hex);
		}
		//nullify
		selectedColor = null;
	}
}

function didClickAddPresc(e) {
	$.app.navigator.open({
		titleid : "titleRemindersMedPrescriptions",
		ctrl : "prescriptions",
		ctrlArguments : {
			isMedReminder : true,
			prescriptions : selectedPrescriptions,
			patientSwitcherDisabled : true,
			showHiddenPrescriptions : true,
			preventRefillValidation : true,
			selectable : true,
			useCache : true
		},
		stack : true
	});
}

function didClickRemovePresc(e) {
	var params = e.data;
	rows = _.reject(rows, function(row) {
		return row.getParams().id === params.id;
	});
	prescriptions = _.reject(prescriptions, function(prescription) {
		return prescription.id === params.id;
	});
	$.tableView.deleteRow(e.source.getView());
	/**
	 *  make existing first row not removable
	 * if prescriptions.length === 1
	 */
	if (prescriptions.length == 1) {
		var prescFirstIndex = $.reminderSection.rowCount,
		    currentCtrl = rows[prescFirstIndex],
		    currentRow = currentCtrl.getView(),
		    currentParams = currentCtrl.getParams();
		_.extend(currentParams, nonRemovableDict);
		rows[prescFirstIndex] = getPrescRow(currentParams);
		$.tableView.updateRow( OS_IOS ? prescFirstIndex : currentRow, rows[prescFirstIndex].getView());
	}
}

function didClickTableView(e) {
	var index = e.index,
	    row = rows[index];
	if (row) {
		switch(row.getView().className) {
		case "labelWithColorBox":
			selectedColor = {
				hex : rows[index].getParams().color
			};
			$.app.navigator.open({
				titleid : "titleRemindersMedColorPicker",
				ctrl : "colorPicker",
				ctrlArguments : {
					color : selectedColor
				},
				stack : true
			});
			break;
		}
	}
}

function updateColorBoxRow(color) {
	/**
	 * color box row will always
	 * be in 0th index
	 */
	var rowIndex = 0,
	    currentRow = OS_IOS ? rowIndex : rows[rowIndex].getView();
	rows[rowIndex] = getColorBoxRow(color);
	$.tableView.updateRow(currentRow, rows[rowIndex].getView());
}

function didClickSubmitReminder(e) {

}

function didClickRemoveReminder(e) {

}

exports.init = init;
exports.focus = focus;
