var args = arguments[0] || {},
    PICKER_HEIGHT = 240,
    SCREEN_HEIGHT = Ti.Platform.displayCaps.platformHeight,
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
	SCREEN_HEIGHT /= Ti.Platform.displayCaps.logicalDensityFactor;
}

(function() {

	$.picker.backgroundColor = args.backgroundColor || "#FFFFFF";

	_.extend(choiceDict, _.pick(args, ["color", "font"]));

	if (_.has(args, "toolbarDict")) {
		_.extend(args.toolbarDict, {
			font : font
		});
		$.toolbarView.applyProperties(args.toolbarDict);
		if (_.has(args.toolbarDict, "height")) {
			$.listView.applyProperties({
				top : args.toolbarDict.height,
				height : PICKER_HEIGHT - args.toolbarDict.height
			});
		}
	}

	if (_.has(args, "optionPadding")) {
		_.extend(optionPadding, args.optionPadding);
	}

	if (_.has(args, "leftTitle")) {
		$.leftBtn.title = args.leftTitle;
	}

	if (_.has(args, "rightTitle")) {
		$.rightBtn.title = args.rightTitle;
	}

	if (_.has(args, "leftBtnDict")) {
		_.extend(args.leftBtnDict, {
			font : font
		});
		$.leftBtn.applyProperties(args.leftBtnDict);
	}

	if (_.has(args, "rightBtnDict")) {
		_.extend(args.rightBtnDict, {
			font : font
		});
		$.rightBtn.applyProperties(args.rightBtnDict);
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

	$.picker.top = SCREEN_HEIGHT;

})();

function init() {
	var data = [];
	for (var i in choices) {
		data.push(getRow({
			title : choices[i][titleProperty],
			iconText : selectedIndex == i ? choices[i].iconText || args.selectedIconText || "+" : ""
		}));
	}
	$.listView.setData(data);
	$.picker.addEventListener("postlayout", didPostlayout);
	parent.add($.picker);
}

function getRow(_data) {
	var row = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE,
		selectionStyle : OS_IOS ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : false
	}),
	    rowView = Ti.UI.createView(optionPadding);
	if (_data.iconText) {
		var lbl = Ti.UI.createLabel({
			left : 0,
			text : _data.iconText,
			color : args.selectedIconColor || "#000",
			font : args.iconFont || {
				fontSize : 12
			}
		});
		rowView.add(lbl);
	}
	rowView.add(Ti.UI.createLabel(_.extend(choiceDict, {
		text : _data.title,
		left : _data.iconText ? paddingLeft : 0
	})));
	row.add(rowView);
	return row;
}

function terminate(_callback) {
	var animation = Ti.UI.createAnimation({
		top : SCREEN_HEIGHT,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		parent.remove($.picker);
		if (_callback) {
			_callback();
		}
		animation.removeEventListener("complete", onComplete);
	});
	$.picker.animate(animation);
}

function didPostlayout(e) {
	$.picker.removeEventListener("postlayout", didPostlayout);
	var top = (SCREEN_HEIGHT - PICKER_HEIGHT) - (args.containerPaddingTop || 0),
	    animation = Ti.UI.createAnimation({
		top : top,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		$.picker.top = top;
		animation.removeEventListener("complete", onComplete);
	});
	$.picker.animate(animation);
}

function didClickListView(e) {
	var index = e.index;
	if (index !== selectedIndex) {
		if (selectedIndex >= 0) {
			$.listView.updateRow(selectedIndex, getRow({
				title : choices[selectedIndex][titleProperty]
			}));
		}
		selectedIndex = index;
		$.listView.updateRow(selectedIndex, getRow({
			title : choices[selectedIndex][titleProperty],
			iconText : choices[selectedIndex].iconText || args.selectedIconText || "+"
		}));
		$.trigger("change", {
			soruce : $,
			selectedIndex : selectedIndex,
			selectedItem : getSelectedItem()
		});
	}
}

function didClickLeftBtn(e) {
	$.trigger("leftclick", {
		source : $
	});
}

function didClickRightBtn(e) {
	$.trigger("rightclick", {
		source : $,
		nextItem : args.nextItem || ""
	});
}

function setParentView(_parent) {
	parent = _parent;
}

function getParentView() {
	return parent;
}

function setChoices(_choices) {
	choices = _choices;
	selectedIndex = -1;
}

function getChoices() {
	return choices;
}

function setSelectedIndex(_index) {
	selectedIndex = _index;
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
