var args = arguments[0] || {},
    TAG = "banner";

(function() {
	$.descriptionLbl.text = args.description;
	$.bannerImg.setImage(args.image_url);
})();

function didClick(e) {
	if (args.action_url) {
		Ti.Platform.openURL(args.action_url);
	}
}

function didError(e) {
	require("logger").error(TAG, "unable to load image from url", args.image_url);
}

function didLoad(e) {
	$.descriptionLbl.visible = false;
}
