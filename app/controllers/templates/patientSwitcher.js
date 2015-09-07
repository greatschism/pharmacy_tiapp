var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 60,
    arrowDown = $.createStyle({
	classes : ["icon-thin-arrow-down"]
}),
    arrowUp = $.createStyle({
	classes : ["icon-thin-arrow-up"]
}),
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
	//listener for collection reset
	Alloy.Collections.patients.on("reset", didReset);
})();

function buildPopover() {
	//get parent if not exists
	if (!parent) {
		parent = $.patientSwitcher.getParent();
	}
	if (!$.popoverView) {
		//popover view
		$.popoverView = $.UI.create("View", {
			id : "popoverView"
		});
		$.popoverView.addEventListener("click", hide);
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
		$.popoverView.add($.contentView);
		parent.add($.popoverView);
		//rows
		rows = [];
		var data = [];
		Alloy.Collections.patients.each(function(model) {
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
		//alignment
		var height = args.height || (templateHeight * rows.length),
		    rect = $.patientSwitcher.rect;
		$.contentView.height = MAX_HEIGHT > height ? height : MAX_HEIGHT;
		$.popoverView.top = rect.y + rect.height;
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
	if (hasPopover() && $.popoverView.visible) {
		hide();
	} else {
		show();
	}
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
	if (!isBusy && hasPopover() && $.popoverView.visible) {
		isBusy = true;
		_.each($.popoverView.getParent().children, function(child) {
			if (child == $.popoverView) {
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
			$.popoverView.applyProperties({
				opacity : 0,
				visible : false,
				zIndex : 0
			});
			$.arrowBtn.applyProperties(arrowDown);
			isBusy = false;
		});
		$.popoverView.animate(animation);
		return true;
	}
	return false;
}

function didClickTableView(e) {
	var row = rows[e.index];
	if (row) {
		var params = row.getParams();
		/**
		 * check whether to show invite dialog
		 */
		if (params.invite) {
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
					//update account manager - child_proxy property
					Alloy.Collections.patients.at(0).set("child_proxy", _.reject(Alloy.Collections.patients.at(0).get("child_proxy"), function(child) {
						if (params.child_id === child.child_id) {
							return true;
						}
						return false;
					}));
					//delete account from collection
					Alloy.Collections.patients.reset(Alloy.Collections.patients.reject(function(model) {
						if (params.child_id === model.get("child_id")) {
							return true;
						}
						return false;
					}));
					/**
					 * remove row from rows
					 * and delete this row
					 * Note: session_id will never be of this
					 * account (which has invite flag as true), so just ignore
					 */
					rows = _.reject(rows, function(oRow) {
						if (params.child_id === oRow.getParams().child_id) {
							$.tableView.deleteRow(oRow.getView());
							return true;
						}
						return false;
					});
					//now just navigate to adult invite screen
					$.app.navigator.open({
						titleid : "titleAddFamily",
						ctrl : "familyMemberInvite",
						ctrlArguments : {
							dob : moment(params.birth_date, Alloy.CFG.apiCodes.dob_format).toDate(),
							familyRelationship : params.related_by
						}
					});
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
		if (params.selected || (options.callback && !options.callback(params)) || !params.selectable) {
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
 * callback - a function that should called upon selection
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
	 * invite should always be false
	 * child who turned 18 should be invited
	 * again
	 */
	where.invite = false;
	/**
	 * check if previously selected model
	 * passes this where condition
	 */
	if (where) {
		sModel = Alloy.Collections.patients.findWhere(_.extend({
			selected : true
		}, where));
		if (sModel) {
			updateUI(sModel.toJSON());
		}
	}

	Alloy.Collections.patients.each(function(child) {

		var obj = child.toJSON();

		/**
		 * selectable - a where condition
		 * to disable specific items
		 * from selection
		 * Note: this is required even when selectable is not passed
		 * in order to make items selectable that was unselectable previously.
		 * When invite is true, selectable should be false. A minor turned to adult,
		 * should invite him again now.
		 */
		child.set("selectable", obj.invite ? false : ( wSelectable ? utilities.isMatch(obj, wSelectable) : true));

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
	$.trigger("change", set(args).toJSON());
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
