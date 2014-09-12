var args = arguments[0] || {}, options;

options = _.pick(args, ["font", "color", "textAlign", "text"]);
if (!_.isEmpty(options)) {
	$.messageLbl.applyProperties(options);
}

if (_.has(args, "message")) {
	setMessage(args.message);
}

$.activityIndicator.show();

function setMessage(message) {
	console.log(message);
	$.messageLbl.setText(message);
}

exports.setMessage = setMessage; 