var args = arguments[0] || {},
    SELECTION_LIMIT = args.selectionLimit || 0,
    items = [],
    template = args.template || false,
    unSelectedIconText = args.unSelectedIconText || "x",
    selectedIconText = args.selectedIconText || "+",
    unSelectedIconColor = args.unSelectedIconColor || "x",
    selectedIconColor = args.selectedIconColor || "+",
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

(function() {

	$.role = args.role || "overlay";

	if (_.has(args, "overlayDict")) {
		$.overlayView.applyProperties(args.overlayDict);
	}

	if (_.has(args, "top")) {
		$.overlayView.top = args.top;
		$.containerView.top = args.top + optionPadding.top;
	}

	var options = {};
	options = _.pick(args, ["width", "height", "bottom", "left", "right", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.containerView.applyProperties(options);
	}

	options = _.pick(args, ["headerView", "footerView", "backgroundColor", "separatorInsets"]);
	if (!_.isEmpty(options)) {
		$.tableView.applyProperties(options);
	}

	if (_.has(args, "children")) {
		var children = args.children;
		for (var i in children) {
			$.tableView[children[i].role] = children[i];
		}
	}

	_.extend(optioDict, _.pick(args, ["color", "font"]));

	setItems(args.items || []);

})();

function didTap(e) {
	if (args.persistent === false && e.source == $.widget) {
		hide();
	}
}

function setSelectedItems(_where, _selected) {
	for (var i in items) {
		var equal = true;
		for (j in _where) {
			if (!_.isEqual(items[i], _where[i])) {
				equal = false;
				break;
			}
		}
		if (equal) {
			updateItem({
				index : i,
				force : true,
				selected : _selected
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
	if (data && (SELECTION_LIMIT == 0 || (data.selected || selectedItems.length < SELECTION_LIMIT))) {
		if (e.force) {
			if (e.selected != data.selected) {
				data.selected = e.selected;
				$.tableView.updateRow(itemIndex, getRow(data));
			}
		} else {
			data.selected = !data.selected;
			$.tableView.updateRow(itemIndex, getRow(data));
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

function applyProperties(_dict) {
	$.containerView.applyProperties(_dict);
}

function getRow(_data) {
	var row = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE
	}),
	    rowView = Ti.UI.createView(optionPadding);
	rowView.add(Ti.UI.createLabel({
		text : _data.selected ? selectedIconText : unSelectedIconText,
		left : 0,
		font : args.iconFont || {
			fontSize : 12
		},
		color : _data.selected ? selectedIconColor : unSelectedIconColor,
		touchEnabled : false
	}));
	if (template) {
		var contentView = Ti.UI.createView({
			left : paddingLeft,
			height : Ti.UI.SIZE,
			touchEnabled : false
		});
		for (var i in template) {
			contentView.add(create(template[i], _data));
		}
		rowView.add(contentView);
	} else {
		rowView.add(Ti.UI.createLabel(_.extend(optioDict, {
			text : _data[titleProperty],
			left : paddingLeft,
			touchEnabled : false
		})));
	}
	row.add(rowView);
	return row;
}

function create(_dict, _data) {
	var element = $.UI.create(_dict.apiName, _dict.properties || {});
	element.touchEnabled = false;
	if (_.has(_dict, "text")) {
		element.text = _data[_dict.text];
	}
	if (_.has(_dict, "children")) {
		var children = _dict.children;
		for (var i in children) {
			var cItems = children[i].items,
			    addChild = children[i].addChild || "add",
			    asArray = children[i].asArray,
			    cElemnts = [];
			for (var i in cItems) {
				var childItem = cItems[i];
				if (asArray) {
					cElemnts.push(create(childItem, _data));
				} else {
					element[addChild](create(childItem, _data));
				}
			}
			if (asArray) {
				element[addChild](cElemnts);
			}
		}
	}
	return element;
}

function setItems(_items, _template) {
	items = _items;
	if (_template) {
		template = _template;
	}
	var data = [];
	for (var i in items) {
		var item = items[i];
		if (_.has(item, "selected")) {
			item.selected = false;
		}
		data.push(getRow(item));
	}
	$.tableView.setData(data);
}

function getItems() {
	return items;
}

function setHeaderView(_view) {
	$.tableView.headerView = _view;
}

function setFooterView(_view) {
	$.tableView.footerView = _view;
}

function animate(_dict, _callback) {
	var animation = Ti.UI.createAnimation(_dict);
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		if (_callback) {
			_callback();
		}
	});
	$.widget.animate(animation);
}

function show(_callback) {
	if (!$.widget.visible) {
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
			if (_callback) {
				_callback();
			}
		});
		$.widget.animate(animation);
		return true;
	}
	return false;
}

function hide(_callback) {
	if ($.widget.visible) {
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
			if (_callback) {
				_callback();
			}
		});
		$.widget.animate(animation);
		return true;
	}
	return false;
}

function toggle(_callback) {
	if ($.widget.visible) {
		hide(_callback);
	} else {
		show(_callback);
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
