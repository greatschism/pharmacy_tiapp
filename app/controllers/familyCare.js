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
	parentData = result.data.parent_proxy;
	childData = result.data.child_proxy;
	if (!childData || childData === "null") {
		$.familyCareLbl.text = Alloy.Globals.strings.familyCareLblNoProxy;
		$.familyCareAddLbl.text = Alloy.Globals.strings.familyCareLblAdd;
		$.familyCareAddBtn.applyProperties($.createStyle({
			classes : ["icon-add-familycare", "primary-icon-extra-large"]
		}));
	} else {
		parentProxyData = [];
		$.parentProxySection = Ti.UI.createTableViewSection();
		var detailBtnClasses = ["content-detail-secondary-btn-large"];
		parentProxy = {
			title : $.utilities.ucword(Alloy.Models.patient.get("first_name")) || $.utilities.ucword(Alloy.Models.patient.get("last_name")) ? $.utilities.ucword(Alloy.Models.patient.get("first_name")) + " " + $.utilities.ucword(Alloy.Models.patient.get("last_name")) : Alloy.Models.patient.get("email_address"),
			subtitle : $.strings.familyCareLblAcntMgr,
			btnClasses : Alloy.Models.patient.get("patient_id").indexOf("DUMMY") !== -1 ? detailBtnClasses : "",
			masterWidth : 50,
			detailWidth : 50,
			detailTitle : Alloy.Models.patient.get("patient_id").indexOf("DUMMY") !== -1 ? $.strings.titlePrescriptionsAdd : ""
		};
		parentProxyData.push(parentProxy);
		var mgrRow = Alloy.createController("itemTemplates/masterDetailBtn", parentProxy);
		mgrRow.on("clickdetail", addPrescriptions);
		$.parentProxySection.add(mgrRow.getView());
		rows.push(mgrRow);

		if (result && result.data) {
			/**
			 * load fresh data
			 */
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
				childRow.on("clickoption", didClickSwipeOption);
				$.childProxySection.add(childRow.getView());
				rows.push(childRow);
			});

		}
		$.familyMemberAddBtn.applyProperties($.createStyle({
			classes : ["primary-btn"],
			title : $.strings.familyCareMemberBtnAdd
		}));
		$.tableView.setData([$.parentProxySection, $.childProxySection]);
	}
}

function didClickSwipeOption(e) {
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
