var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment");

function init() {
	uihelper.getImage($.logoImg);
}

function didClickContinue() {
	var code = $.codeTxt.getValue();
	if (!code || code.length != 3) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valCodeRequired
		});
		return;
	}
	http.request({
		method : "patients_validate",
		data : {
			filter : [{
				type : "mobile_otp"
			}],
			data : [{
				patient : {
					mobile_number : args.mobileNumber,
					first_name : args.fname || null,
					birth_date : args.dob ? moment(args.dob).format(Alloy.CFG.apiCodes.date_format) : null,
					token : code
				}
			}]
		},
		passthrough : _.extend(args, {
			code : code
		}),
		success : didSuccess
	});
}

function didSuccess(result, passthrough) {
	app.navigator.open({
		ctrl : "accountCreation",
		titleid : "strSignup",
		stack : true,
		ctrlArguments : passthrough
	});
}

function didClickDidntGetText() {
	app.navigator.open({
		ctrl : "didntGetText",
		titleid : "titleTextHelp",
		stack : true,
		ctrlArguments : args
	});
}

exports.init = init;
