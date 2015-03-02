var args = arguments[0] || {},
    PICKER_HEIGHT = 240,
    SCREEN_HEIGHT = Ti.Platform.displayCaps.platformHeight,
    choiceDict = {
	top : 12,
	bottom : 12,
	left : 12,
	right : 12,
	height : Ti.UI.SIZE,
	layout : "horizontal",
	horizontalWrap : false
},
    font = {
	fontSize : 12
},
    choices = [],
    selectedIndex = -1,
    parent;

(function() {

	$.picker.backgroundColor = args.backgroundColor || "#FFFFFF";

	if (_.has(args, "toolbarDict")) {
		$.toolbarView.applyProperties(args.toolbarDict);
		if (_.has(args.toolbarDict, "height")) {
			$.listView.applyProperties({
				top : args.toolbarDict.height,
				height : PICKER_HEIGHT - args.toolbarDict.height
			});
		}
	}

	if (_.has(args, "choiceDict")) {
		if (_.has(args.choiceDict, "font")) {
			font = args.choiceDict.font;
		}
		_.extend(choiceDict, args.choiceDict);
	}

	if (_.has(args, "leftTitle")) {
		$.leftBtn.title = args.leftTitle;
	}

	if (_.has(args, "rightTitle")) {
		$.rightBtn.title = args.rightTitle;
	}

	if (_.has(args, "leftBtnDict")) {
		$.leftBtn.applyProperties(args.leftBtnDict);
	}

	if (_.has(args, "rightBtnDict")) {
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

	if (OS_ANDROID) {
		SCREEN_HEIGHT /= Ti.Platform.displayCaps.logicalDensityFactor;
	}

	$.picker.top = SCREEN_HEIGHT;

})();

function init() {
	var data = [];
	for (var i in choices) {
		data.push(getRow({
			title : choices[i].title,
			iconText : selectedIndex == i ? choices[i].iconText || args.selectionIconText || "+" : ""
		}));
	}
	$.listView.setData(data);
	$.picker.addEventListener("postlayout", didPostlayout);
	parent.add($.picker);
}

function getRow(data) {
	var row = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE,
		selectionStyle : OS_IOS ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : false
	}),
	    rowView = Ti.UI.createView(choiceDict);
	if (data.iconText) {
		var lbl = Ti.UI.createLabel({
			left : 0,
			text : data.iconText,
			color : args.iconSelectionColor || "#000",
			font : args.iconFont || {
				fontSize : 12
			}
		});
		rowView.add(lbl);
	}
	var titleLbl = Ti.UI.createLabel({
		left : args.paddingLeft || 12,
		text : data.title,
		font : font,
		color : args.color || "#000"
	});
	rowView.add(titleLbl);
	row.add(rowView);
	return row;
}

function terminate(callback) {
	var animation = Ti.UI.createAnimation({
		top : SCREEN_HEIGHT,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		parent.remove($.picker);
		if (callback) {
			callback();
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
				title : choices[selectedIndex].title
			}));
		}
		selectedIndex = index;
		$.listView.updateRow(selectedIndex, getRow({
			title : choices[selectedIndex].title,
			iconText : choices[selectedIndex].iconText || args.selectionIconText || "+"
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
