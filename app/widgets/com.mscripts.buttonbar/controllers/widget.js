var args = arguments[0] || {}, _items = [], _selectedIndex = -1, _toggleMode = true, _color = "#000", _selectedColor = "#0094d7", _backgroundColor = "transparent", _selectedBackgroundColor = "transparent", _font = {
	fontSize : 14
}, _separatorStyle = {
	right : 0,
	width : 1,
	backgroundColor : "#8b8b8b",
	touchEnabled : false
}, ldict = {
	width : "90%",
	height : (_font.fontSize + 10),
	font : _font,
	textAlign : "center",
	touchEnabled : false
};

if (OS_ANDROID || OS_MOBILEWEB) {
	_.extend(ldict, {
		ellipsize : true,
		wordWrap : false
	});
}

(function() {

	var options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	if (_.has(args, "color")) {
		setColor(args.color);
	}

	if (_.has(args, "selectedColor")) {
		setSelectedColor(args.selectedColor);
	}

	if (_.has(args, "backgroundColor")) {
		setBackgroundColor(args.backgroundColor);
	}

	if (_.has(args, "selectedBackgroundColor")) {
		setSelectedBackgroundColor(args.selectedBackgroundColor);
	} else {
		setSelectedBackgroundColor(args.backgroundColor);
	}

	if (_.has(args, "font")) {
		setFont(args.font);
	}

	if (_.has(args, "separatorStyle")) {
		setSeparatorStyle(args.separatorStyle);
	}

	if (_.has(args, "items")) {
		setItems(args.items);
	}

	if (_.has(args, "toggleMode")) {
		_toggleMode = args.toggleMode;
	}

	if (_toggleMode && _.has(args, "selectedIndex")) {
		setSelectedIndex(args.selectedIndex);
	}

})();

function setFont(font) {
	_font = font;
	ldict.font = _font;
	ldict.height = (_font.fontSize || 14) + 10;
}

function setColor(color) {
	_color = color;
}

function setSelectedColor(selectedColor) {
	_selectedColor = selectedColor;
}

function setBackgroundColor(backgroundColor) {
	_backgroundColor = backgroundColor;
}

function setSelectedBackgroundColor(selectedBackgroundColor) {
	_selectedBackgroundColor = selectedBackgroundColor;
}

function setSeparatorStyle(separatorStyle) {
	_.extend(_separatorStyle, separatorStyle);
}

function setItems(items) {

	var children = $.widget.children;
	for (var i in children) {
		$.widget.remove(children[i]);
	}

	_items = items;

	var itemW = String(Math.floor(100 / items.length)).concat("%");
	var itemH = $.widget.height;
	var l = _items.length - 1;
	for (var i in _items) {

		var item = _items[i];

		var btnView = Ti.UI.createView({
			index : i,
			width : item.width || itemW,
			height : itemH,
			backgroundColor : item.backgroundColor || _backgroundColor
		});

		btnView.addEventListener("singletap", didTap);

		if (item.image) {

			var imgDict = {
				image : item.image,
				touchEnabled : false
			};

			if (OS_MOBILEWEB) {
				_.extend(imgDict, {
					width : "auto",
					height : itemH
				});
			}

			if (_.has(item, "imageWidth")) {
				imgDict.width = item.imageWidth;
			}

			if (_.has(item, "imageHeight")) {
				imgDict.height = item.imageHeight;
			}

			if (item.title) {
				if (item.imageRight) {
					imgDict.right = item.imageRight;
				} else {
					imgDict.left = item.imageLeft || 10;
				}
			}

			btnView.add(Ti.UI.createImageView(imgDict));

		}

		if (item.title) {

			var label = {
				text : item.title,
				color : item.color || _color
			};
			_.extend(label, ldict);

			if (item.image) {

				label.width = Ti.UI.FILL;

				var viewDict = {
					touchEnabled : false
				};

				if (item.imageRight) {
					viewDict.right = item.imageRight + item.imageWidth + 10;
					label.left = OS_MOBILEWEB ? 20 : 10;
				} else {
					viewDict.left = (item.imageLeft || 10) + item.imageWidth + 10;
					label.right = OS_MOBILEWEB ? 20 : 10;
				}

				label.textAlign = item.textAlign || "left";
				var view = Ti.UI.createView(viewDict);
				view.add(Ti.UI.createLabel(label));
				btnView.add(view);

			} else {
				btnView.add(Ti.UI.createLabel(label));
			}
		}

		if (l != i) {
			btnView.add(Ti.UI.createView(_separatorStyle));
		}

		$.widget.add(btnView);
	}

}

