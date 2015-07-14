var args = arguments[0] || {},
    rows = [],
    prescriptions = args.prescriptions || [],
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
};

function init() {
	$.tableView.bottom = $.tableView.bottom + $.orderRefillBtn.height + $.orderRefillBtn.bottom;
	//prescriptions section
	var iconDict = $.createStyle({
		classes : ["content-header-right-icon", "icon-add"]
	});
	_.extend(iconDict, {
		isIcon : true,
		callback : didClickAdd
	});
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.orderDetSectionList, null, false, false, iconDict);
	//if more than one prescription is there add right icon to remove a prescription
	var isRemovable = prescriptions.length > 1;
	_.each(prescriptions, function(prescription) {
		_.extend(prescription, isRemovable ? removableDict : nonRemovableDict);
		var row = getRow(prescription);
		$.prescSection.add(row.getView());
		rows.push(row);
	});
	$.tableView.setData([$.prescSection]);
}

function didClickAdd(e) {
	$.app.navigator.open({
		titleid : "titleAddPrescriptions",
		ctrl : "prescriptions",
		ctrlArguments : {
			filters : {
				id : _.pluck(prescriptions, "id"),
				refill_status : [Alloy.CFG.apiCodes.refill_status_in_process, Alloy.CFG.apiCodes.refill_status_ready]
			},
			prescriptions : selectedPrescriptions,
			selectable : true
		},
		stack : true
	});
}

function getRow(prescription) {
	var row = Alloy.createController("itemTemplates/masterDetailBtn", prescription);
	row.on("clickdetail", didClickRemove);
	return row;
}

function didClickRemove(e) {
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
	 * if rows.length === 1
	 */
	if (prescriptions.length === 1) {
		var currentCtrl = rows[0],
		    currentRow = currentCtrl.getView(),
		    currentParams = currentCtrl.getParams();
		_.extend(currentParams, nonRemovableDict);
		rows[0] = getRow(currentParams);
		$.tableView.updateRow( OS_IOS ? 0 : currentRow, rows[0].getView());
	}
}

function focus(e) {
	if (selectedPrescriptions.length) {
		/**
		 * make existing first row removable
		 * if rows.length is already > 1 then it would already be removable
		 */
		if (rows.length == 1) {
			var currentCtrl = rows[0],
			    currentRow = currentCtrl.getView(),
			    currentParams = currentCtrl.getParams();
			_.extend(currentParams, removableDict);
			rows[0] = getRow(currentParams);
			$.tableView.updateRow( OS_IOS ? 0 : currentRow, rows[0].getView());
		}
		_.each(selectedPrescriptions, function(prescription) {
			prescriptions.push(prescription);
			_.extend(prescription, removableDict);
			var row = getRow(prescription);
			$.tableView.insertRowAfter($.prescSection.rowCount - 1, row.getView());
			rows.push(row);
		});
	}
	selectedPrescriptions = [];
}

function terminate(e) {
	//destroy prescriptions array
	prescriptions = null;
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
