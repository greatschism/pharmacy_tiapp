var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment");

function init() {
	uihelper.getImage($.logoImg);
}

function setParentViews(_view) {
	$.dob.setParentView(_view);
}

function moveToNext(e) {
	$.dob.focus();
}

function didClickNext() {
	var fname = $.fnameTxt.getValue(),
	    dob = $.dob.getValue();
	if (!fname) {
		dialog.show({
			message : Alloy.Globals.strings.valFirstNameRequired
		});
		return;
	}
	if (!dob) {
		dialog.show({
			message : Alloy.Globals.strings.valDOBRequired
		});
		return;
	}
	if (args.orgin == "login") {
		console.log("from login");
		//	http.request({
		//			method : "PATIENTS_AUTHENTICATE", //to be mscripts-authenticate
		//			data : {
		//data : [{
		//	patient : {
		//			mobile_number : args.mobileNumber,
		//				//first_name : fname,
		//					//birth_date : moment(dob).format("MM-DD-YYYY"),
		//						password : args.password
		//					}
		//				}]
		//			},
		//			success : didMscriptsAuthenticate
		//		});
		app.navigator.open({
			ctrl : "createUsername",
			titleid : "titlecreateUsername",
			stack : true
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
						birth_date : moment(dob).format("MM-DD-YYYY")
					}
				}]
			},
			passthrough : _.extend(args, {
				fname : fname,
				dob : dob
			}),
			success : didSendOTP
		});
	}
}

function didMscriptsAuthenticate(_result) {
	//Authenticate
	app.navigator.open({
		ctrl : "createUsername",
		titleid : "titlecreateUsername"
	});
}

function didSendOTP(_result, _passthrough) {
	app.navigator.open({
		ctrl : "textToApp",
		stack : true,
		ctrlArguments : _passthrough
	});
}

exports.init = init;
exports.setParentViews = setParentViews;
