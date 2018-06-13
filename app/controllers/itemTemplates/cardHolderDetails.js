var args = $.args,
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    logger = require("logger");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	logger.debug("\n\n\n args in template		", JSON.stringify(args, null, 4), "\n\n\n");
	if (args.name) {
		var name = args.name || (args.data ? args.data[args.nameProperty] : "");
		if (args.titleClasses) {
			$.resetClass($.nameTxt, args.titleClasses, {
				value : name
			});
		} else {
			$.nameTxt.setValue(name);
		}
	}

	var address = args.address || (args.data ? args.data[args.addressProperty] : "");
	if (args.subtitleClasses) {
		$.resetClass($.addressTxt, args.subtitleClasses, {
			value : address,
		});
	} else {
		$.addressTxt.setValue(address);
	}

	var city = args.city || (args.data ? args.data[args.cityProperty] : "");
	if (args.detailClasses) {
		$.resetClass($.cityTxt, args.detailClasses, {
			value : city,
		});
	} else {
		$.cityTxt.setValue(city);
	}

	var state = args.state || (args.data ? args.data[args.stateProperty] : "");
	if (args.detailClasses) {
		$.resetClass($.stateTxt, args.detailClasses, {
			value : state,
		});
	} else {
		$.stateTxt.setValue(state);
	}

	var zip = args.zip || (args.data ? args.data[args.zipProperty] : "");
	if (args.detailClasses) {
		$.resetClass($.zipTxt, args.detailClasses, {
			value : zip,
		});
	} else {
		$.zipTxt.setValue(zip);
	}

	if (args.phone) {
		var phone = args.phone || (args.data ? args.data[args.phoneProperty] : "");
		logger.debug("phone 			", phone, "\n\n\n");
		if (args.detailClasses) {
			$.resetClass($.phoneTxt, args.detailClasses, {
				value : phone,
			});
		} else {
			$.phoneTxt.setValue(phone);
		}
	}

	if (args.instructions) {
		var desc = args.instructions || (args.data ? args.data[args.instructionsProperty] : "");
		logger.debug("instructions 			", desc, "\n\n\n");
		if (args.detailClasses) {
			$.resetClass($.descTxt, args.detailClasses, {
				value : desc,
			});
		} else {
			$.descTxt.setValue(desc);
		}
	}
})();

function getParams() {
	return args;
}

function getValues() {
	var txtValues = {
		address : $.addressTxt.getValue(),
		city : $.cityTxt.getValue(),
		state : $.stateTxt.getValue(),
		zip : $.zipTxt.getValue()
	};

	if (args.name) {
		_.extend(txtValues, {
			name : $.nameTxt.getValue()
		});
	}

	if (args.phone) {
		_.extend(txtValues, {
			phone : $.phoneTxt.getValue()
		});
	}

	if (args.instructions) {
		_.extend(txtValues, {
			instructions : $.descTxt.getValue()
		});
	}
	logger.debug("txtValues in getValues 			", JSON.stringify(txtValues), "\n\n\n");

	return txtValues;
}

function didClickPhone(e) {
	logger.debug("\n\n\n\n\n completed passing control to parent\n\n\n");
	var source = e.source;
	$.trigger("clickphone", {
		source : $,
		title : "",
		data : args
	});
}

function didClickDeliver(e) {
	var source = e.source;
	$.trigger("clickdeliver", {
		source : $,
		title : "",
		data : args
	});
}

function didChangeZip(e) {
	var value = e.value,
	    len = value.length;
	if (isNaN(Number(value))) {
		$.zipTxt.setValue(value.substr(0, len - 1));
		$.zipTxt.setSelection(len-1, len-1);

	} else {
		$.zipTxt.setValue(value);
		$.zipTxt.setSelection(len, len);
	}
}

function didChangePhone(e) {
	logger.debug("\n\n\n\n\n e.value	", e.value, "\n\n\n");
	var value = utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

exports.getParams = getParams;
exports.getValues = getValues;

