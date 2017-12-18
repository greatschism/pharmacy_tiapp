var args = $.args,
    moment = require("alloy/moment"),
    app = require("core"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    authenticator = require("authenticator"),
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 60,
    arrowDown = $.createStyle({
	classes : ["icon-thin-arrow-down"]
}),
    arrowUp = $.createStyle({
	classes : ["icon-thin-arrow-up", "accessibility-disabled"]
}),
    titleClasses = ["left", "h4", "wrap-disabled"],
    inactiveTitleClasses = ["left", "h4", "inactive-fg-color", "wrap-disabled"],
    subtitleClasses = ["margin-top-small", "left", "inactive-fg-color", "wrap-disabled"],
    options = {},
    templateHeight,
    rModel,
    sModel,
    parent,
    rows,
    isBusy;

if (OS_ANDROID) {
	MAX_HEIGHT /= app.device.logicalDensityFactor;
}

(function() {
	if (!args.disabled) {
		$.patientSwitcher.addEventListener("click", toggle);
	}
	//set wrap height
	uihelper.wrapText($.lbl);
	//listener for collection reset
	Alloy.Collections.patients.on("reset", didReset);
})();

function buildPopover() {
	//get parent if not exists
	if (!parent) {
		parent = $.patientSwitcher.getParent();
	}
	if (!$.popoverView) {
		if (OS_IOS) {
			//popover view
			$.popoverView = $.UI.create("View", {
				classes : ["fade-out", "hide", "shadow-bg-color"],
				zIndex : 0
			});
			$.popoverView.addEventListener("click", hide);
			$.contentView = $.UI.create("View", {
				classes : ["top", "auto-height", "bg-color", "bubble-disabled"]
			});
			$.tableView = $.UI.create("TableView", {
				apiName : "TableView",
				bubbleParent : false
			});
			$.tableView.addEventListener("click", didClickTableView);
			$.contentView.add($.tableView);
			$.popoverView.add($.contentView);
			parent.add($.popoverView);
			//rows
			rows = [];
			var data = [];
			Alloy.Collections.patients.each(function(model) {
				var obj = model.pick(["session_id", "first_name", "last_name", "birth_date", "child_id", "related_by", "relationship", "title", "subtitle", "is_partial", "is_adult", "should_invite", "selectable", "selected"]);
				_.extend(obj, {
					titleClasses : obj.selectable && titleClasses || inactiveTitleClasses,
					subtitleClasses : subtitleClasses
				});
				var row = Alloy.createController("itemTemplates/contentView", obj);
				data.push(row.getView());
				rows.push(row);
			});
			templateHeight = rows[0].getHeight();
			$.tableView.setData(data);
			//alignment
			var height = args.height || (templateHeight * rows.length),
			    rect = $.patientSwitcher.rect;
			$.contentView.height = MAX_HEIGHT > height ? height : MAX_HEIGHT;
			$.popoverView.top = rect.y + rect.height;
		} else{
			$.contentView = $.UI.create("View", {
				classes : ["top", "auto-height", "bg-color", "bubble-disabled"]
			});
			$.tableView = $.UI.create("TableView", {
				apiName : "TableView",
				bubbleParent : false
			});
			//$.tableView.addEventListener("click", didClickTableView);
			$.contentView.add($.tableView);
			//rows
			rows = [];
			var data = [];
			var collectionsRowIndex = -1;
			Alloy.Collections.patients.each(function(model) {
				collectionsRowIndex++;
				var obj = model.pick(["session_id", "first_name", "last_name", "birth_date", "child_id", "related_by", "relationship", "title", "subtitle", "is_partial", "is_adult", "should_invite", "selectable", "selected"]);
				_.extend(obj, {
					titleClasses : obj.selectable && titleClasses || inactiveTitleClasses,
					subtitleClasses : subtitleClasses
				});
				obj.rowIndex = collectionsRowIndex;
				var row = Alloy.createController("itemTemplates/contentView", obj);
				row.on("clickedRowContainerView", didClickTableView);

				data.push(row.getView());
				rows.push(row);
			});
			templateHeight = rows[0].getHeight();
			$.tableView.setData(data);
			
			//popover view
			$.popoverView = Ti.UI.createAlertDialog({
				androidView : $.contentView
			});
			parent.add($.popoverView);
			// $.popoverView.addEventListener("click", hide);
			// $.popoverView.add($.contentView);
			//alignment
			/*var height = args.height || (templateHeight * rows.length),
			    rect = $.patientSwitcher.rect;
			$.contentView.height = MAX_HEIGHT > height ? height : MAX_HEIGHT;
			$.popoverView.top = rect.y + rect.height;*/
		};
	}
}

function destroyPopover() {
	if ($.popoverView) {
		parent.remove($.popoverView);
		$.popoverView = $.contentView = $.tableView = null;
	}
}

function hasPopover() {
	if (Alloy.Globals.hasPatientSwitcher) {
		buildPopover();
		return true;
	} else {
		destroyPopover();
		return false;
	}
}

function toggle() {
	var isVisible = hasPopover() && $.popoverView.visible;
	/**
	 * dropdownHandler can be a callback
	 * that will be helpful for the operations
	 * to be completed before showing the dropdown
	 * take a boolean parameter that will let
	 * the callback know the current visible
	 * status. Callback should handle further
	 */
	if (OS_IOS) {
		if (options.dropdownHandler) {
			options.dropdownHandler(isVisible);
		} else {
			if (isVisible) {
				hide();
			} else {
				show();
			}
		}
	} else{
		$.popoverView.show();
	};
}

/**
 * show the dropdown
 */
function show() {
	/**
	 * with update family accounts
	 * collection might have been updated
	 * check for it
	 */
	if (!isBusy && hasPopover() && !$.popoverView.visible) {
		isBusy = true;
		_.each(parent.children, function(child) {
			if (child == $.popoverView) {
				return;
			}
			child.accessibilityHidden = true;
			// uihelper.toggleAccessibility(parent, true, true);
		});
		$.popoverView.applyProperties({
			visible : true,
			zIndex : args.zIndex || 10
		});
		var animation = Ti.UI.createAnimation({
			opacity : 1,
			duration : 200
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.popoverView.opacity = 1;
			$.arrowBtn.applyProperties(arrowUp);
			if (Ti.App.accessibilityEnabled) {
				Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.tableView);
			}
			isBusy = false;
		});
		$.popoverView.animate(animation);
		return true;
	}
	return false;
}

