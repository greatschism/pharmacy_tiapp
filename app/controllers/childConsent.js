var args = arguments[0] || {},
    selected = false;
function didClickContinue() {
	$.http.request({
		method : "patient_family_add",
		params : {
			feature_code : "THXXX",
			data : [{
				patient : {
					is_adult : args.is_adult,
					is_existing_user : args.is_existing_user,
					email : "",
					mobile : "",
					related_by : "",
					user_name : "",
					password : "",
					first_name : args.first_name,
					last_name : args.last_name,
					birth_date : args.birth_date,
					rx_number : args.rx_number,
					store_id : args.store_id
				}
			}]
		},
		success : didAddChild
	});

}

function didAddChild(result) {
	$.app.navigator.open({
		titleid : "titleChildSuccess",
		ctrl : "childSuccess",
		ctrlArguments : {
			username : args.username
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