function didTap(e) {

	var index = e.source.index;

	if (_toggleMode && _selectedIndex != index) {

		var children = $.widget.children;

		/**
		 * Apple Bug : http://stackoverflow.com/questions/22718172/uilabel-dotted-line-color-bug-in-ios-7-1
		 */

		if (_selectedIndex >= 0) {
			var dObj = _items[_selectedIndex];
			var dView = children[_selectedIndex];
			dView.backgroundColor = dObj.backgroundColor || _backgroundColor;
			var dChildren = dView.children;
			var dlen = dObj.title && dObj.image ? 2 : 1;
			for (var i = 0; i < dlen; i++) {
				var dItem = dChildren[i];
				if (dItem.apiName == "Ti.UI.ImageView") {
					dItem.image = dObj.image;
				} else {
					//Ti.UI.Label || Ti.UI.View - if image and button both are placed
					if (dItem.apiName == "Ti.UI.View") {
						dItem = dItem.children[0];
					}
					var text = dObj.title;
					if (OS_IOS) {
						dItem.attributedString = Titanium.UI.iOS.createAttributedString({
							text : text,
							attributes : [{
								type : Titanium.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
								value : dObj.color || _color,
								range : [0, text.length]
							}]
						});
					} else {
						dItem.applyProperties({
							text : text,
							color : dObj.color || _color
						});
					}
				}
			}
		}

		var sObj = _items[index];
		var sView = children[index];
		sView.backgroundColor = sObj.selectedBackgroundColor || _selectedBackgroundColor;
		var sChildren = sView.children;
		var slen = sObj.title && sObj.image ? 2 : 1;
		for (var i = 0; i < slen; i++) {
			var sItem = sChildren[i];
			if (sItem.apiName == "Ti.UI.ImageView") {
				sItem.image = sObj.selectedImage || sObj.image;
			} else {
				//Ti.UI.Label || Ti.UI.View - if image and button both are placed
				if (sItem.apiName == "Ti.UI.View") {
					sItem = sItem.children[0];
				}
				var text = sObj.selectedTitle || sObj.title;
				if (OS_IOS) {
					sItem.attributedString = Titanium.UI.iOS.createAttributedString({
						text : text,
						attributes : [{
							type : Titanium.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
							value : sObj.selectedColor || _selectedColor,
							range : [0, text.length]
						}]
					});
				} else {
					sItem.applyProperties({
						text : text,
						color : sObj.selectedColor || _selectedColor
					});
				}
			}
		}

		//to check whether it is simulated or triggered
		if (e.type) {
			$.trigger("change", {
				selectedItem : sObj,
				selectedIndex : index,
				previousIndex : _selectedIndex
			});
		}

		_selectedIndex = index;

	} else {

		//to check whether it is simulated or triggered
		if (e.type) {
			$.trigger("click", _items[index]);
		}

	}
}

function setSelectedIndex(index) {
	//simulate tap event to get the index selected
	didTap({
		source : {
			index : index
		}
	});
}

function getSelectedIndex(index) {
	return _selectedIndex;
}

exports.setFont = setFont;
exports.setColor = setColor;
exports.setItems = setItems;
exports.setSelectedIndex = setSelectedIndex;
exports.getSelectedIndex = getSelectedIndex;
exports.setSelectedColor = setSelectedColor;
exports.setSeparatorStyle = setSeparatorStyle;
exports.setBackgroundColor = setBackgroundColor;
exports.setSelectedBackgroundColor = setSelectedBackgroundColor;
