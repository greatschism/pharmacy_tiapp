var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper");

function didClickContinue(e) {
	var mobileNumber = $.mobileTxt.getValue();

	if (mobileNumber != "") {

		// app.navigator.open({
		// ctrl : "fullSignup",
		// titleid: "strSignup",
		// stack : true
		// });
		//

		app.navigator.open({
			ctrl : "textToApp",
			titleid : "",
			stack : true
		});
		// http.request({
		// method : "PATIENTS_MOBILE_EXISTS_OR_SHARED",
		//
		// data : {
		// client_identifier : "x",
		// version : "x",
		// mscripts_token : "x",
		// filter : null,
		// data : [{
		// patient : "x",
		// mobile_number : mobileNumber
		//
		// }]
		// },
		// success : didGetResponse
		// });
		//
		// }
		//
		//
		// else {
		// alert("please enter a valid mobile number");
		// }
		// }
		//
		// function didGetResponse(result) {
		// console.log("entered didgetresponse");
		// var isMobileShared = result.data.is_mobile_shared;
		// console.log(isMobileShared);
		// mobileExists = result.data.mobile_exists;
		// if (mobileExists !== 1) {
		// app.navigator.open({
		// ctrl : "fullSignup",
		// titleid : "strSignup",
		// stack : true,
		// ctrlArguments : {
		// firstName : mobileExists,
		// dateOfBirth : ""
		// }
		// });
		// } else {
		// if (isMobileShared == 1) {
		// //if it is shared  nav to text to app
		// app.navigator.open({
		// ctrl : "textToApp",
		// titleid : "",
		// stack : true
		// });
		//
		// }
		//
		// }
	}
}


			