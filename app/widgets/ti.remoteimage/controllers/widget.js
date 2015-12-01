var args = arguments[0] || {},
    uihelper = require("uihelper"),
    image;

(function() {

	var options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "images", "preventDefaultImage", "decodeRetries", "enableZoomControls", "backgroundColor", "backgroundImage", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	if (_.has(args, "image")) {
		setImage(args.image);
	}

})();

function setImage(img, dimg, encodURL) {
	var md5 = Ti.Utils.md5HexDigest(img) + getExtension(img),
	    savedFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "image-cache/" + md5);
	image = null;
	if (savedFile.exists()) {
		//update image
		image = savedFile.nativePath;
		//fire load
		fireLoad();
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
			url : img,
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
	//make sure this is a valid blob
	if (result) {
		//write file
		var file = Ti.Filesystem.getFile(passthrough);
		file.write(result);
		result = null;
		/**
		 * directly resizing the responseData (Blob)
		 * returns null on android (Samsung Note 2 - Android 4.4.2)
		 */
		if (_.has(args, "size")) {
			//uihelper should be under lib
			var result = uihelper.imageAsResized(file.read(), args.size.width, args.size.height);
			file.write(result.blob);
			result = blob = null;
		}
		//disable remote backups on ios
		if (OS_IOS) {
			file.setRemoteBackup(false);
		}
		file = null;
		//update image
		image = passthrough;
		//fire load
		fireLoad();
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
	}
}

/**
 * using actual image load
 * event may not fit here.
 * i.e when a alt text / loading image
 * has to be removed on load event, there
 * will be a slight delay
 */
function fireLoad() {
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
