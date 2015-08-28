var args = arguments[0] || {},
    parentData = [],
    childData = [],
    childRow,
    swipeOptions,
    rows = [];

function focus() {
	$.http.request({
		method : "patient_family_get",
		params : {
			feature_code : "THXXX"
		},
		forceRetry : true,
		success : didGetPatient
	});
	Alloy.Globals.currentTable = $.tableView;
	swipeOptions = [{
		action : 1,
		title : $.strings.familyCareOptRemove,
		type : "negative"
	}];
}

function didGetPatient(result) {

	/**
	 * Alloy.Collections.patients.at(0).get will always return the manager's account.
	 */
	var accntMgrData = Alloy.Collections.patients.at(0);
	parentData = result.data.parent_proxy;
	childData = result.data.child_proxy;
	if (!childData && !parentData) {
		$.familyCareLbl.text = Alloy.Globals.strings.familyCareLblNoProxy;
		$.familyCareAddLbl.text = Alloy.Globals.strings.familyCareLblAdd;
		$.familyCareAddBtn.applyProperties($.createStyle({
			classes : ["icon-add-familycare", "primary-icon-extra-large"]
		}));
	} else {

		mgrData = [];
		$.mgrSection = Ti.UI.createTableViewSection();
		var detailBtnClasses = ["content-detail-secondary-btn-large"];
		mgr = {
			title : accntMgrData.get("title") ? accntMgrData.get("title") : accntMgrData.get("email_address"),
			subtitle : $.strings.familyCareLblAcntMgr,
			btnClasses : accntMgrData.get("patient_id").indexOf("DUMMY") !== -1 ? detailBtnClasses : "",
			masterWidth : 50,
			detailWidth : 50,
			detailTitle : accntMgrData.get("patient_id").indexOf("DUMMY") !== -1 ? $.strings.titlePrescriptionsAdd : ""
		};
		mgrData.push(mgr);
		var mgrRow = Alloy.createController("itemTemplates/masterDetailBtn", mgr);
		mgrRow.on("clickdetail", addPrescriptions);
		$.mgrSection.add(mgrRow.getView());
		rows.push(mgrRow);

		if (result && result.data) {
			/**
			 * load fresh data
			 */
			if (childData) {
				childProxyData = [];
				$.childProxySection = $.uihelper.createTableViewSection($, $.strings.familyCareSectionChildProxy);
				_.each(result.data.child_proxy, function(childProxy) {
					childProxy = {
						child_id : childProxy.child_id,
						link_id : childProxy.link_id,
						title : $.utilities.ucword(childProxy.first_name) || $.utilities.ucword(childProxy.last_name) ? $.utilities.ucword(childProxy.first_name) + " " + $.utilities.ucword(childProxy.last_name) : childProxy.address,
						subtitle : $.strings.familyCareRelatedPrefix + childProxy.related_by,
						detailType : childProxy.link_id ? "negative" : "positive",
						options : swipeOptions,
						detailSubtitle : $.strings[childProxy.link_id ? "familyCareLblStatusPending" : "familyCareLblStatusLinked"]
					};
					childProxyData.push(childProxy);
					childRow = Alloy.createController("itemTemplates/masterDetailSwipeable", childProxy);
					childRow.on("clickoption", didClickChildSwipeOption);
					$.childProxySection.add(childRow.getView());
					rows.push(childRow);
				});
			}
			if (parentData) {
				console.log(parentData);
				parentProxyData = [];
				$.parentProxySection = $.uihelper.createTableViewSection($, $.strings.familyCareSectionParentProxy);
				_.each(result.data.parent_proxy, function(parentProxy) {
					parentProxy = {
						parent_id : parentProxy.parent_id,
						title : $.utilities.ucword(parentProxy.first_name) || $.utilities.ucword(parentProxy.last_name) ? $.utilities.ucword(parentProxy.first_name) + " " + $.utilities.ucword(parentProxy.last_name) : parentProxy.address,
						subtitle : $.strings.familyCareRelatedPrefix + parentProxy.related_by,
						detailType : parentProxy.link_id ? "negative" : "positive",
						options : swipeOptions,
						detailSubtitle : $.strings[parentProxy.link_id ? "familyCareLblStatusPending" : "familyCareLblStatusLinked"]
					};
					parentProxyData.push(parentProxy);
					parentRow = Alloy.createController("itemTemplates/masterDetailSwipeable", parentProxy);
					parentRow.on("clickoption", didClickMgrSwipeOption);
					$.parentProxySection.add(parentRow.getView());
					rows.push(parentRow);
				});
			}

		}
		$.familyMemberAddBtn.applyProperties($.createStyle({
			classes : ["primary-btn"],
			title : $.strings.familyCareMemberBtnAdd
		}));
		$.tableView.setData([$.mgrSection, $.childProxySection, $.parentProxySection]);
	}
}

function didClickChildSwipeOption(e) {
	if (Alloy.Globals.currentRow) {
		Alloy.Globals.currentRow.touchEnd();
	}
	var data = e.data;
	$.http.request({
		method : "patient_family_delete",
		params : {
			feature_code : "THXXX",
			data : [{
				patient : {
					child_id : data.child_id,
					link_id : data.link_id
				}
			}]

		},
		passthrough : data,
		success : didRemoveChild
	});
}

function didClickMgrSwipeOption(e) {
	if (Alloy.Globals.currentRow) {
		Alloy.Globals.currentRow.touchEnd();
	}
	var data = e.data;
	$.http.request({
		method : "patient_family_delete",
		params : {
			feature_code : "THXXX",
			data : [{
				patient : {
					parent_id : data.parent_id,
				}
			}]

		},
		passthrough : data,
		success : didRemoveParent
	});
}

function didRemoveParent(result, passthrough) {
	/**
	 * no need to call the get api
	 * as it is a successful delete
	 * and api is going to return the same data set
	 */
	var params = passthrough;
	rows = _.reject(rows, function(row) {
		if (row.getParams().parent_id === params.parent_id) {
			$.tableView.deleteRow(row.getView());
			return false;
		}
		return true;
	});
}

function didRemoveChild(result, passthrough) {
	/**
	 * no need to call the get api
	 * as it is a successful delete
	 * and api is going to return the same data set
	 */
	var params = passthrough;
	rows = _.reject(rows, function(row) {
		if (row.getParams().link_id === params.link_id) {
			$.tableView.deleteRow(row.getView());
			return false;
		}
		return true;
	});
}

function addPrescriptions() {
	$.app.navigator.open({
		titleid : "titlePrescriptionsAdd",
		ctrl : "familyMemberAddPresc",
		stack : false
	});
}

function didClickAddFamilyMember() {
	$.app.navigator.open({
		titleid : "titleAddFamily",
		ctrl : "familyMemberAdd",
		stack : true
	});

}

exports.focus = focus;
