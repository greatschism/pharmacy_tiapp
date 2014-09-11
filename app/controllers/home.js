var args = arguments[0] || {}, App = require("core");

function init() {
	var icons = Alloy.CFG.icons;
	for (var i in icons) {
		var view = getView();
		var sections = icons[i];
		var width = Math.floor(Ti.Platform.displayCaps.platformWidth / sections.length);
		for (var j in sections) {
			view.add(getImage(sections[j].image, width));
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

function getImage(image, width) {
	var image = "/images/home/".concat(image), height;
	if (!OS_MOBILEWEB) {
		var blob = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, image).read();
		height = (blob.height / blob.width) * width;
		if (OS_ANDROID) {
			width = width / (App.Device.dpi / 160);
			height = height / (App.Device.dpi / 160);
		}
	} else {
		height = "auto";
	}
	return createImage(image, width, height);
}

function createImage(image, width, height) {
	if (OS_MOBILEWEB)
		return Ti.UI.createImageView({
			left : 0,
			width : width,
			height : height,
			image : image
		});
	else
		return Ti.UI.createView({
			left : 0,
			width : width,
			height : height,
			backgroundImage : image
		});
}

exports.init = init;
