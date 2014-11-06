var args = arguments[0] || {},
    PICKER_HEIGHT = 290,
    height = Ti.Platform.displayCaps.platformHeight,
    choiceDict = {},
    choices = [],
    selectedIndex = -1,
    parent;

(function() {

	if (_.has(args, "backgroundColor")) {
		$.widget.backgroundColor = args.backgroundColor;
	}

	if (_.has(args, "toolbarDict")) {
		$.toolbar.applyProperties(args.toolbarDict);
	}

	if (_.has(args, "choiceDict")) {
		choiceDict = args.choiceDict;
	}

	if (_.has(args, "buttonDict")) {
		$.leftBtn.applyProperties(args.buttonDict);
		$.rightBtn.applyProperties(args.buttonDict);
	}

	if (_.has(args, "leftTitle")) {
		$.rightBtn.title = args.leftTitle;
	}

	if (_.has(args, "rightTitle")) {
		$.rightBtn.title = args.rightTitle;
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
		height = (height / (Ti.Platform.displayCaps.dpi / 160));
	}

	$.picker.top = height + PICKER_HEIGHT;

})();

function init() {
	if (OS_IOS || OS_ANDROID) {
		var items = [];
		for (var i in choices) {
			var titleProp = {
				text : choices[i].title
			};
			_.extend(titleProp, choiceDict);
			items.push({
				title : titleProp,
				image : {
					image : choices[i].image || WPATH("checked.png")
				},
				template : selectedIndex == i ? "checked" : "unchecked",
				properties : {
					selectionStyle : OS_IOS ? Ti.UI.iPhone.ListViewCellSelectionStyle.NONE : false
				}
			});
		}
		$.section.setItems(items);
	} else {
		var data = [];
		for (var i in choices) {
			data.push(getRow({
				title : choices[i].title,
				image : selectedIndex == i ? choices[i].image || WPATH("checked.png") : false
			}));
		}
		$.listView.setData(data);
	}
	$.picker.addEventListener("postlayout", didPostlayout);
	parent.add($.picker);
}

function getRow(data) {
	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow",
		classes : ["height-48d"]
	});
	if (data.image) {
		var image = $.UI.create("ImageView", {
			apiName : "ImageView",
			classes : ["checked"]
		});
		image.image = data.image;
		row.add(image);
	}
	var title = $.UI.create("Label", {
		apiName : "Label",
		classes : ["title"]
	});
	choiceDict.text = data.title;
	title.applyProperties(choiceDict);
	row.add(title);
	return row;
}

function terminate(callback) {
	var animation = Ti.UI.createAnimation({
		top : height + PICKER_HEIGHT,
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
	var top = height - PICKER_HEIGHT;
	var animation = Ti.UI.createAnimation({
		top : top,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		$.picker.top = top;
		animation.removeEventListener("complete", onComplete);
	});
	$.picker.animate(animation);
}

function didItemClick(e) {
	var itemIndex = e.itemIndex;
	if (itemIndex !== selectedIndex) {
		var section = e.section;
		if (selectedIndex >= 0) {
			var toUncheck = section.getItemAt(selectedIndex);
			toUncheck.template = "unchecked";
			$.section.updateItemAt(selectedIndex, toUncheck);
		}
		selectedIndex = itemIndex;
		var toCheck = section.getItemAt(selectedIndex);
		toCheck.template = "checked";
		$.section.updateItemAt(selectedIndex, toCheck);
		$.trigger("change", {
			selectedIndex : selectedIndex,
			selectedItem : getSelectedItem()
		});
	}
}

function didTVRClick(e) {
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
			image : choices[selectedIndex].image || WPATH("checked.png")
		}));
		$.trigger("change", {
			selectedIndex : selectedIndex,
			selectedItem : getSelectedItem()
		});
	}
}

function didLeftClick(e) {
	$.trigger("leftclick");
}

function didRightClick(e) {
	$.trigger("rightclick");
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
