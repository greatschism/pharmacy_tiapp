var args = $.args,
    authenticator = require("authenticator"),
    selected = true;
function didClickContinue() {
	if (args.isFamilyMemberFlow) {
		$.app.navigator.open({
			titleid : "titleChildAdd",
			ctrl : "childAdd",
			ctrlArguments : {
				dob : args.dob,
				familyRelationship : args.familyRelationship,
				isFamilyMemberFlow : true
			},
			stack : true
		});
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

function didAddChild(result) {
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			var successMessage = result.message;
			$.uihelper.showDialog({
				message : successMessage,
				buttonNames : [$.strings.dialogBtnOK],
				success : function() {
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
			});
		}
	});
}

function didClickConsent(e) {
	if (selected) {
		$.consentObtainLbl.accessibilityValue =  $.strings.accessibilityCheckboxRemoveSelection;
		$.leftIconLbl.applyProperties($.createStyle({
			classes : ["top-disabled" ,"margin-left" ,"i4" ,"txt-left" ,"active-fg-color" ,"icon-checkbox-checked" ,"positive-fg-color","border-disabled"],
		}));
		$.inactiveBtn.applyProperties($.createStyle({
			classes : ["primary-bg-color","primary-border"],
			analyticsId : "InactiveBtn"
		}));
		$.inactiveBtn.addEventListener("click", didClickContinue);
		selected = false;
	} else {
		$.consentObtainLbl.accessibilityValue =  $.strings.accessibilityCheckboxSelect;
		$.leftIconLbl.applyProperties($.createStyle({
			classes : ["top-disabled" ,"margin-left" ,"i4" ,"txt-left" ,"active-fg-color"  ,"icon-checkbox-unchecked" ,"inactive-fg-color","border-disabled"]
		}));
		$.inactiveBtn.applyProperties($.createStyle({
			classes : ["inactive-bg-color","inactive-border"],
			analyticsId : "InactiveBtn"
		}));
		$.inactiveBtn.removeEventListener("click", didClickContinue);
		selected = true;
	}
}