/**
 * hide the dropdown
 */
function hide() {
	if (OS_ANDROID) {
		$.popoverView.hide();
	};
	if (!isBusy && hasPopover() && $.popoverView.visible) {
		isBusy = true;
		_.each($.popoverView.getParent().children, function(child) {
			if (child == $.popoverView) {
				return;
			}
			child.accessibilityHidden = false;
			// uihelper.toggleAccessibility(parent, false, true);

		});
		var animation = Ti.UI.createAnimation({
			opacity : 0,
			duration : 200
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.popoverView.applyProperties({
				opacity : 0,
				visible : false,
				zIndex : 0
			});
			$.arrowBtn.applyProperties(arrowDown);
			$.imgBtn.accessibilityHidden = true;
			isBusy = false;
		});
		$.popoverView.animate(animation);
		return true;
	}
	return false;
}

function deletePatient(patient) {
	http.request({
		method : "patient_family_delete",
		params : {
			data : [{
				patient : {
					child_id : patient.child_id,
				}
			}]
		},
		passthrough : patient,
		keepLoader : true,
		success : didDeletePatient
	});
}

function didDeletePatient(result, passthrough) {
	/**
	 * update family accounts now
	 * just use authenticator for any
	 * rework of same logics here
	 * i.e setting flags, update child proxy etc.,
	 */
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			/**
			 * now just navigate to adult invite process
			 * with pre-populated DOB & relationship
			 */
			app.navigator.open({
				titleid : "titleAddFamily",
				ctrl : "familyMemberInvite",
				ctrlArguments : {
					dob : moment(passthrough.birth_date, Alloy.CFG.apiCodes.dob_format).toDate(),
					familyRelationship : passthrough.related_by
				}
			});
		}
	});
}

function didClickTableView(e) {
	var row = rows[e.index];
	if (row) {
		var params = row.getParams();
		/**
		 * check whether to show invite dialog
		 */
		if (params.should_invite) {
			//hide popover
			hide();
			/**
			 * show invite dialog
			 */
			uihelper.showDialog({
				message : Alloy.Globals.strings.patientSwitcherMsgChildBecameAdult,
				buttonNames : [Alloy.Globals.strings.dialogBtnContinue, Alloy.Globals.strings.dialogBtnClose],
				cancelIndex : 1,
				success : function didClickContinueInvite() {
					deletePatient(params);
				}
			});
			return false;
		}
		/**
		 * prevent switcher from updating selection when
		 * if the row is already selected
		 * or
		 * options.callback returns false
		 * or
		 * params.selectable is false
		 */
	 	

		if (params.selected || (options.callback ? !options.callback(params) : !params.selectable)) {
			return hide();
		}
		/**
		 * unset selected flag
		 * for row object
		 * Note: object inside row and
		 * model are not same
		 */
		_.some(rows, function(oRow) {
			var rParams = oRow.getParams();
			if (rParams.selected) {
				rParams.selected = false;
				return true;
			}
			return false;
		});
		/**
		 * update ui and sModel
		 */
		Alloy.Collections.patients.each(function(model) {
			if (params.session_id === model.get("session_id")) {
				model.set("selected", true);
				params.selected = true;
				sModel = model;
				updateUI(params);
				$.trigger("change", params);
			} else if (model.get("selected")) {
				model.set("selected", false);
			}
		});
	}
	hide();
}

