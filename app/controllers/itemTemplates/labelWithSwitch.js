var args = arguments[0] || {};

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (args.styledlabel) {
		if (args.lblClasses) {
			$.lbl.applyProperties(_.extend({
				text : args.title || (args.data ? args.data[args.titleProperty] : "")
			}, $.createStyle({
				classes : args.lblClasses
			})));
		} else {
			$.lbl.setText(args.title || (args.data ? args.data[args.titleProperty] : ""));
		}
	} else {
		if (args.lblClasses) {
			$.resetClass($.lbl, args.lblClasses, {
				text : args.title || (args.data ? args.data[args.titleProperty] : "")
			});
		} else {
			$.lbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
		}
	}
})();

function didChangeToggle(e) {
	$.trigger("change", {
		value : e.value
	});
}

function getParams() {
	return args;
}

exports.getParams = getParams;
exports.setValue = $.swt.setValue;
exports.getValue = $.swt.getValue;
