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
		 * switch current user
		 * when where condition is passed
		 */
		Alloy.Collections.childProxies.findWhere({
			selected : true
		}).set(selected, false);
	} else {
		where = {
			selected : true
		};
	}
	var model = Alloy.Collections.childProxies.findWhere(where);
	if (model) {
		/**
		 * update session id
		 * so any further api calls
		 * will be made on behalf of
		 * this user
		 */
		Alloy.Models.patient.set("session_id", model.get("session_id"));
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
