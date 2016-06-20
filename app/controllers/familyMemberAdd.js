var args = $.args,
    apiCodes = Alloy.CFG.apiCodes,
    relationship;
function focus() {
	$.uihelper.getImage("family_add", $.imgFamilyAdd);
	if (Alloy.Models.relationship.get("code_values")) {
		updateInputs();
	} else {
		$.http.request({
			method : "codes_get",
			params : {
				data : [{
					codes : [{
						code_name : Alloy.CFG.apiCodes.code_relationship
					}]
				}]
			},
			forceRetry : true,
			success : didGetRelationships
		});
	}

}

function didGetRelationships(result, passthrough) {
	Alloy.Models.relationship.set(result.data.codes[0]);
	updateInputs();
}

function didChangeRelationship() {
	if ($.relationshipDp.getSelectedItem().code_display === "Other") {
		$.otherTxt = Alloy.createWidget("ti.textfield", "widget", $.createStyle({
			classes : ["form-txt"],
			hintText : $.strings.familyMemberAddHintOther
		}));
		$.otherTxtView.add($.otherTxt.getView());
	} else if ($.otherTxt) {
		$.otherTxtView.remove($.otherTxt.getView());
	}
}

function updateInputs() {
	$.relationshipDp.setChoices(Alloy.Models.relationship.get("code_values"));
	if ($.relationshipDp.getSelectedItem().code_display === "Other") {
			$.otherTxt = Alloy.createWidget("ti.textfield", "widget", $.createStyle({
				classes : ["form-txt"],
				hintText : $.strings.familyMemberAddHintOther
			}));
			$.otherTxtView.add($.otherTxt.getView());
			$.otherTxt.setValue($.otherTxt.getValue());
			$.relationshipDp.setSelectedItem(relationship);

		} else {
			$.relationshipDp.setSelectedItem(relationship);
		}
}

function setParentView(view) {
	$.dobDp.setParentView(view);
	$.relationshipDp.setParentView(view);

}

function didClickContinue() {
    $.utilities.setProperty("familyMemberAddPrescFlow", false, "bool", true);
    var dob = $.dobDp.getValue(),
    	age = getAge(dob);
    relationship = $.relationshipDp.getSelectedItem();
    if (!dob) {
        $.uihelper.showDialog({
            message: $.strings.familyMemberAddValDob
        });
        return;
    }
	if (_.isEmpty(relationship)) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddValRelationship
		});
		return;
	}	
	var otherRelationship = $.relationshipDp.getSelectedItem().code_display;
	if (otherRelationship === "Other") {
        if (! $.utilities.validateRelationship($.otherTxt.getValue()) ) {
            $.uihelper.showDialog({
                message: $.strings.familyMemberRelationshipTips
            });
            return;
        }
	}
	var relationshipValue = otherRelationship === "Other" ? $.otherTxt.getValue() : relationship.code_value;
	if (age >= 12 && age <= 17) {
		$.app.navigator.open({
			titleid : "titleChildConsent",
			ctrl : "childConsent",
			ctrlArguments : {
				dob : dob,
				familyRelationship : relationshipValue,
				isFamilyMemberFlow : true
			},
			stack : true
		});
	} else if (age <= 11) {
		$.app.navigator.open({
			titleid : "titleChildAdd",
			ctrl : "childAdd",
			ctrlArguments : {
				dob : dob,
				familyRelationship : relationshipValue,
				isFamilyMemberFlow : true
			},
			stack : true
		});
	} else {
		$.app.navigator.open({
			titleid : "titleAddFamily",
			ctrl : "familyMemberInvite",
			ctrlArguments : {
				dob : dob,
				familyRelationship : relationshipValue,
				isFamilyMemberFlow : true
			},
			stack : true
		});
	}
}

/**
 *
 * @param {Object} dateString
 * Get the age of the user
 * If the user is 18 yrs old, let him send an invitation before creating the account
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

exports.setParentView = setParentView;
exports.focus = focus;
