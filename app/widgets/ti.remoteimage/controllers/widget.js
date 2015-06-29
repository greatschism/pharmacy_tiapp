var args = arguments[0] || {},
    image;

(function() {

	var options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "images", "backgroundColor", "backgroundImage", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	if (_.has(args, "image")) {
		setImage(args.image);
	}

})();

function setImage(img) {
	image = img;
	var md5 = Ti.Utils.md5HexDigest(image) + getExtension(image),
	    savedFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "image-cache/" + md5);
	if (savedFile.exists()) {
		$.widget.image = image = savedFile.nativePath;
		$.trigger("load", {
			image : image
		});
	} else {
		if (args.defaultImage) {
			$.widget.image = args.defaultImage;
		}
		require("http").request({
			url : image,
			type : "GET",
			format : "data",
			passthrough : savedFile.nativePath,
			success : didSuccess,
			failure : didFail
		});
	}
	savedFile = null;
}

function didSuccess(result, passthrough) {
	var cachedDir = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "image-cache");
	if (!cachedDir.exists()) {
		cachedDir.createDirectory();
	}
	cachedDir = null;
	var file = Ti.Filesystem.getFile(passthrough);
	file.write(result, false);
	file = null;
	$.widget.image = image = passthrough;
	$.trigger("load", {
		image : image
	});
}

function didFail(error, passthrough) {
	$.trigger("error", {
		code : error.code,
		error : error.error
	})
}

function getExtension(str) {
	var re = /(?:\.([^.]+))?$/,
	    tmpext = re.exec(str)[1];
	return ( tmpext ? "." + tmpext : "");
}

exports.setImage = setImage;
