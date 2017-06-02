var args = $.args,
    moment = require("alloy/moment"),
    store = {},
    rxContainerViewFromTop = 0,
     strDateFormat = "ddd MMM DD YYYY HH:mm:ss",
    authenticator = require("authenticator"),
     rightButtonDict = $.createStyle({
	classes : ["txt-tertiary-right-icon"],
}),
    rightButtonTitle = $.createStyle({
	classes : ["icon-help"]
}),
    rx = require("rx"),
    logger = require("logger");

function init() {
	/**
	 * PHA-1425 : Add the help image 
	 * inside the rx number textfield.
	 */
	setRightButton(rightButtonTitle.text, rightButtonDict);
	if (args.dob) {
		$.dobDp.setValue(args.dob);
	} else {
		date = new Date();
		date.setFullYear(date.getFullYear()-1);
		$.dobDp.setValue(date);
	}
    var iDict = {};
	iDict.accessibilityValue = $.strings.dobAccessibilityLbl;
    $.dobDp.__views.widget.applyProperties(iDict);

	$.uihelper.getImage("child_add", $.childImg);
	$.__views.childImg.accessibilityHidden  = true;

	$.rxNoTxt.tooltip = $.strings.msgRxNumberTips;
		$.rxTooltip.updateArrow($.createStyle({
			classes : ["direction-down"]
		}).direction, $.createStyle({
			classes : ["i5", "inactive-fg-color", "icon-filled-arrow-down"]
		}));
	
	var sDict = {};
	sDict.accessibilityLabel = $.strings.registerLblAgreementAccessibility;
	$.agreementAttr.applyProperties(sDict);
	
	$.rxContainer.addEventListener("postlayout", didPostlayoutRxContainerView);
}
function setRightButton(iconText, iconDict) {	
	iconDict.accessibilityValue = $.strings.iconAccessibilityLblHelp;
	iconDict.accessibilityLabel = "";
	iconDict.accessibilityHint = "";

	$.rxNoTxt.setIcon(iconText, "right", iconDict);
}
function focus() {
		var height = $.uihelper.getHeightFromChildren($.nameView);
	$.nameVDividerView.height = height;
	if (store && store.shouldUpdate) {
		store.shouldUpdate = false;
		$.storeTitleLbl.text = store.title;
	}
}

function didChangeRx(e) {
	var value = rx.format(e.value),
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
	if (!rx.validate(rxNo)) {
		$.uihelper.showDialog({
			message : String.format(Alloy.Globals.strings.childAddValRxNoInvalid,Alloy.CFG.rx_length)
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
		birth_date : moment(dob.toString(),strDateFormat).format(Alloy.CFG.apiCodes.dob_format),
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
		if (args.isFamilyMemberFlow) {
			$.http.request({
				method : "patient_family_add",
				params : {
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
							birth_date :moment(dob.toString(),strDateFormat).format(Alloy.CFG.apiCodes.dob_format),
							rx_number : rxNo.substring(0, 7),
							store_id : store.id
						}
					}]
				},
				success : didAddChild
			});

		} else {
			$.http.request({
				method : "patient_family_add",
				params : {
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
							birth_date :moment(dob.toString(),strDateFormat).format(Alloy.CFG.apiCodes.dob_format),
							rx_number : rxNo.substring(0, 7),
							store_id : store.id
						}
					}]
				},
				success : didAddChildRegFlow
			});

		}

	} else {

		$.http.request({
			method : "patient_family_add",
			params : {
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
						birth_date : moment(dob.toString(),strDateFormat).format(Alloy.CFG.apiCodes.dob_format),
						rx_number : rxNo.substring(Alloy.CFG.rx_start_index, Alloy.CFG.rx_end_index),
						store_id : store.id
					}
				}]
			},
			success : didAddChild
		});
	}
}

function didAddChild(result) {
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
					/* 
			 * snaaga: if parent already has a registered phone number, skip textbenefits screen
			 */
			if (args.isFamilyMemberFlow){ 
				var parent_phone = Alloy.Collections.patients.at(0).get("mobile_number");
				if($.utilities.isPhoneNumber(parent_phone))
				{
					logger.debug("\n\n\n\n child add: skipping textBenefits & moving to familyMemberAddSuccess\n\n\n\n");
					$.app.navigator.open({
						titleid : "titleFamilyAccounts",
						ctrl : "familyMemberAddSuccess",
						ctrlArguments : {
							familyRelationship : args.familyRelationship
						},
						stack : false
					});
				} else {
					$.app.navigator.open({
						titleid : "titleTextBenefits",
						ctrl : "textBenefits",
						ctrlArguments : {
							familyRelationship : args.familyRelationship,
							isFamilyMemberFlow : true
						},
						stack : true
					});
	
				}
			} else {
				$.app.navigator.open({
					titleid : "titleChildSuccess",
					ctrl : "childSuccess",
					ctrlArguments : {
						username : args.username,
						isFamilyMemberFlow : false
					},
					stack : false

				});
			}
		}
	});
}

function didAddChildRegFlow() {
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			$.app.navigator.open({
				titleid : "titleChildConsent",
				ctrl : "childConsent",
				ctrlArguments : {
					username : args.username,
					isFamilyMemberFlow : false
				},
				stack : true
			});
		}
	});
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
		stack : false
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

	var top = $.rxContainer.rect.height,
	    margin = $.rxContainer.bottom;
	$.rxTooltip.applyProperties({
				top : top - margin
			});
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
function didClickHelp(e) {
	$.app.navigator.open({
		titleid : "titleRxSample",
		ctrl : "rxSample",
		stack : true
	});
}
exports.setParentView = setParentView;
exports.focus = focus;
exports.init = init;
