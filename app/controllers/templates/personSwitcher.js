var args = arguments[0] || {},
    utilities = require("utilities"),
    parent;

function show() {
	if (!parent) {
		parent = $.personSwitcher.getParent();
	}
}

function update(titleid, where) {
	if (where) {
		/**
		 * unset selected flag
		 * for current user when
		 * where condition is passed
		 */
		Alloy.Collections.childProxies.findWhere({
			selected : true
		}).set("selected", false);
	}
	var model = Alloy.Collections.childProxies.findWhere(where || {
		selected : true
	});
	if (model) {
		if (where) {
			//set selected flag
			model.set("selected", true);
			/**
			 * update session id
			 * so any further api calls
			 * will be made on behalf of
			 * this user
			 */
			Alloy.Models.patient.set("session_id", model.get("session_id"));
		}
		//updating label
		$.lbl.text = titleid ? String.format(Alloy.Globals.strings[titleid], utilities.ucfirst(model.get("first_name"))) : utilities.ucfirst(model.get("first_name"));
	}
	return model;
}

function setParentView(view) {
	parent = view;
}

exports.show = show;
exports.update = update;
exports.setParentView = setParentView;
