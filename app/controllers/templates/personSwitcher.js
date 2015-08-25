var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 60,
    arrowDown = $.createStyle({
	classes : ["icon-thin-arrow-down"]
}),
    arrowUp = $.createStyle({
	classes : ["icon-thin-arrow-up"]
}),
    titleid,
    selectionCallback,
    templateHeight,
    rows,
    parent,
    isBusy;

if (OS_ANDROID) {
	MAX_HEIGHT /= app.device.logicalDensityFactor;
}

function toggle() {
	if ($.popover && $.popover.visible) {
		hide();
	} else {
		show();
	}
}

function show() {
	if (!parent) {
		parent = $.personSwitcher.getParent();
	}
	/**
	 * create popover if not available already
	 */
	if (!$.popover) {
		$.popover = $.UI.create("View", {
			id : "popover"
		});
		$.popover.addEventListener("click", hide);
		$.contentView = $.UI.create("View", {
			id : "contentView",
			bubbleParent : false
		});
		$.tableView = $.UI.create("TableView", {
			apiName : "TableView",
			bubbleParent : false
		});
		$.tableView.addEventListener("click", didClickTableView);
		$.contentView.add($.tableView);
		$.popover.add($.contentView);
		parent.add($.popover);
		rows = [];
		var data = [];
		Alloy.Collections.childProxies.each(function(model) {
			var obj = model.toJSON();
			if (!obj.selectable) {
				obj.titleClasses = ["content-inactive-title"];
			}
			var row = Alloy.createController("itemTemplates/contentView", obj);
			data.push(row.getView());
			rows.push(row);
		});
		templateHeight = rows[0].getHeight();
		$.tableView.setData(data);
		var height = args.height || (templateHeight * rows.length);
		$.contentView.height = MAX_HEIGHT > height ? height : MAX_HEIGHT;
		var rect = $.personSwitcher.rect;
		$.popover.top = rect.y + rect.height;
	}
	if (!isBusy && !$.popover.visible) {
		isBusy = true;
		_.each(parent.children, function(child) {
			if (child == $.popover) {
				return;
			}
			child.accessibilityHidden = true;
		});
		$.popover.applyProperties({
			visible : true,
			zIndex : args.zIndex || 10,
		});
		var animation = Ti.UI.createAnimation({
			opacity : 1,
			duration : 200
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.popover.opacity = 1;
			$.arrowBtn.applyProperties(arrowUp);
			if (Ti.App.accessibilityEnabled) {
				Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.tableView);
			}
			isBusy = false;
		});
		$.popover.animate(animation);
		return true;
	}
	return false;
}

function hide() {
	if (!isBusy && $.popover.visible) {
		isBusy = true;
		_.each($.popover.getParent().children, function(child) {
			if (child == $.popover) {
				return;
			}
			child.accessibilityHidden = false;
		});
		var animation = Ti.UI.createAnimation({
			opacity : 0,
			duration : 200
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.popover.applyProperties({
				opacity : 0,
				visible : false,
				zIndex : 0
			});
			$.arrowBtn.applyProperties(arrowDown);
			isBusy = false;
		});
		$.popover.animate(animation);
		return true;
	}
	return false;
}

function didClickTableView(e) {
	var row = rows[e.index];
	if (row) {
		var params = row.getParams();
		/**
		 * prevent switcher from updating selection when
		 * if the row is already selected
		 * or
		 * selectionCallback returns false
		 * or
		 * params.selectable is false
		 */
		if (params.selected || (selectionCallback && !selectionCallback(params)) || !params.selectable) {
			return hide();
		}
		/**
		 * unset selected flag
		 * for row object
		 * Note: object inside row and
		 * model will be different
		 */
		_.some(rows, function(row) {
			var rParams = row.getParams();
			if (rParams.selected) {
				rParams.selected = false;
				return true;
			}
			return false;
		});
		updateSelection(params);
	}
	hide();
}

function updateSelection(params) {
	Alloy.Collections.childProxies.each(function(model) {
		if (model.get("selected") && params.session_id !== model.get("session_id")) {
			model.set("selected", false);
		} else if (params.session_id === model.get("session_id")) {
			model.set("selected", true);
			params.selected = true;
			updateUI(params);
			$.trigger("change", params);
		}
	});
}

function updateUI(params) {
	/**
	 * update session id
	 * so any further api calls
	 * will be made on behalf of
	 * this user
	 */
	Alloy.Models.patient.set("session_id", params.session_id);
	$.lbl.text = titleid ? String.format(Alloy.Globals.strings[titleid], params.first_name) : params.first_name;
}

function set(tid, where, dWhere, cSubtitles, sCallback) {
	var sModel;
	titleid = tid;
	selectionCallback = sCallback;
	/**
	 * check if previously selected model
	 * passes this where condition
	 */
	if (where) {
		sModel = Alloy.Collections.childProxies.findWhere(_.extend(where, {
			selected : true
		}));
		if (sModel) {
			updateUI(sModel.toJSON());
		}
	}
	Alloy.Collections.childProxies.each(function(child) {
		var obj = child.toJSON();
		/**
		 * dWhere - a where condition
		 * to disable specific items
		 * from selection
		 * Note: this loop is required even when dWhere is not passed
		 * in order to make items selectable that was unselectable previously
		 */
		child.set("selectable", dWhere ? !utilities.isMatch(obj, dWhere) : true);
		/**
		 * unset selected flag
		 * for selected proxy when
		 * where condition is passed
		 * Note: if sModel is valid
		 * then don't validate where conditions
		 * further, only first match should be
		 * used
		 */
		if (!sModel) {
			if (where) {
				if (utilities.isMatch(obj, where)) {
					child.set("selected", true);
					sModel = child;
					updateUI(obj);
				} else if (obj.selected) {
					child.set("selected", false);
				}
			} else if (obj.selected) {
				sModel = child;
				updateUI(obj);
			}
		} else if (sModel.get("session_id") !== obj.session_id && obj.selected) {
			child.set("selected", false);
		}
		/**
		 * cSubtitles - array of
		 * where condition and custom subtitle text
		 * if not passed, defaults to relationship
		 */
		if (cSubtitles) {
			_.each(cSubtitles, function(cSubtitle) {
				child.set("subtitle", utilities.isMatch(obj, cSubtitle.where) ? cSubtitle.subtitle : obj.relationship);
			});
		} else {
			child.set("subtitle", obj.relationship);
		}
	});
	/**
	 * destroy existing pop over
	 * if any, this allows us to
	 * access set method at any time
	 * so all the selection criterias
	 * can be updated
	 */
	if ($.popover) {
		parent.remove($.popover);
		$.popover = $.contentView = $.tableView = null;
	}
	return sModel;
}

function setParentView(view) {
	parent = view;
}

exports.set = set;
exports.show = show;
exports.hide = hide;
exports.setParentView = setParentView;
