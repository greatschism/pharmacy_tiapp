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
		//update image
		image = savedFile.nativePath;
		//apply properties
		if (_.has(args, "size")) {
			$.widget.applyProperties({
				width : args.size.width,
				height : args.size.height,
				image : image
			});
		} else {
			$.widget.image = image;
		}
		//trigger load event
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

function didSuccess(blob, passthrough) {
	var cachedDir = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "image-cache");
	if (!cachedDir.exists()) {
		cachedDir.createDirectory();
	}
	cachedDir = null;
	//make sure this is a valid blob
	if (blob) {
		var file = Ti.Filesystem.getFile(passthrough);
		if (_.has(args, "size")) {
			/**
			 * converting dp to px
			 * for imageAsResized
			 */
			var logicalDensityFactor = OS_ANDROID ? Ti.Platform.displayCaps.logicalDensityFactor : Ti.Platform.displayCaps.dpi / 160;
			blob = blob.imageAsResized(args.size.width * logicalDensityFactor, args.size.height * logicalDensityFactor);
		}
		file.write(blob, false);
		file = null;
		//update image
		image = passthrough;
		//apply properties
		if (_.has(args, "size")) {
			$.widget.applyProperties({
				width : args.size.width,
				height : args.size.height,
				image : image
			});
		} else {
			$.widget.image = image;
		}
		//trigger load event
		$.trigger("load", {
			image : image
		});
	}
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
