var args = arguments[0] || {};

(function() {

	$.optionDialog = Ti.UI.createOptionDialog(args);
	$.optionDialog.addEventListener("click", didCick);

})();

function didCick(e) {
	$.trigger("click", {
		cancel : e.index !== (_.has(args, "cancel") ? args.cancel : -1),
		index : e.index
	});
}

function show() {
	$.optionDialog.show();
}

function hide() {
	$.optionDialog.hide();
}

function applyProperties(_properties) {
	$.optionDialog.applyProperties(_properties);
	_.extend(args, _properties);
}

exports.show = show;
exports.hide = hide;
exports.setOptions = applyProperties;
