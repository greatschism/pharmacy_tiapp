var args = $.args,
    cancelIndex,
    keyboardModule = require("com.mscripts.hidekeyboard");

(function() {

	/**
	 * for android cancel
	 * can be a button rather
	 * than a option
	 */
	cancelIndex = _.has(args, "cancel") ? args.cancel : -1;
	if (OS_ANDROID && cancelIndex >= 0) {
		args.buttonNames = [args.options[cancelIndex]];
		args.options.splice(cancelIndex, 1);
	}

	$.optionDialog = Ti.UI.createOptionDialog(args);
	$.optionDialog.addEventListener("click", didCick);

})();

function didCick(e) {
	var isCancel,
	    selectedIndex = e.index;
	if (OS_ANDROID && cancelIndex >= 0) {
		isCancel = e.button;
		/**
		 * i.e: options = ['a','b','cancel']
		 * when cancel is at last index
		 * won't affect the array
		 *
		 * in case if options = ['cancel','a','b']
		 * here cancel is at 0th index
		 * during splice 'a' will come to 0th index
		 * so selected index has to be incremented
		 */
		if (selectedIndex >= cancelIndex) {
			selectedIndex++;
		}
	} else {
		isCancel = selectedIndex === cancelIndex;
	}
	$.trigger("click", {
		index : selectedIndex,
		cancel : isCancel
	});
}

function show() {
	/**
	 * In iOS the action sheet hides
	 * the keyboard by default
	 */
	if (OS_ANDROID && Ti.App.keyboardVisible) {
    	keyboardModule.hideKeyboard();
	}
	$.optionDialog.show();
}

function hide() {
	$.optionDialog.hide();
}

function applyProperties(properties) {
	$.optionDialog.applyProperties(properties);
	_.extend(args, properties);
}

function destroy() {
	$.optionDialog.removeEventListener("click", didCick);
	$.optionDialog = null;
}

exports.show = show;
exports.hide = hide;
exports.destroy = destroy;
exports.applyProperties = applyProperties;
