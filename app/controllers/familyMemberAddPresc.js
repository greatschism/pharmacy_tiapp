var args = arguments[0] || {},
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    rxContainerViewFromTop = 0,
    store = {};

function init() {
	$.uihelper.getImage("child_add", $.addPrescImg);
	$.rxNoTxt.tooltip = $.strings.msgRxNumberTips;
	$.rxContainer.addEventListener("postlayout", didPostlayoutRxContainerView);
}

function focus() {
	$.addPrescTitle.text = String.format($.strings.familyMemberAddPrescTitle, Alloy.CFG.client_name);
	/**
	 * Alloy.Collections.patients.at(0).get will always return the manager's account.
	 */
	var mgrData = Alloy.Collections.patients.at(0);
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
	if (store && store.shouldUpdate) {
		store.shouldUpdate = false;
		$.storeTitleLbl.text = store.title;
	}
	if (mgrData.get("first_name")) {
		$.fnameTxt.setValue(mgrData.get("first_name"));
	}
	if (mgrData.get("last_name")) {
		$.lnameTxt.setValue(mgrData.get("last_name"));
	}

	if (mgrData.get("birth_date")) {
		var dob = moment(mgrData.get("birth_date"), Alloy.CFG.apiCodes.dob_format).toDate();
		$.dobDp.setValue(dob);
	}
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didClickPharmacy() {
	$.app.navigator.open({
		titleid : "titleStores",
		ctrl : "stores",
		ctrlArguments : {
			store : store,
			selectable : true
		},
		stack : true
	});
}

function setParentView(view) {
	$.dobDp.setParentView(view);
}

function didChangeRx(e) {
	var value = $.utilities.formatRx(e.value),
	    len = value.length;
	$.rxNoTxt.setValue(value);
	$.rxNoTxt.setSelection(len, len);
}

function addPrescriptions() {

	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    rxNo = $.rxNoTxt.getValue(),
	    dob = $.dobDp.getValue();

	if (!fname) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddPrescValFirstName
		});
		return;
	}
	if (!$.utilities.validateName(fname)) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddPrescValFirstNameInvalid
		});
		return;
	}
	if (!lname) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddPrescValLastName
		});
		return;
	}
	if (!$.utilities.validateName(lname)) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddPrescValLastNameInvalid
		});
		return;
	}
	if (!dob) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddPrescValDob
		});
		return;
	}
	if (!rxNo) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddPrescValRxNo
		});
		return;
	}
	if (!$.utilities.validateRx(rxNo)) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddPrescValRxNoInvalid
		});
		return;
	}
	if (_.isEmpty(store)) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddPrescValStore
		});
		return;
	}
	$.http.request({
		method : "patient_family_add_fullacount",
		params : {
			feature_code : "THXXX",
			data : [{
				patient : {
					rx_number : rxNo.substring(0, 7),
					store_id : store.id
				}
			}]
		},
		success : didAddPrescriptions
	});
}

function didAddPrescriptions() {
	$.utilities.setProperty("familyMemberAddPrescFlow", true, "bool", true);
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			$.app.navigator.open({
				ctrl : "HIPAA",
				titleid : "titleHIPAAauthorization",
				stack : false
			});
		}
	});
}

function didClickTooltip(e) {
	e.source.hide();
}

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
}

function didBlurFocusRx() {
	$.rxTooltip.hide();
}

function didPostlayoutRxContainerView(e) {
	rxContainerViewFromTop = e.source.rect.y;
}

function didFocusRx(e) {
	if (_.has($.rxTooltip, "size")) {
		$.rxTooltip.applyProperties({
			top : (rxContainerViewFromTop + Alloy.TSS.content_view.top / 2) - $.rxTooltip.size.height
		});
		delete $.rxTooltip.size;
	}
	$.rxTooltip.show();
}

exports.setParentView = setParentView;
exports.init = init;
exports.focus = focus;
