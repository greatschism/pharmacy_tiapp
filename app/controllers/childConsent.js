var args = arguments[0] || {},
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
		$.leftIconLbl.applyProperties($.createStyle({
			classes : ["icon-checkbox-checked", "content-positive-left-icon"],
		}));
		$.inactiveBtn.applyProperties($.createStyle({
			classes : ["primary-btn"]
		}));
		$.inactiveBtn.addEventListener("click", didClickContinue);
		selected = false;
	} else {
		$.leftIconLbl.applyProperties($.createStyle({
			classes : ["icon-checkbox-unchecked", "content-inactive-left-icon"]
		}));
		$.inactiveBtn.applyProperties($.createStyle({
			classes : ["inactive-btn"]
		}));
		$.inactiveBtn.removeEventListener("click", didClickContinue);
		selected = true;
	}
}
