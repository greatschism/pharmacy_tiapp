var args = arguments[0] || {},
    moment = require("alloy/moment"),
    store = {},
    rxContainerViewFromTop = 0,
    isFamilyMemberFlow;
function init() {
	if (args.dob) {
		$.dobDp.setValue(args.dob);
	}
	$.uihelper.getImage("child_add", $.childImg);
	$.rxNoTxt.tooltip = $.strings.msgRxNumberTips;
	$.rxContainer.addEventListener("postlayout", didPostlayoutRxContainerView);
}

function focus() {
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
	if (store && store.shouldUpdate) {
		store.shouldUpdate = false;
		$.storeTitleLbl.text = store.title;
	}
	isFamilyMemberFlow = $.utilities.getProperty("familyMemberFlow", false, "bool", true);
	if (!isFamilyMemberFlow) {
		$.skipBtn.applyProperties($.createStyle({
			classes : ["margin-top", "secondary-btn"]
		}));
	}
}

function didChangeRx(e) {
	var value = $.utilities.formatRx(e.value),
	    len = value.length;
	$.rxNoTxt.setValue(value);
	$.rxNoTxt.setSelection(len, len);
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

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didClickContinue() {
	isFamilyMemberFlow = $.utilities.getProperty("familyMemberFlow", false, "bool", true);
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    rxNo = $.rxNoTxt.getValue(),
	    dob = $.dobDp.getValue();

	if (!fname) {
		$.uihelper.showDialog({
			message : $.strings.childAddValFirstName
		});
		return;
	}
	if (!$.utilities.validateName(fname)) {
		$.uihelper.showDialog({
			message : $.strings.childAddValFirstNameInvalid
		});
		return;
	}
	if (!lname) {
		$.uihelper.showDialog({
			message : $.strings.childAddValLastName
		});
		return;
	}
	if (!$.utilities.validateName(lname)) {
		$.uihelper.showDialog({
			message : $.strings.childAddValLastNameInvalid
		});
		return;
	}
	if (!dob) {
		$.uihelper.showDialog({
			message : $.strings.childAddValDob
		});
		return;
	}
	if (!rxNo) {
		$.uihelper.showDialog({
			message : $.strings.childAddValRxNo
		});
		return;
	}
	if (!$.utilities.validateRx(rxNo)) {
		$.uihelper.showDialog({
			message : $.strings.childAddValRxNoInvalid
		});
		return;
	}
	if (_.isEmpty(store)) {
		$.uihelper.showDialog({
			message : $.strings.childValStore
		});
		return;
	}
	var childDetails = {
		is_adult : false,
		is_existing_user : false,
		email : "",
		mobile : "",
		related_by : args.familyRelationship ? args.familyRelationship : "",
		user_name : "",
		password : "",
		first_name : fname,
		last_name : lname,
		birth_date : moment(dob).format(Alloy.CFG.apiCodes.dob_format),
		rx_number : rxNo.substring(0, 7),
		store_id : store.id
	};
	var age = getAge(dob);
	if (age >= 18) {
		$.uihelper.showDialog({
			message : $.strings.childAddAccntInvalid
		});
		return;
	} else if (age >= 12 && age <= 17) {
		if (isFamilyMemberFlow) {
			$.http.request({
				method : "patient_family_add",
				params : {
					feature_code : "THXXX",
					data : [{
						patient : {
							is_adult : false,
							is_existing_user : false,
							email : "",
							mobile : "",
							related_by : args.familyRelationship ? args.familyRelationship : "",
							user_name : "",
							password : "",
							first_name : fname,
							last_name : lname,
							birth_date : moment(dob).format(Alloy.CFG.apiCodes.dob_format),
							rx_number : rxNo.substring(0, 7),
							store_id : store.id
						}
					}]
				},
				success : didAddChild
			});

		} else {
			$.app.navigator.open({
				titleid : "titleChildConsent",
				ctrl : "childConsent",
				ctrlArguments : {
					username : args.username,
					childDetails : childDetails
				},
				stack : true
			});
		}

	} else {

		$.http.request({
			method : "patient_family_add",
			params : {
				feature_code : "THXXX",
				data : [{
					patient : {
						is_adult : false,
						is_existing_user : false,
						email : "",
						mobile : "",
						related_by : args.familyRelationship ? args.familyRelationship : "",
						user_name : "",
						password : "",
						first_name : fname,
						last_name : lname,
						birth_date : moment(dob).format(Alloy.CFG.apiCodes.dob_format),
						rx_number : rxNo.substring(0, 7),
						store_id : store.id
					}
				}]
			},
			success : didAddChild
		});
	}
}

function didAddChild(result) {
	if (isFamilyMemberFlow) {
		$.app.navigator.open({
			titleid : "titleTextBenefits",
			ctrl : "textBenefits",
			ctrlArguments : {
				familyRelationship : args.familyRelationship
			},
			stack : true
		});

	} else {
		$.app.navigator.open({
			titleid : "titleChildSuccess",
			ctrl : "childSuccess",
			ctrlArguments : {
				username : args.username
			},
			stack : false

		});
	}
}

/**
 *
 * @param {Object} dateString
 * Get the age of the user
 * If the user is 18 yrs old, do not let him create the account
 * If the user is 12-17 yrs old, take him to the consent screen
 * If the user is less than 12 yrs, successfully create the account
 */
function getAge(dateString) {
	var today = new Date();
	var birthDate = new Date(dateString);
	var age = today.getFullYear() - birthDate.getFullYear();
	var m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}

function didClickSkip() {
	$.app.navigator.open({
		titleid : "titleFamilyCare",
		ctrl : "childAccountTips",
		stack : true
	});
}

function setParentView(view) {
	$.dobDp.setParentView(view);
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

function didClickAgreement(e) {
	$.app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : true,
		ctrlArguments : {
			registrationFlow : true
		}
	});
}

exports.setParentView = setParentView;
exports.focus = focus;
exports.init = init;
