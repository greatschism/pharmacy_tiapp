var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 60,
    templateHeight,
    rows,
    parent;

if (OS_ANDROID) {
	MAX_HEIGHT /= app.device.logicalDensityFactor;
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
		$.contentView = $.UI.create("View", {
			id : "contentView"
		});
		$.tableView = $.UI.create("TableView", {
			apiName : "TableView"
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
	if (!$.popover.visible) {
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
			if (Ti.App.accessibilityEnabled) {
				Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.tableView);
			}
		});
		$.popover.animate(animation);
		return true;
	}
	return false;
}

function hide() {
	if ($.popover.visible) {
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
		});
		$.popover.animate(animation);
		return true;
	}
	return false;
}

function didClickTableView(e) {
	hide();
}

function update(titleid, where, dWhere, cSubtitles) {
	var sModel;
	Alloy.Collections.childProxies.each(function(child) {
		var obj = child.toJSON();
		/**
		 * dWhere - a where condition
		 * to disable specific items
		 * from selection
		 * Note: this loop is required even when dWhere is not passed
		 * in order to make items selectable that was unselectable previously
		 */
		//to do - underscore version doesn't have isMatch check it
		child.set("selectable", dWhere ? _.isMatch(obj, dWhere) : true);
		/**
		 * unset selected flag
		 * for selected proxy when
		 * where condition is passed
		 */
		if (where) {
			console.log(where);
			console.log(obj);
			if (_.isMatch(obj, where)) {
				child.set("selected", true);
				/**
				 * update session id
				 * so any further api calls
				 * will be made on behalf of
				 * this user
				 */
				Alloy.Models.patient.set("session_id", obj.session_id);
				sModel = child;
			} else if (obj.selected) {
				child.set("selected", false);
			}
		} else if (obj.selected) {
			sModel = child;
		}
		/**
		 * cSubtitles - array of
		 * where condition and custom subtitle text
		 * if not passed, defaults to relationship
		 */
		if (cSubtitles) {
			_.each(cSubtitles, function(cSubtitle) {
				child.set("subtitle", _.isMatch(obj, cSubtitle.where) ? cSubtitle.subtitle : obj.relationship);
			});
		} else {
			child.set("subtitle", obj.relationship);
		}
	});
	$.lbl.text = titleid ? String.format(Alloy.Globals.strings[titleid], utilities.ucfirst(sModel.get("first_name"))) : utilities.ucfirst(sModel.get("first_name"));
	/**
	 * destroy existing popover
	 * if any
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

exports.show = show;
exports.update = update;
exports.setParentView = setParentView;
