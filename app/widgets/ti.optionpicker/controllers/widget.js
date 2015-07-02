var args = arguments[0] || {},
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 75,
    SELECTION_LIMIT = args.selectionLimit || 0,
    IS_RADIO_BUTTON = args.radioButton || false,
    items = [],
    template = args.template || false,
    iconText = args.iconText || "x",
    selectedIconText = args.selectedIconText || "+",
    iconColor = args.iconColor || "gray",
    selectedIconColor = args.selectedIconColor || "green",
    titleProperty = args.titleProperty || "title",
    paddingLeft = args.paddingLeft || 12,
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
};

if (OS_ANDROID) {
	MAX_HEIGHT /= Ti.Platform.displayCaps.logicalDensityFactor;
}

(function() {

	var options = _.pick(args, ["top", "width", "height", "bottom", "left", "right", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

	options = _.pick(args, ["headerView", "footerView", "backgroundColor", "separatorInsets"]);
	if (_.has(args, "children")) {
		_.each(args.children, function(child) {
			if (child.__iamalloy) {
				child = child.getView();
			}
			if (!child) {
				return;
			}
			options[child.role] = child;
		});
		delete args.children;
	}
	if (!_.isEmpty(options)) {
		$.tableView.applyProperties(options);
	}

	_.extend(optioDict, _.pick(args, ["color", "font"]));
	optioDict.height = optioDict.font.fontSize + 5;

	setItems(args.items || []);

})();

function setSelectedItems(where, selected) {
	var rows = $.tableView.sections[0].rows;
	for (var i in items) {
		var equal = true;
		for (j in where) {
			if (!_.isEqual(items[i], where[i])) {
				equal = false;
				break;
			}
		}
		if (equal) {
			updateItem({
				index : i,
				row : rows[i],
				force : true,
				selected : selected
			});
		}
	}
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
				if (selectedItem) {
					selectedItem.selected = false;
					$.tableView.updateRow( OS_IOS ? i : $.tableView.sections[0].rows[i], getRow(selectedItem));
				}
			}
			data.selected = !data.selected;
			$.tableView.updateRow( OS_IOS ? itemIndex : e.row, getRow(data));
			if (args.autoHide) {
				$.trigger("click", {
					source : $,
					index : itemIndex,
					data : data
				});
				hide();
			}
		}
	}
}

function applyProperties(dict) {
	$.contentView.applyProperties(dict);
}

function getRow(data) {
	var row = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE,
		selectedBackgroundColor : "transparent",
		accessibilityValue : data.selected ? args.selectedAccessibilityValue || "Selected" : null
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
		accessibilityHidden : true
	}));
	if (template) {
		var contentView = Ti.UI.createView({
			left : paddingLeft,
			height : Ti.UI.SIZE,
			touchEnabled : false
		});
		for (var i in template) {
			contentView.add(create(template[i], data));
		}
		rowView.add(contentView);
	} else {
		rowView.add(Ti.UI.createLabel(_.extend(optioDict, {
			text : data[titleProperty],
			left : paddingLeft,
			touchEnabled : false
		})));
	}
	row.add(rowView);
	return row;
}

function create(dict, data) {
	var element = $.UI.create(dict.apiName, dict.properties || {});
	element.touchEnabled = false;
	if (_.has(dict, "text")) {
		element.text = data[dict.text];
	}
	if (_.has(dict, "children")) {
		var children = dict.children;
		for (var i in children) {
			var cItems = children[i].items,
			    addChild = children[i].addChild || "add",
			    asArray = children[i].asArray,
			    cElemnts = [];
			for (var i in cItems) {
				var childItem = cItems[i];
				if (asArray) {
					cElemnts.push(create(childItem, data));
				} else {
					element[addChild](create(childItem, data));
				}
			}
			if (asArray) {
				element[addChild](cElemnts);
			}
		}
	}
	return element;
}

function setItems(pItems, template) {
	items = pItems;
	if (template) {
		template = template;
	}
	var data = [];
	_.each(items, function(item) {
		if (!_.has(item, "selected")) {
			item.selected = false;
		}
		data.push(getRow(item));
	});
	$.tableView.setData(data);
	if (!template && !_.has(args, "height")) {
		var height = optionPadding.top + ((optioDict.height + optionPadding.top + optionPadding.bottom) * items.length),
		    headerView = $.tableView.getHeaderView(),
		    footerView = $.tableView.getFooterView();
		if (headerView) {
			height += (parseInt(headerView.height) || calculateHeight(headerView));
		}
		if (footerView) {
			height += (parseInt(footerView.height) || calculateHeight(footerView));
		}
		$.contentView.height = MAX_HEIGHT > height ? height : MAX_HEIGHT;
	}
}

function calculateHeight(view) {
	var height = 0;
	_.each(view.children, function(child) {
		height += (child.top || 0) + (child.bottom || 0) + (child.height || 0);
	});
	return height;
}

function getItems() {
	return items;
}

function setHeaderView(view) {
	$.tableView.headerView = view;
}

function setFooterView(view) {
	$.tableView.footerView = view;
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
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.widget.opacity = 1;
			if (Ti.App.accessibilityEnabled) {
				Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.tableView);
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
		_.each($.widget.getParent().children, function(child) {
			if (child == $.widget) {
				return;
			}
			child.accessibilityHidden = false;
		});
		var animation = Ti.UI.createAnimation({
			opacity : 0,
			duration : 300
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

exports.show = show;
exports.hide = hide;
exports.toggle = toggle;
exports.animate = animate;
exports.setItems = setItems;
exports.getItems = getItems;
exports.getVisible = getVisible;
exports.setHeaderView = setHeaderView;
exports.setFooterView = setFooterView;
exports.applyProperties = applyProperties;
exports.setSelectedItems = setSelectedItems;
exports.getSelectedItems = getSelectedItems;
