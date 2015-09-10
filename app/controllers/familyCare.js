var args = arguments[0] || {},
    parentData = [],
    childData = [],
    accntMgrData = [],
    authenticator = require("authenticator"),
    childRow,
    mode,
    address,
    swipeRemoveOptions,
    swipeRemoveResendOptions,
    rows = [];

function focus() {
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			didGetPatient();
		}
	});
	Alloy.Globals.currentTable = $.tableView;
}

function didGetPatient() {
	swipeRemoveOptions = [{
		action : 0,
		title : $.strings.familyCareOptRemove,
		type : "negative"
	}];
	swipeRemoveResendOptions = [{
		action : 0,
		title : $.strings.familyCareOptRemove,
		type : "negative"
	}, {
		action : 1,
		title : $.strings.familyCareOptResend,
		type : "positive"
	}];
	/**
	 * Alloy.Collections.patients.at(0).get will always return the manager's account.
	 */

	accntMgrData = Alloy.Collections.patients.at(0);
	parentData = Alloy.Collections.patients.at(0).get("parent_proxy");
	childData = Alloy.Collections.patients.at(0).get("child_proxy");
	/**
	 * If there are no children proxies or no parent proxies,
	 * do not show any sections, set the tableview data to null.
	 */
	if (!childData && !parentData) {
		if (!$.familyCareLbl) {
			$.familyCareLbl = Ti.UI.createLabel();
			$.familyCareLbl.text = Alloy.Globals.strings.familyCareLblNoProxy;
			$.familyCareLbl.applyProperties($.createStyle({
				classes : ["lbl-centered-wrap", "margin-top", "margin-bottom"]
			}));
			$.familyCareView.add($.familyCareLbl);
		}
		if (!$.familyCareAddLbl) {
			$.familyCareAddLbl = Ti.UI.createLabel();
			$.familyCareAddLbl.text = Alloy.Globals.strings.familyCareLblAdd;
			$.familyCareAddLbl.applyProperties($.createStyle({
				classes : ["subtitle-centered-wrap", "margin-bottom"]
			}));
			$.familyCareView.add($.familyCareAddLbl);
		}
		if (!$.familyCareAddBtn) {
			$.familyCareAddBtn = Ti.UI.createButton();
			$.familyCareAddBtn.applyProperties($.createStyle({
				classes : ["icon-add-familycare", "primary-icon-extra-large"]
			}));
			$.familyCareView.add($.familyCareAddBtn);
			$.familyCareAddBtn.addEventListener("click", didClickAddFamilyMember);
		}
		$.tableView.setData([]);
		$.familyCareView.remove($.familyMemberAddBtn);
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
		/**
		 * load fresh data
		 */
		if (childData) {
			var childProxyData = [],
			    status = "",
			    colorCode = "";
			$.childProxySection = $.uihelper.createTableViewSection($, $.strings.familyCareSectionChildProxy);
			_.each(childData, function(childProxy) {
				switch(childProxy.status) {
				case "0":
					status = $.strings.familyCareLblStatusPending;
					colorCode = "negative";
					break;
				case "1":
					status = $.strings.familyCareLblStatusLinked;
					colorCode = "positive";
					break;
				case "2":
					status = $.strings.familyCareLblStatusDeclined;
					colorCode = "positive";
					break;
				}
				childProxy = {
					child_id : childProxy.child_id,
					link_id : childProxy.link_id,
					title : $.utilities.ucword(childProxy.first_name) || $.utilities.ucword(childProxy.last_name) ? $.utilities.ucword(childProxy.first_name) + " " + $.utilities.ucword(childProxy.last_name) : childProxy.address,
					subtitle : $.strings.familyCareRelatedPrefix + childProxy.related_by,
					detailType : colorCode,
					options : childProxy.status === "2" ? swipeRemoveResendOptions : swipeRemoveOptions,
					detailSubtitle : status
				};
				childProxyData.push(childProxy);
				childRow = Alloy.createController("itemTemplates/masterDetailSwipeable", childProxy);
				childRow.on("clickoption", didClickChildSwipeOption);
				$.childProxySection.add(childRow.getView());
				rows.push(childRow);
			});
		}
		if (parentData) {
			parentProxyData = [];
			$.parentProxySection = $.uihelper.createTableViewSection($, $.strings.familyCareSectionParentProxy);
			_.each(parentData, function(parentProxy) {
				switch(parentProxy.status) {
				case "0":
					status = $.strings.familyCareLblStatusPending;
					colorCode = "negative";
					break;
				case "1":
					status = $.strings.familyCareLblStatusLinked;
					colorCode = "positive";
					break;
				case "2":
					status = $.strings.familyCareLblStatusDeclined;
					colorCode = "positive";
					break;
				}
				parentProxy = {
					parent_id : parentProxy.parent_id,
					title : $.utilities.ucword(parentProxy.first_name) || $.utilities.ucword(parentProxy.last_name) ? $.utilities.ucword(parentProxy.first_name) + " " + $.utilities.ucword(parentProxy.last_name) : parentProxy.address,
					detailType : colorCode,
					options : parentProxy.status === "2" ? swipeRemoveResendOptions : swipeRemoveOptions,
					detailSubtitle : status
				};
				parentProxyData.push(parentProxy);
				parentRow = Alloy.createController("itemTemplates/masterDetailSwipeable", parentProxy);
				parentRow.on("clickoption", didClickMgrSwipeOption);
				$.parentProxySection.add(parentRow.getView());
				rows.push(parentRow);
			});
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
	var phone = $.utilities.validatePhoneNumber(data.title);
	if (phone) {
		mode = $.strings.familyMemberInviteModeText;
		address = data.title;
	} else {
		mode = $.strings.familyMemberInviteModeEmail;
		address = data.title;
	}
	switch(e.action) {
	/**
	 * Index 0: Remove button pressed
	 * Operations to remove the child.
	 */
	case 0:
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.familyCareMsgChildRemove,
			buttonNames : [Alloy.Globals.strings.dialogBtnYes, Alloy.Globals.strings.dialogBtnCancel],
			cancelIndex : 1,
			success : function() {

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
		});
		break;
	/**
	 * Index 1: Resend button pressed
	 * Operations to resend an invite to the proxy
	 */
	case 1:
		$.http.request({
			method : "patient_family_invite_resend",
			params : {
				feature_code : "THXXX",
				data : [{
					patient : {
						mode : mode,
						address : address
					}
				}]

			},
			passthrough : data,
			success : didResendInvite
		});
		break;
	}
}

function didResendInvite(result) {
	$.uihelper.showDialog({
		message : result.message
	});
}
function didClickMgrSwipeOption(e) {
	if (Alloy.Globals.currentRow) {
		Alloy.Globals.currentRow.touchEnd();
	}
	var data = e.data;
	var phone = $.utilities.validatePhoneNumber(data.title);
	if (phone) {
		mode = $.strings.familyMemberInviteModeText;
		address = data.title;
	} else {
		mode = $.strings.familyMemberInviteModeEmail;
		address = data.title;
	}
	switch(e.action) {
	/**
	 * Index 0: Remove button pressed
	 * Operations to remove the child.
	 */
	case 0:

		$.uihelper.showDialog({
			message : Alloy.Globals.strings.familyCareMsgParentRemove,
			buttonNames : [Alloy.Globals.strings.dialogBtnYes, Alloy.Globals.strings.dialogBtnCancel],
			cancelIndex : 1,
			success : function() {
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
		});
		break;
	/**
	 * Index 1: Resend button pressed
	 * Operations to resend an invite to the proxy
	 */
	case 1:
		$.http.request({
			method : "patient_family_invite_resend",
			params : {
				feature_code : "THXXX",
				data : [{
					patient : {
						mode : mode,
						address : address
					}
				}]

			},
			passthrough : data,
			success : didResendInvite
		});
		break;
	}
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
			return true;
		}
		return false;
	});
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			if (!Alloy.Collections.patients.at(0).get("parent_proxy")) {
				didGetPatient();
			}
		}
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
		if (params.link_id) {
			if (row.getParams().link_id === params.link_id) {
				$.tableView.deleteRow(row.getView());
				return true;
			}
			return false;

		} else if (params.child_id) {
			if (row.getParams().child_id === params.child_id) {
				$.tableView.deleteRow(row.getView());
				return true;
			}
			return false;

		}
	});
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			if (!Alloy.Collections.patients.at(0).get("child_proxy")) {
				didGetPatient();
			}
		}
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
	if (Alloy.Globals.currentRow) {
		 Alloy.Globals.currentRow.touchEnd();
	}
	$.app.navigator.open({
		titleid : "titleAddFamily",
		ctrl : "familyMemberAdd",
		stack : true
	});
}
function didClickTableView(e){
	if (Alloy.Globals.currentRow) {
		return Alloy.Globals.currentRow.touchEnd();
	}
}

exports.focus = focus;
