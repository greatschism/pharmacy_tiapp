var args = $.args,
    apiCodes = Alloy.CFG.apiCodes,
    relationship="";
function focus() {
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
			hintText : $.strings.familyMemberAddHintOther,
			analyticsId : "OtherTxt"
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
			hintText : $.strings.familyMemberAddHintOther,
			analyticsId : "OtherTxt"
		}));
		$.otherTxtView.add($.otherTxt.getView());
		$.otherTxt.setValue($.otherTxt.getValue());

	} 
}

function setParentView(view) {
	$.relationshipDp.setParentView(view);

}

function didClickContinue() {
	var relationship = $.relationshipDp.getSelectedItem();
	if (_.isEmpty(relationship)) {
		$.uihelper.showDialog({
			message : $.strings.familyMemberAddValRelationship
		});
		return;
	}
	var otherRelationship = $.relationshipDp.getSelectedItem().code_display;
	if (otherRelationship === "Other") {
		if (_.isEmpty($.otherTxt.getValue())) {
			$.uihelper.showDialog({
				message : $.strings.familyMemberAddValRelationship
			});
			return;
		}
	}
	var relationshipValue = otherRelationship === "Other" ? $.otherTxt.getValue() : relationship.code_value;
	$.app.navigator.open({
		titleid : "titleAddAnAdult",
		ctrl : "familyMemberInvite",
		ctrlArguments : {
				familyRelationship : relationshipValue,
				isFamilyMemberFlow : true
			},
		stack : true
	});
}

exports.setParentView = setParentView;
exports.focus = focus; 