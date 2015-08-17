 var args=arguments[0]||{},
 moment = require("alloy/moment"),
 store={};
 function init(){
 	$.uihelper.getImage("child_add",$.childImg);
 }
function focus(){
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
	if (store && store.shouldUpdate) {
		store.shouldUpdate = false;
		$.storeTitleLbl.text = store.title;
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
function didClickContinue(){
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
	var age=getAge(dob);
	if(age>=18){
		$.uihelper.showDialog({
			message:$.strings.childAddAccntInvalid
		});
		return;
	}
	else if(age>=12 && age<=17){
		$.app.navigator.open({
		titleid:"titleChildConsent",
		ctrl : "childConsent",
		stack : true
	});
	}
	else {
		$.app.navigator.open({
		titleid:"titleChildSuccess",
		ctrl : "childSuccess",
		ctrlArguments : {
			username : args.username,
			password : args.password,
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
function getAge(dateString){
	var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
   return age;
}

function didClickSkip(){
	$.app.navigator.open({
		titleid:"titleFamilyCare",
		ctrl : "childAccountTips",
		stack : true
	});
}
function setParentView(view) {
	$.dobDp.setParentView(view);
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
exports.focus=focus;
exports.init=init;