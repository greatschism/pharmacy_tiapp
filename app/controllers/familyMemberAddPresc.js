var args = arguments[0] || {},
    moment = require("alloy/moment"),
    store = {};

function init(){
	$.uihelper.getImage("child_add",$.addPrescImg);
}
function focus() {
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
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

function didClickPharmacy(e) {
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
function addPrescriptions(){
	
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
			message : $.strings.familyMemberAddPrescStore
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
function didAddPrescriptions(){
	$.app.navigator.open({
			ctrl : "HIPAA",
			titleid : "titleHIPAAauthorization",
			stack : false
		});
}
exports.setParentView = setParentView;
exports.init = init;
exports.focus = focus;