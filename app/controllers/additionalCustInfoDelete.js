var args = $.args,
	logger = require("logger"),
	field_data = args.field_data,
	//existing_data = args.user_data,
	inputBoxIds = [],
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
		createViewFunc(field_data);
	}	

	function createViewFunc(data) {	
		for(var i = 0; i < existing_data.length; i++) {
			var hintText = data[i].field_name;
			var fields = data[i].field_type;
			switch(fields) {
				case "text":
					var inputBoxId = "$.inputBox"+i;
					LabelView = $.UI.create("View", {
						classes : ["auto-height", "inactive-light-bg-color", "role-header-view", "margin-bottom"]
					});

					LabelView.add($.UI.create("Label", {
						apiName : "Label",
						classes : ["margin-left", "margin-top", "margin-bottom", "h5", "inactive-fg-color"],
						text : data[i].field_name
					}));
				
					textBoxView = $.UI.create("View", {
						classes : ["margin-top", "margin-bottom", "margin-left", "margin-right", "auto-height", "vgroup", "border"]
					});
					inputBoxId = Alloy.createWidget("ti.textfield", "widget", $.createStyle({
						classes : ["top", "left", "right", "txt", "border-disabled"],
						hintText : hintText,
						analyticsId : "textBox"
					}));
					textBoxView.add(inputBoxId.getView());
					$.headerView.add(LabelView);
					$.headerView.add(textBoxView);
					inputBoxIds.push(inputBoxId);
					break;
					
				case "radio":
					break;
					
					
			}
		}
		
		for(var i = 0; i < existing_data.length; i++) {
			for(var j = 0; j < field_data.length; j++) {
				if(existing_data[i]) {
					if(existing_data[i].field_id === field_data[j].id) {
						inputBoxIds[j].setValue(existing_data[i].field_value);
						inputBoxIds[j].setIcon("", "right", $.createStyle({
							classes : ["top-disabled", "left-disabled", "right", "width-20", "i5", "txt-right", "bg-color-disabled", "negative-fg-color", "border-disabled", "icon-filled-remove"],
							accessibilityLabel: Alloy.Globals.strings.iconAccessibilityLblRemove,
							id : "removeBtn"
						}));
						inputBoxIds[j].addEventListener("click", didClickRemove);
					}
				}
			}
		}
		
	}
	
	function didClickRemove(e) {
		for(var i = 0; i < field_data.length; i++) {
			for(var j = 0; j < field_data.length; j++) {
				if(existing_data[i]) {
					if(existing_data[i].field_id === field_data[j].id) {
						cust_data = {
							"field_id" : existing_data[i].field_id,
							"field_value" : existing_data[i].field_value
						};
					}
				}
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
			message : result.message
		});
		for(var i = 0; i < inputBoxIds.length; i++) {
			inputBoxIds[i].setValue("");
		}
	}
 	
 	function didFail(result) {
		// $.uihelper.showDialog({
			// message : result.message
		// });
	}
	
	
exports.init = init;