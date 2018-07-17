var args = $.args,
	logger = require("logger"),
	field_data = args.field_data,
	inputBoxIds = [],
	LabelViewIds = [],
	textBoxViewIds = [],
	data_len = 0,
	cust_data;

function init() {
 	httpClient = $.http.request({
		 method : "get_additional_cust_info",
		 showLoader : false,
		 success : didGetData
	 });
	}
	
	function didGetData(result) {
		existing_data = result.data.records;
		if(existing_data.length) {
			data_len = existing_data.length;
			createViewFunc(field_data);
		}
		else {
			$.uihelper.showDialog({
				message : Alloy.Globals.strings.adCustInfoNoDataFoundMessage,
				buttonNames : [Alloy.Globals.strings.dialogBtnOK],
				cancelIndex : 0,
				cancel : function didClickOK() {
					$.app.navigator.close();
				}
			});
		}
	}	

	function createViewFunc(data) {
		for(var i = 0; i < data.length; i++) {
			for(var j = 0; j < data.length; j++) {
				if(existing_data[i] && existing_data[i].field_id === data[j].id) {
					var hintText = data[j].field_name;
					var fields = data[j].field_type;
					switch(fields) {
						case "text":
							var LabelViewId = "LabelView"+i, textBoxViewId = "textBoxView"+i, inputBoxId = "$.inputBox"+i;
							LabelViewId = $.UI.create("View", {
								classes : ["auto-height", "inactive-light-bg-color", "role-header-view", "margin-bottom"]
							});
			
							LabelViewId.add($.UI.create("Label", {
								apiName : "Label",
								classes : ["margin-left", "margin-top", "margin-bottom", "h5", "inactive-fg-color"],
								text : data[j].field_name
							}));
						
							textBoxViewId = $.UI.create("View", {
								classes : ["margin-top", "margin-bottom", "margin-left", "margin-right", "auto-height", "vgroup", "border"]
							});
							inputBoxId = Alloy.createWidget("ti.textfield", "widget", $.createStyle({
								classes : ["top", "left", "right", "txt", "border-disabled"],
								hintText : hintText,
								analyticsId : "textBox"
							}));
							textBoxViewId.add(inputBoxId.getView());
							$.headerView.add(LabelViewId);
							$.headerView.add(textBoxViewId);
							inputBoxIds.push(inputBoxId);
							LabelViewIds.push(LabelViewId);
							textBoxViewIds.push(textBoxViewId);
							_.extend(inputBoxIds[i], {
								field_id : existing_data[i].field_id
							});
							
							inputBoxIds[i].setValue(existing_data[i].field_value);
							inputBoxIds[i].setIcon("", "right", $.createStyle({
								classes : ["top-disabled", "left-disabled", "right", "width-20", "i5", "txt-right", "bg-color-disabled", "negative-fg-color", "border-disabled", "icon-filled-remove"],
								accessibilityLabel: Alloy.Globals.strings.iconAccessibilityLblRemove,
								id: "removeBtn",
								field_id: existing_data[i].field_id
							}));
							inputBoxIds[i].addEventListener("click", didClickRemove);
							
							break;	
					}
				}
			}
		}	
	}
	
	function didClickRemove(e) {
		for(var i = 0; i < field_data.length; i++) {
			if(existing_data[i] && existing_data[i].field_id === e.source.field_id) {
				cust_data = {
					"field_id" : existing_data[i].field_id,
					"field_value" : existing_data[i].field_value
				};
				break;
			}
		}
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.AdditionalDataDeleteConfirm,
			buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
			cancelIndex : 1,
			success : function didConfirmDelete() {
				httpClient = $.http.request({
					method : "update_additional_customer_info",
					params : {
						filter : {
							action : "delete"
						},
						data : [cust_data]
					},
					success : didRemove,
					failure : didFail
				});
			}
		});
 	}
 	
 	function didRemove(result) {
 		$.uihelper.showDialog({
			message : result.message,
			buttonNames : [Alloy.Globals.strings.dialogBtnOK],
			cancelIndex : 0,
			cancel : function didClickOK() {
				for(var i = 0; i < inputBoxIds.length; i++) {
					if(inputBoxIds[i].field_id === cust_data.field_id)
						{
							$.headerView.remove(LabelViewIds[i]);
							$.headerView.remove(textBoxViewIds[i]);
							data_len--;
						}
				}
				if(data_len === 0) {
					$.app.navigator.close();
				}
			}
		});	
	}
 	
 	function didFail(result) {
		// $.uihelper.showDialog({
			// message : result.message
		// });
	}
	
	
exports.init = init;