var args = $.args,
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    rx = require("rx"),
    rightButtonDict = $.createStyle({
	classes : ["margin-right", "i5", "active-fg-color", "bg-color-disabled", "touch-enabled", "rx-hintext"],
}),
    rightButtonTitle = $.createStyle({
	classes : ["icon-help"]
}),
    rxContainerViewFromTop = 0,
    store = {};
function init() {
	/**
	 * PHA-1425 : Add the help image
	 * inside the rx number textfield.
	 */
	setRightButton(rightButtonTitle.text, rightButtonDict);
	$.uihelper.getImage("child_add", $.addPrescImg);
		$.rxNoTxt.tooltip = $.strings.msgRxNumberTips;
		$.rxTooltip.updateArrow($.createStyle({
			classes : ["direction-down"]
		}).direction, $.createStyle({
			classes : ["i5", "inactive-fg-color", "icon-filled-arrow-down"]
		}));
	
	$.rxContainer.addEventListener("postlayout", didPostlayoutRxContainerView);
	$.fnameTxt.setValue(args.first_name);
	$.lnameTxt.setValue(args.last_name);
	var dob = moment(args.birth_date, Alloy.CFG.apiCodes.dob_format),
	    date = new Date();
	date.setFullYear(dob.year(), dob.month(), dob.date());
	$.dobDp.setValue(date);
}

function setRightButton(iconText, iconDict) {
	$.rxNoTxt.setIcon(iconText, "right", iconDict);
}

function focus() {
	$.addPrescTitle.text = String.format($.strings.familyMemberAddPrescTitle, $.strings.strClientName);
	/**
	 * Alloy.Collections.patients.at(0).get will always return the manager's account.
	 */
	var mgrData = Alloy.Collections.patients.at(0);
	var height = $.uihelper.getHeightFromChildren($.nameView);
	$.nameVDividerView.height = height;;
	if (store && store.shouldUpdate) {
		store.shouldUpdate = false;
		$.storeTitleLbl.text = store.title;
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
			selectable : true,
			UpdatePartialAccount : true
		},
		stack : true
	});
}

function setParentView(view) {
	$.dobDp.setParentView(view);
}

function didChangeRx(e) {
	var value = rx.format(e.value),
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
	if (!rx.validate(rxNo)) {
		$.uihelper.showDialog({
			message : String.format($.strings.familyMemberAddPrescValRxNoInvalid, parseInt(Alloy.Globals.rx_max))
		});
		return;
	}
	if (_.isEmpty(store)) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddPrescValStore
		});
		return;
	}
	/**
	 * If the user is <18, stop him from registration. He shall contact the support for assistance
	 */
	if (moment().diff(dob, "years", true) < 18) {
		$.uihelper.showDialog({
			message : String.format(Alloy.Globals.strings.msgAgeRestriction, Alloy.Models.appload.get("supportphone")),
		});
		return;
	}
	$.http.request({
		method : "patient_family_add_fullacount",
		params : {
			data : [{
				patient : {
					first_name: fname,
            		last_name: lname,
                	birth_date: moment(dob).format(Alloy.CFG.apiCodes.dob_format),
					rx_number : rxNo,
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
				ctrl : "hipaa",
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
	var top = $.rxContainer.rect.height,
	    margin = $.rxContainer.bottom;
	$.rxTooltip.applyProperties({
		top : top - margin
	});
	$.rxTooltip.show();
}

function didClickHelp(e) {
	$.app.navigator.open({
		titleid : "titleRxSample",
		ctrl : "rxSample",
		stack : true
	});
}

exports.setParentView = setParentView;
exports.init = init;
exports.focus = focus;
