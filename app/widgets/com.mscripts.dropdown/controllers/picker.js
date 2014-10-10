var args = arguments[0] || {},
    PICKER_HEIGHT = 340,
    _height = Ti.Platform.displayCaps.platformHeight,
    _choiceDict = {},
    _choices = [],
    _selectedIndex = -1,
    _parent;

(function() {

	if (_.has(args, "backgroundColor")) {
		$.widget.backgroundColor = args.backgroundColor;
	}

	if (_.has(args, "toolbarDict")) {
		$.toolbar.applyProperties(args.toolbarDict);
	}

	if (_.has(args, "choiceDict")) {
		_choiceDict = args._choiceDict;
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
		_height = (_height / (Ti.Platform.displayCaps.dpi / 160));
	}

	$.picker.top = _height + PICKER_HEIGHT;

})();

function init() {
	if (OS_IOS || OS_ANDROID) {
		var items = [];
		for (var i in _choices) {
			var titleProp = {
				text : _choices[i].title
			};
			_.extend(titleProp, _choiceDict);
			items.push({
				title : titleProp,
				image : {
					image : _choices[i].image || WPATH("checked.png")
				},
				template : _selectedIndex == i ? "checked" : "unchecked",
				properties : {
					selectionStyle : OS_IOS ? Ti.UI.iPhone.ListViewCellSelectionStyle.NONE : false
				}
			});
		}
		$.section.setItems(items);
	} else {
		var data = [];
		for (var i in _choices) {
			data.push(getRow({
				title : _choices[i].title,
				image : _selectedIndex == i ? _choices[i].image || WPATH("checked.png") : false
			}));
		}
		$.listView.setData(data);
	}
	$.picker.addEventListener("postlayout", didPostlayout);
	_parent.add($.picker);
}

function getRow(data) {
	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow",
		classes : ["row"]
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
	_choiceDict.text = data.title;
	title.applyProperties(_choiceDict);
	row.add(title);
	return row;
}

function terminate(callback) {
	var animation = Ti.UI.createAnimation({
		top : _height + PICKER_HEIGHT,
		duration : 300
	});
	animation.addEventListener("complete", function onComplete() {
		_parent.remove($.picker);
		if (callback) {
			callback();
		}
		animation.removeEventListener("complete", onComplete);
	});
	$.picker.animate(animation);
}

function didPostlayout(e) {
	$.picker.removeEventListener("postlayout", didPostlayout);
	var top = _height - PICKER_HEIGHT;
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
	if (itemIndex !== _selectedIndex) {
		var section = e.section;
		if (_selectedIndex >= 0) {
			var toUncheck = section.getItemAt(_selectedIndex);
			toUncheck.template = "unchecked";
			$.section.updateItemAt(_selectedIndex, toUncheck);
		}
		_selectedIndex = itemIndex;
		var toCheck = section.getItemAt(_selectedIndex);
		toCheck.template = "checked";
		$.section.updateItemAt(_selectedIndex, toCheck);
		$.trigger("change", {
			selectedIndex : _selectedIndex,
			selectedItem : getSelectedItem()
		});
	}
}

function didTVRClick(e) {
	var index = e.index;
	if (index !== _selectedIndex) {
		if (_selectedIndex >= 0) {
			$.listView.updateRow(_selectedIndex, getRow({
				title : _choices[_selectedIndex].title
			}));
		}
		_selectedIndex = index;
		$.listView.updateRow(_selectedIndex, getRow({
			title : _choices[_selectedIndex].title,
			image : _choices[_selectedIndex].image || WPATH("checked.png")
		}));
		$.trigger("change", {
			selectedIndex : _selectedIndex,
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

function setParentView(parent) {
	_parent = parent;
}

function getParentView() {
	return _parent;
}

function setChoices(choices) {
	_choices = choices;
	_selectedIndex = -1;
}

function getChoices() {
	return _choices;
}

function setSelectedIndex(index) {
	_selectedIndex = index;
}

function getSelectedIndex() {
	return _selectedIndex;
}

function getSelectedItem() {
	var item = {};
	if (_selectedIndex >= 0 && _selectedIndex < _choices.length) {
		item = _choices[_selectedIndex];
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
