var args = arguments[0] || {},
    selected = true;
function didClickContinue() {
	if (args.isFamilyMemberFlow) {
		$.app.navigator.open({
			titleid : "titleChildAdd",
			ctrl : "childAdd",
			ctrlArguments : {
				dob : args.dob,
				familyRelationship : args.familyRelationship,
					isFamilyMemberFlow:true
			},
			stack : true
		});
	} else {
		$.http.request({
			method : "patient_family_add",
			params : {
				feature_code : "THXXX",
				data : [{
					patient : {
						is_adult : args.childDetails.is_adult,
						is_existing_user : args.childDetails.is_existing_user,
						email : "",
						mobile : "",
						related_by : args.childDetails.related_by ? args.childDetails.related_by : "",
						user_name : "",
						password : "",
						first_name : args.childDetails.first_name,
						last_name : args.childDetails.last_name,
						birth_date : args.childDetails.birth_date,
						rx_number : args.childDetails.rx_number,
						store_id : args.childDetails.store_id
					}
				}]
			},
			success : didAddChild
		});
	}
}

function didAddChild(result) {
	var successMessage = result.message;
	$.uihelper.showDialog({
		message : successMessage
	});

	$.app.navigator.open({
		titleid : "titleChildSuccess",
		ctrl : "childSuccess",
		ctrlArguments : {
			username : args.username,
				isFamilyMemberFlow:false
		},
		stack : false
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
