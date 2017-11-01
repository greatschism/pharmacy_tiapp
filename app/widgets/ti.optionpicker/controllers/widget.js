var args = $.args,
    uihelper = require("uihelper"),
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 75,
    SELECTION_LIMIT = args.selectionLimit || 0,
    IS_RADIO_BUTTON = args.radioButton || false,
    template = args.template || false,
    iconText = args.iconText || "x",
    selectedIconText = args.selectedIconText || "+",
    iconColor = args.iconColor || "gray",
    selectedIconColor = args.selectedIconColor || "green",
    titleProperty = args.titleProperty || "title",
    paddingLeft = args.paddingLeft || 12,
    items = [],
    optionPadding = {
	top : 12,
	bottom : 12,
	left : 12,
	right : 12,
	height : Ti.UI.SIZE,
	layout : "horizontal",
	horizontalWrap : false,
	touchEnabled : false
},
    optioDict = {
	font : {
		fontSize : 12
	},
	ellipsize : true,
	wordWrap : false
},
    templateHeight = 0;

if (OS_ANDROID) {
	MAX_HEIGHT /= Ti.Platform.displayCaps.logicalDensityFactor;
}

(function() {

	var options = _.pick(args, ["top", "width", "height", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

	if (_.has(args, "children")) {
		_.each(args.children, function(child) {
			if (child.__iamalloy) {
				child = child.getView();
			}
			if (!child) {
				return;
			}
			//isAttached - whether to attach with tableview
			switch(child.role) {
			case "headerView":
				$.headerView = child;
				break;
			case "footerView":
				$.footerView = child;
				break;
			}
		});
		delete args.children;
	}

	if ($.headerView) {
		if (args.isAttached === true) {
			$.tableView.headerView = $.headerView;
		} else {
			$.headerView.top = 0;
			$.contentView.add($.headerView);
		}
	}

	$.tableView = $.UI.create("TableView", _.extend({
		apiName : "TableView",
		id : args.id || "tableView",
		analyticsId : args.analyticsId || "OptionPicker",
	}, _.pick(args, ["tableSeparatorInsets", "separatorColor"])));
	$.tableView.addEventListener("click", updateItem);
	$.contentView.add($.tableView);

	if ($.footerView) {
		if (args.isAttached === true) {
			$.tableView.footerView = $.footerView;
		} else {
			$.footerView.bottom = 0;
			$.contentView.add($.footerView);
		}
	}

	_.extend(optioDict, _.pick(args, ["color", "font"]));
	optioDict.height = optioDict.font.fontSize + 5;

	setItems(args.items || []);

})();

function isMatch(object, attrs) {
	var keys = _.keys(attrs),
	    length = keys.length;
	if (object === null)
		return !length;
	var obj = Object(object);
	for (var i = 0; i < length; i++) {
		var key = keys[i];
		if (attrs[key] !== obj[key] || !( key in obj))
			return false;
	}
	return true;
}

function setSelectedItems(where, selected) {
	var rows = $.tableView.sections[0].rows;
	_.each(items, function(item, index) {
		/**
		 * current version of underscore in Alloy
		 * 1.6 doesn't have support for isMatch
		 */
		if (isMatch(item, where)) {
			updateItem({
				index : index,
				row : rows[index],
				force : true,
				selected : selected
			});
		}
	});
}

function getSelectedItems() {
	return _.where(items, {
		selected : true
	});
}

function updateItem(e) {
	var itemIndex = e.index,
	    data = items[itemIndex],
	    selectedItems = _.where(items, {
		selected : true
	});
	/**
	 *  should be less than selection limit or
	 * should be a action of unselection (see below data.selected = !data.selected)
	 *  (data.selected || selectedItems.length < SELECTION_LIMIT)
	 *
	 */
	if (data && (IS_RADIO_BUTTON || SELECTION_LIMIT == 0 || (data.selected || selectedItems.length < SELECTION_LIMIT))) {
		if (e.force) {
			if (e.selected != data.selected) {
				data.selected = e.selected;
				$.tableView.updateRow( OS_IOS ? itemIndex : e.row, getRow(data));
			}
		} else {
			if (IS_RADIO_BUTTON && selectedItems.length != 0) {
				var selectedItem,
				    i;
				for (i in items) {
					if (i != itemIndex && items[i].selected === true) {
						selectedItem = items[i];
						break;
					}
				}
				/**
				 * user has clicked on the item that is already selected
				 * and radio button is true
				 * so stop further processes
				 */
				if (!selectedItem) {
					return false;
				}
				selectedItem.selected = false;
				$.tableView.updateRow( OS_IOS ? i : $.tableView.sections[0].rows[i], getRow(selectedItem));
			}
			data.selected = !data.selected;
			$.tableView.updateRow( OS_IOS ? itemIndex : e.row, getRow(data));
			if (args.autoHide) {
				hide(function didHide() {
					$.trigger("click", {
						source : $,
						index : itemIndex,
						data : data
					});
				});
			}
		}
	}
}

function applyProperties(dict) {
	$.contentView.applyProperties(dict);
}

function getRow(data) {
	var row;
	if (template) {
		var rCtrl = Alloy.createController(template, data);
		if (!templateHeight) {
			templateHeight = rCtrl.getHeight();
		}
		row = rCtrl.getView();
	} else {
		row = Ti.UI.createTableViewRow({
			height : Ti.UI.SIZE,
			selectedBackgroundColor : "transparent",
			accessibilityValue : data.selected ? args.selectedAccessibilityValue || "Checked" : "Not checked",
			className : "optionPicker",
		}),
		rowView = Ti.UI.createView(optionPadding);
		rowView.add(Ti.UI.createLabel({
			text : data.selected ? selectedIconText : iconText,
			left : 0,
			font : args.iconFont || {
				fontSize : 12
			},
			color : data.selected ? selectedIconColor : iconColor,
			touchEnabled : false,
			accessibilityHidden : !OS_ANDROID,
			accessibilityLabel : data[titleProperty] + " " + (OS_ANDROID && data.selected ? Alloy.Globals.strings.accessibilityCheckboxChecked : Alloy.Globals.strings.accessibilityCheckboxSelect)
		}));
		rowView.add(Ti.UI.createLabel(_.extend(optioDict, {
			text : data[titleProperty],
			left : paddingLeft,
			touchEnabled : false,
			accessibilityHidden : OS_ANDROID,
		})));
		row.add(rowView);
	}
	return row;
}

function setItems(tItems, tTemplate) {
	items = tItems;
	if (tTemplate) {
		template = tTemplate;
	}
	var data = [];
	_.each(items, function(item) {
		if (!_.has(item, "selected")) {
			item.selected = false;
		}
		data.push(getRow(item));
	});
	$.tableView.setData(data);
	var top = 0,
	    bottom = 0,
	    height = args.height;
	if (!args.height) {
		if (template) {
			height = templateHeight * items.length;
		} else {
			height = optionPadding.top + ((optioDict.height + optionPadding.top + optionPadding.bottom) * items.length);
		}
	}
	if ($.headerView) {
		top = (parseInt($.headerView.height) || uihelper.getHeightFromChildren($.headerView, true));
		height += top;
	}
	if ($.footerView) {
		bottom = (parseInt($.footerView.height) || uihelper.getHeightFromChildren($.footerView, true));
		height += bottom;
	}
	$.contentView.height = MAX_HEIGHT > height ? height : MAX_HEIGHT;
	$.tableView.applyProperties({
		top : top,
		bottom : bottom
	});
}

function getItems() {
	return items;
}

function animate(dict, callback) {
	var animation = Ti.UI.createAnimation(dict);
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		if (callback) {
			callback();
		}
	});
	$.widget.animate(animation);
}

