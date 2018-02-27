var args = $.args,
    authenticator = require("authenticator"),
    apiCodes = Alloy.CFG.apiCodes,
    promptClasses = ["left", "width-60"],
    childClassesSelected = ["margin-right", "i5", "primary-fg-color", "icon-thin-filled-success", "accessibility-disabled", "touch-enabled", "bubble-enabled"],
    childClassesUnselected = ["margin-right", "i5", "inactive-fg-color", "icon-spot", "accessibility-disabled", "touch-enabled", "bubble-enabled"],
    rows = [],
    options;

function init() {
	//tableview form top
	$.tableView.top = 0;
	getRxStausNoticeValues();
}

function getRxStausNoticeValues() {
	$.http.request({
		method : "patient_rx_notification_types",
		keepLoader : true,
		success : prepareData,
		errorDialogEnabled : true
	});
}

function prepareData(result) {
	$.app.navigator.hideLoader();

	if (!result.data) {
		//show error
	} else {

		options = result.data;
		var data = [];

		_.each(options, function(type) {
			var row = Alloy.createController("itemTemplates/promptReply", {
				reminderId : "app",
				reminderDeliveryMode : "app_rx_status_notification",
				prefColumn : "app_rx_status_notification",
				prompt : type.notification_name,
				promptClasses : promptClasses,
				childClasses : type.is_enabled == "1" ? childClassesSelected : childClassesUnselected,
				selected : type.is_enabled == "1" ? true : false,
				hasChild : true
			});

			rows.push(row);
			data.push(row.getView());
		});

		//set data
		$.tableView.setData(data);
	}
}

function didClickTableView(e) {
	var index = e.index;
	var params = rows[index].getParams(), row = rows[index];
	$.logger.debug("\n\n\n row params\t",JSON.stringify(params,null,4),"\n\n\n");
	
	_.extend(params, {
				childClasses : params.selected == true ? childClassesUnselected : childClassesSelected,
				selected : !params.selected
			});
				
	$.logger.debug("\n\n\n row params\t",JSON.stringify(params,null,4),"\n\n\n");

	rows[index] = Alloy.createController("itemTemplates/promptReply", params);
	$.tableView.updateRow( OS_IOS ? index : row.getView(), rows[index].getView());
}


function terminate() {
}

exports.init = init;
exports.terminate = terminate;
