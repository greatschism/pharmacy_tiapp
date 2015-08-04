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

function setImage(img, dimg, encodURL) {
	image = img;
	var md5 = Ti.Utils.md5HexDigest(image) + getExtension(image),
	    savedFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "image-cache/" + md5);
	if (savedFile.exists()) {
		$.widget.image = image = savedFile.nativePath;
		$.trigger("load", {
			image : image
		});
	} else {
		dimg = dimg || args.defaultImage;
		if (dimg) {
			$.widget.image = dimg;
		}
		/**
		 * requires http module
		 * autoEncodeUrl of HTTPClient is true by default
		 * in our case we set it to false by default
		 */
		require("http").request({
			url : image,
			autoEncodeUrl : _.isUndefined(encodURL) ? false : encodURL,
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
	});
}

function getExtension(str) {
	var re = /(?:\.([^.]+))?$/,
	    ext = re.exec(str)[1] || "",
	    n = ext.indexOf("?");
	if (n != -1) {
		ext = ext.substring(0, n);
	}
	return ( ext ? "." + ext : "");
}

exports.setImage = setImage;
