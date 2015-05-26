var args = arguments[0] || {};

(function() {

	$.optionDialog = Ti.UI.createOptionDialog(args);
	$.optionDialog.addEventListener("click", didCick);

})();

function didCick(e) {
	$.trigger("click", {
		cancel : e.index === (_.has(args, "cancel") ? args.cancel : -1),
		index : e.index
	});
}

function show() {
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