function show(callback) {
	if (!$.widget.visible) {
		//hide keyboard if any
		if (Ti.App.keyboardVisible) {
			Ti.App.hideKeyboard();
		}
		//disable accessibility of other elements
		_.each($.widget.getParent().children, function(child) {
			if (child == $.widget) {
				return;
			}
			child.accessibilityHidden = true;
		});
		$.widget.applyProperties({
			visible : true,
			zIndex : args.zIndex || 10,
		});
		var animation = Ti.UI.createAnimation({
			opacity : 1,
			duration : 200
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.widget.opacity = 1;
			if (Ti.App.accessibilityEnabled) {
				Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.contentView);
			}
			if (callback) {
				callback();
			}
		});
		$.widget.animate(animation);
		return true;
	}
	return false;
}

function hide(callback) {
	if ($.widget.visible) {
		//enable accessibility back
		_.each($.widget.getParent().children, function(child) {
			if (child == $.widget) {
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
			$.widget.applyProperties({
				opacity : 0,
				visible : false,
				zIndex : 0
			});
			if (callback) {
				callback();
			}
		});
		$.widget.animate(animation);
		return true;
	}
	return false;
}

function toggle(callback) {
	if ($.widget.visible) {
		hide(callback);
	} else {
		show(callback);
	}
}

function getVisible() {
	return $.widget.visible;
}

_.extend($, {
	show : show,
	hide : hide,
	toggle : toggle,
	animate : animate,
	setItems : setItems,
	getItems : getItems,
	getVisible : getVisible,
	applyProperties : applyProperties,
	setSelectedItems : setSelectedItems,
	getSelectedItems : getSelectedItems
});
