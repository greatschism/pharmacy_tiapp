var args = arguments[0] || {},
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 75,
    optionPadding = {
	top : 12,
	bottom : 12,
	left : 12,
	right : 12,
	height : Ti.UI.SIZE,
	layout : "horizontal",
	horizontalWrap : false
},
    font = args.font || {
	fontSize : 12
},
    choiceDict = {
	font : {
		fontSize : 12
	},
	ellipsize : true,
	wordWrap : false
},
    choices = [],
    titleProperty = args.titleProperty || "title",
    paddingLeft = args.paddingLeft || 12,
    color = args.color || "#000",
    selectedIndex = -1,
    parent;

if (OS_ANDROID) {
	MAX_HEIGHT /= Ti.Platform.displayCaps.logicalDensityFactor;
}

(function() {

	_.extend(choiceDict, _.pick(args, ["color", "font"]));
	choiceDict.height = choiceDict.font.fontSize + 5;

	if (_.has(args, "tableViewDict")) {
		$.tableView.applyProperties(tableViewDict);
	}

	if (_.has(args, "optionPadding")) {
		_.extend(optionPadding, args.optionPadding);
	}

	if (_.has(args, "parent")) {
		setParentView(args.parent);
	}

	if (_.has(args, "choices")) {
		setChoices(args.choices);
		if (_.has(args, "selectedIndex")) {
			setSelectedIndex(args.selectedIndex);
		}
	}

})();

function init() {
	var data = [];
	for (var i in choices) {
		data.push(getRow({
			title : choices[i][titleProperty],
			iconText : selectedIndex == i ? args.selectedIconText : ""
		}));
	}
	$.tableView.setData(data);
	/**
	 * +5 is some extra padding to keep it look good
	 */
	var height = ((choiceDict.height + optionPadding.top + optionPadding.bottom) * choices.length) + 5;
	$.tableView.height = MAX_HEIGHT > height ? height : MAX_HEIGHT;
	_.each(parent.children, function(child) {
		child.accessibilityHidden = true;
	});
	$.picker.addEventListener("postlayout", didPostlayout);
	parent.add($.picker);
}

function getRow(data) {
	var row = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE,
		selectionStyle : OS_IOS ? Ti.UI.iPhone.TableViewCellSelectionStyle.NONE : false,
		accessibilityLabel : data.title,
		accessibilityValue : data.iconText ? args.selectedAccessibilityValue || "Selected" : null
	}),
	    rowView = Ti.UI.createView(optionPadding);
	if (data.iconText) {
		var lbl = Ti.UI.createLabel({
			left : 0,
			text : data.iconText,
			color : args.selectedIconColor || "#000",
			font : args.iconFont || {
				fontSize : 12
			},
			accessibilityHidden : true
		});
		rowView.add(lbl);
	}
	rowView.add(Ti.UI.createLabel(_.extend(choiceDict, {
		text : data.title,
		left : data.iconText ? paddingLeft : 0,
		accessibilityHidden : true
	})));
	row.add(rowView);
	return row;
}

function terminate(callback) {
	_.each(parent.children, function(child) {
		child.accessibilityHidden = false;
	});
	var animation = Ti.UI.createAnimation({
		opacity : 0,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		parent.remove($.picker);
		if (callback) {
			callback();
		}
		$.trigger("terminate", {
			soruce : $,
			selectedIndex : selectedIndex,
			selectedItem : getSelectedItem(),
			nextItem : args.nextItem || ""
		});
	});
	$.picker.animate(animation);
}

function didPostlayout(e) {
	$.picker.removeEventListener("postlayout", didPostlayout);
	var animation = Ti.UI.createAnimation({
		opacity : 1,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		$.picker.opacity = 1;
		if (Ti.App.accessibilityEnabled) {
			Ti.App.fireSystemEvent( OS_IOS ? Ti.App.iOS.EVENT_ACCESSIBILITY_LAYOUT_CHANGED : Ti.App.Android.EVENT_ACCESSIBILITY_VIEW_FOCUS_CHANGED, $.tableView);
		}
	});
	$.picker.animate(animation);
}

function didClickTableView(e) {
	var index = e.index;
	if (index !== selectedIndex) {
		if (selectedIndex >= 0) {
			$.tableView.updateRow( OS_IOS ? selectedIndex : $.tableView.sections[0].rows[selectedIndex], getRow({
				title : choices[selectedIndex][titleProperty]
			}));
		}
		selectedIndex = index;
		$.tableView.updateRow( OS_IOS ? index : e.row, getRow({
			title : choices[selectedIndex][titleProperty],
			iconText : args.selectedIconText
		}));
	}
	$.trigger("change", {
		soruce : $,
		selectedIndex : selectedIndex,
		selectedItem : getSelectedItem()
	});
	if (args.autoHide !== false) {
		setTimeout(terminate, 150);
	}
}

function setParentView(view) {
	parent = view;
}

function getParentView() {
	return parent;
}

function setChoices(items) {
	choices = items;
	selectedIndex = -1;
}

function getChoices() {
	return choices;
}

function setSelectedIndex(index) {
	selectedIndex = index;
}

function getSelectedIndex() {
	return selectedIndex;
}

function getSelectedItem() {
	var item = {};
	if (selectedIndex >= 0 && selectedIndex < choices.length) {
		item = choices[selectedIndex];
	}
	return item;
}

exports.init = init;
exports.terminate = terminate;
exports.setChoices = setChoices;
exports.getChoices = getChoices;
exports.setParentView = setParentView;
exports.getParentView = getParentView;
exports.getSelectedItem = getSelectedItem;
exports.setSelectedIndex = setSelectedIndex;
exports.getSelectedIndex = getSelectedIndex;
