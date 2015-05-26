var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment");

function init() {
	uihelper.getImage($.logoImg);
}

function setParentViews(view) {
	$.dob.setParentView(view);
}

function moveToNext(e) {
	$.dob.focus();
}

function didClickNext() {
	var fname = $.fnameTxt.getValue(),
	    dob = $.dob.getValue();
	if (!fname) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valFirstNameRequired
		});
		return;
	}
	if (!dob) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valDOBRequired
		});
		return;
	}
	if (args.orgin == "login") {
		http.request({
			method : "PATIENTS_AUTHENTICATE",
			data : {
				data : [{
					patient : {
						mobile_number : args.mobileNumber,
						first_name : fname,
						birth_date : moment(dob).format(Alloy.CFG.apiCodes.DATE_FORMAT),
						password : args.password
					}
				}]
			},
			success : didAuthenticateMobileUser
		});
	} else {
		http.request({
			method : "PATIENTS_MOBILE_GENERATE_OTP",
			data : {
				filter : [{
					type : "mobile_otp"
				}],
				data : [{
					patient : {
						mobile_number : args.mobileNumber,
						first_name : fname,
						birth_date : moment(dob).format(Alloy.CFG.apiCodes.DATE_FORMAT)
					}
				}]
			},
			success : didSendOTP
		});
	}
}

function didAuthenticateMobileUser(result) {
	app.navigator.open({
		ctrl : "createUsername",
		titleid : "titleCreateUsername",
		stack : true,
		ctrlArguments : {
			password : args.password
		}
	});
}

function didSendOTP(result) {
	app.navigator.open({
		ctrl : "textToApp",
		stack : true,
		ctrlArguments : _.extend(args, {
			fname : $.fnameTxt.getValue(),
			dob : $.dob.getValue()
		})
	});
}

exports.init = init;
exports.setParentViews = setParentViews;
