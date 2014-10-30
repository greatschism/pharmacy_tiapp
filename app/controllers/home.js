var args = arguments[0] || {},
    app = require("core");

(function() {
	var icons = Alloy.CFG.icons;
	for (var i in icons) {
		var view = getView();
		var sections = icons[i];
		var width = Math.floor(Ti.Platform.displayCaps.platformWidth / sections.length);
		for (var j in sections) {
			var image = "/images/home/".concat(sections[j].image);
			var imageView = OS_MOBILEWEB ? getMImage(image, width) : getNImage(sections[j].image, image, width);
			imageView.navigation = sections[j].navigation || {};
			imageView.addEventListener("click", didItemClick);
			view.add(imageView);
		}
		$.scrollView.add(view);
	}
	if (OS_IOS || OS_ANDROID) {
		$.scrollView.animate(Ti.UI.createAnimation({
			opacity : 1,
			duration : 300
		}));
	}
})();

function getView() {
	return Ti.UI.createView({
		top : 0,
		width : "100%",
		height : Ti.UI.SIZE,
		layout : "horizontal"
	});
}

function getNImage(name, image, width) {
	var height = Ti.App.Properties.getInt(String(name).concat(width), 0),
	    blob;
	if (!height) {
		blob = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, image).read();
		height = Math.floor((blob.height / blob.width) * width);
		blob = null;
		Ti.App.Properties.setInt(String(name).concat(width), height);
	}
	if (OS_ANDROID) {
		width = width / (app.device.dpi / 160);
		height = height / (app.device.dpi / 160);
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
		app.navigator.open(navigation);
	}
}