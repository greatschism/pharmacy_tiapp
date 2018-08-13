var args = $.args,
	logger = require("logger"),
	navigationHandler = require("navigationHandler"),
	inputData = [],
	no_of_fields,
	resultset,
	inputBoxIds = [],
	existing_data = [],
	regex_validator,
	init_called = 0;
	is_delete_flow = 0;
 
	function init() {
		init_called = 1;
	 	httpClient = $.http.request({
			method : "get_addional_cust_conf",
			params : {
				data : [{
					menu_mapping_id : args
				}]
			},
			showLoader : false,
			success : didGetConfigs
		});
		
	}
	
	function focus() {
		if(!init_called) {
			init_called = 1;
			is_delete_flow = 1;
			httpClient = $.http.request({
				 method : "get_additional_cust_info",
				 showLoader : false,
				 success : didGetData
			 });
		}
		if(inputBoxIds.length) {
			for(var i = 0; i < inputBoxIds.length; i++) {
				inputBoxIds[i].setValue("");
			}
		}
	}
	
	function didGetConfigs(result) {
		no_of_fields = result.data.records.length;
		if(!no_of_fields) {
			$.uihelper.showDialog({
				message : Alloy.Globals.strings.adCustInfoNoDataFoundMessage,
				buttonNames : [Alloy.Globals.strings.dialogBtnOK],
				cancelIndex : 0,
				cancel : function didClickOK() {
					navigationHandler.navigate(Alloy.Collections.menuItems.findWhere({
						landing_page : true
					}).toJSON());
				}
			});
		}
		else {
			sortingFunc(result.data);
		}
	}
	
	function sortingFunc(data) {
		for(var i = 0; i < data.records.length-1; i++) {
			for(var j = i+1; j < data.records.length; j++) {
				if(data.records[i].field_display_position > data.records[j].field_display_position) {
					var temp = data.records[i];
					data.records[i] = data.records[j];
					data.records[j] = temp;
				}
			}
		}
		resultset = data.records;
		
		httpClient = $.http.request({
			 method : "get_additional_cust_info",
			 showLoader : false,
			 success : didGetData
		 });
			
	}
	
	function didGetData(result) {
		if(!result.data.records.length) {
			$.rightNavBtn.getNavButton().hide();
			$.rightNavBtn.getNavButton().removeEventListener("click", didClickRightNav);
		}
		else {
			$.rightNavBtn.getNavButton().show();
			$.rightNavBtn.getNavButton().addEventListener("click", didClickRightNav);
		}
		existing_data = result.data.records;
		createViewFunc(resultset);
	}	
	
	function createViewFunc(data) {	
		if(!is_delete_flow) {
			for(var i = 0; i < data.length; i++) {
				var hintText = data[i].field_name;
				regex_validator = data[i].field_regex;
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
				}
			}
		}
			
			for(var i = 0; i < resultset.length; i++) {
				for(var j = 0; j < resultset.length; j++) {
					if(existing_data[i] && existing_data[i].field_id === resultset[j].id) {
						inputBoxIds[j].setValue(existing_data[i].field_value);
					}
				}
			}
			
		if(!is_delete_flow) {

			var btn = $.UI.create("Button", {
				apiName : "Button",
				classes : ["margin-bottom", "primary-bg-color", "primary-font-color", "primary-border"],
				title : $.strings.additionalCustInfoBtnSubmit,
				analyticsId : "SubmitBtn"
			});
			$.addListener(btn, "click", didClickSubmit);
			$.headerView.add(btn);
		}
	}
	
	function didClickSubmit(e) {
		for(var i = 0; i < no_of_fields; i++) {
			var temp = {
				"field_id" : resultset[i].id,
				"field_value" : inputBoxIds[i].getValue()
			};
			
			if(temp.field_value != null && temp.field_value != "") {
				inputData.push(temp);
			}		
		}
		
		httpClient = $.http.request({
			method : "update_additional_customer_info",
			params : {
				filter : {
					action : "update"
				},
				data : inputData
			},
			success : didUpdate,
			failure : didFail
		});
	
		inputData = [];
		
	}
	
	function didUpdate(result) {
		$.rightNavBtn.getNavButton().show();
		$.rightNavBtn.getNavButton().addEventListener("click", didClickRightNav);
		$.uihelper.showDialog({
			message : result.message
		});
	}
	
	function didFail(result) {
		// $.uihelper.showDialog({
			// message : result.message
		// });
	}
 	
 		
 	function didClickRightNav() {
 		init_called = 0;
	  	is_delete_flow = 1;
 		$.app.navigator.open({
		  titleid : "titleRewardCards",
		  ctrl : "additionalCustInfoDelete",
		  ctrlArguments : {
			  field_data : resultset
		  },
		  stack : true
	  });
 	}

 	

exports.init = init;
exports.focus = focus;
