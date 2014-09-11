var args = arguments[0] || {}, App = require("core");

function init() {
	var icons = Alloy.CFG.icons;
	for (var i in icons) {
		var view = getView();
		var sections = icons[i];
		var width = Math.floor(Ti.Platform.displayCaps.platformWidth / sections.length);
		for (var j in sections) {
			var image = "/images/home/".concat(sections[j].image);
			var imageView = OS_MOBILEWEB ? getMImage(image, width) : getNImage(image, width);
			imageView.navigation = sections[j].navigation || {};
			imageView.addEventListener("click", didItemClick);
			view.add(imageView);
		}
		$.scrollView.add(view);
	}
}

function getView() {
	return Ti.UI.createView({
		top : 0,
		width : "100%",
		height : Ti.UI.SIZE,
		layout : "horizontal"
	});
}

function getNImage(image, width) {
	var blob = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, image).read(), height;
	height = (blob.height / blob.width) * width;
	blob = null;
	if (OS_ANDROID) {
		width = width / (App.Device.dpi / 160);
		height = height / (App.Device.dpi / 160);
	}
	return Ti.UI.createView({
		left : 0,
		width : width,
		height : height,
		backgroundImage : image
	});
}

function getMImage(image, width) {
	return Ti.UI.createImageView({
		left : 0,
		width : width,
		height : "auto",
		image : image
	});
}

function didItemClick(e) {
	var navigation = e.source.navigation;
	if (!_.isEmpty(navigation)) {
		App.Navigator.open(navigation);
	}
}

exports.init = init;