function updateUI(params) {
	/**
	 * update session id
	 * so any further api calls
	 * will be made on behalf of
	 * this user
	 */
	Alloy.Globals.sessionId = params.session_id;
	$.lbl.text = options.title ? String.format(options.title, params.first_name) : params.first_name;
	$.lbl.accessibilityValue = Alloy.Globals.strings.patientSwitcherAccessibilityHint;
}

/**
 * {Object} opts
 *
 * all properties are optional
 *
 * revert - Boolean whether or not to revert to the model that is selected at the moment
 *
 * title - String
 * 	i.e when title is "'s Prescription (prescPatientSwitcher)" then output will be account_holder_name's prescriptions
 * otherwise just account_holder_name
 *
 * where - a where clause says which item should be selected by default
 *  i.e - if it is required to choose a non partial account by default the condition will be
 * {
 * 	 is_partial: false
 * }
 *
 * selectable - a where clause says which item should be selectable
 * i.e - if it is required to disable minor account from selection the condition will be
 * {
 * 	 is_adult : false
 * }
 *
 * subtitles - a array of objects with a where clause and subtitle string
 * by default the relationship will be used as subtitle
 * i.e for a custom subtitle that only applied to minor accounts
 * [
 * {
 * 	 where: {
 * 		is_adult: false
 *   },
 * 	 subtitle: "Same as account manager settings"
 *  }
 * ]
 *
 * subtitle - String to be displayed as subtitle, applied for all objects
 *
 * callback - a function that should be called upon selection
 *
 * dropdownHandler - a function that should be called upon click of the dropdown
 */
function set(opts) {

	options = opts || {};

	//reset model
	sModel = null;

	//model to revert
	if (options.revert) {
		rModel = Alloy.Collections.patients.findWhere({
			selected : true
		});
	}

	var where = options.where || {},
	    wSelectable = options.selectable,
	    subtitles = options.subtitles,
	    subtitle = options.subtitle,
	    isAssigned;

	/**
	 * making sure let the patient
	 * doesn't have invite flag true
	 */
	where.should_invite = false;

	/**
	 * check if previously selected model
	 * passes this where condition
	 */
	sModel = Alloy.Collections.patients.findWhere(_.extend({
		selected : true
	}, where));
	if (sModel) {
		updateUI(sModel.toJSON());
	}

	Alloy.Collections.patients.each(function(child) {

		var obj = child.toJSON();

		/**
		 * selectable - a where condition
		 * to disable specific items
		 * from selection.
		 *
		 * by default selectable
		 * of child will be set to true
		 */
		child.set("selectable", wSelectable ? utilities.isMatch(obj, wSelectable) : true);

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
			if (utilities.isMatch(obj, where)) {
				child.set("selected", true);
				sModel = child;
				updateUI(obj);
			} else if (obj.selected) {
				child.set("selected", false);
			}
		} else if (sModel.get("session_id") !== obj.session_id && obj.selected) {
			child.set("selected", false);
		}

		//check for custom subtitles
		isAssigned = false;
		if (subtitles) {
			isAssigned = _.some(subtitles, function(subObj) {
				if (utilities.isMatch(obj, subObj.where)) {
					child.set("subtitle", subObj.subtitle);
					return true;
				}
				return false;
			});
		}
		//if no subtitles or isAssigned false with valid subtitle
		if (!isAssigned && subtitle) {
			isAssigned = true;
			child.set("subtitle", subtitle);
		}
		//if not assigned yet, just use relationship
		if (!isAssigned) {
			child.set("subtitle", obj.relationship);
		}

	});

	/**
	 * when none matches the where condition
	 * usually occurs when no children
	 * with partial manager account
	 */
	if (!sModel) {
		//pointing to account manager
		sModel = Alloy.Collections.patients.at(0);
		sModel.set("selected", true);
		updateUI(sModel.toJSON());
	}

	/**
	 * destroy existing pop over
	 * if any, this allows us to
	 * access set method at any time
	 * so all the selection criterias
	 * can be updated
	 */
	destroyPopover();

	return sModel;
}

/**
 * returns the selected model
 */
function get() {
	return sModel;
}

function didReset() {
	//trigger change event
	$.trigger("change", set(options).toJSON());
}

/**
 * set the parent view
 * @param {TiUIView} view
 */
function setParentView(view) {
	parent = view;
}

function revertPatient() {
	if (rModel && !rModel.get("selected")) {
		Alloy.Collections.patients.findWhere({
			selected : true
		}).set("selected", false);
		rModel.set("selected", true);
		Alloy.Globals.sessionId = rModel.get("session_id");
	}
}

/**
 * Important: This method
 * must be called on parent
 * controller's terminate to
 * avoid memory leaks due to collection
 * binding
 */
function terminate() {
	//revert selection
	revertPatient();
	//remove listener for collection reset
	Alloy.Collections.patients.off("reset", didReset);
}

exports.set = set;
exports.get = get;
exports.show = show;
exports.hide = hide;
exports.toggle = toggle;
exports.terminate = terminate;
exports.setParentView = setParentView;
exports.revertPatient = revertPatient;
