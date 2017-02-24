var args = $.args,
    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    rx = require("rx"),
    rxTxtHeight = 113,
    dob = [],
    fname = [],
    lname = [],
    mobileNumber,
    rightIconDict = $.createStyle({
	classes : ["margin-right-small", "i5", "negative-fg-color", "bg-color-disabled", "touch-enabled", "icon-unfilled-remove"],
	id : "removeBtn"
}),
    rxTxts = [$.nameView],
    apiCodes = Alloy.CFG.apiCodes,
    rightButtonDict = $.createStyle({
	classes : ["margin-right-large", "i5", "active-fg-color", "bg-color-disabled", "touch-enabled"],
}),
    rightButtonTitle = $.createStyle({
	classes : ["icon-help"],
}),
    rightPwdButtonDict = $.createStyle({
	classes : ["txt-positive-right-btn", "positive-fg-color"],
	title : Alloy.Globals.strings.strShow,
	width : "25%",
	backgroundColor : 'transparent'
}),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    rxContainerViewFromTop = 0,
    store = {},
    optionalValues = null,
    logger = require("logger");

function init() {
	/**
	 * PHA-1425 : Add the help image
	 * inside the rx number textfield.
	 */
	/**
	 * Set the right button "show/hide"
	 * with right parameters.
	 */

	$.uihelper.getImage("logo", $.logoImg);
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);

	if (args.fname) {
		$.fnameTxt.setValue(args.fname);
	}
	if (args.dob) {
		$.dob.setValue(args.dob);
	}
	if (args.is_migrated_user || args.is_store_user || args.dispensing_account_exists) {
		optionalValues = {};
		if (args.is_migrated_user) {
			optionalValues.is_migrated_user = args.is_migrated_user;
		}
		if (args.is_store_user) {
			optionalValues.is_store_user = args.is_store_user;
		}
		if (args.dispensing_account_exists) {
			optionalValues.dispensing_account_exists = args.dispensing_account_exists;
		}
	}

	if (Alloy.Globals.isLoggedIn) {
	//	getAllPharmacy();
		var mPatient = Alloy.Collections.patients.at(0);
		$.fnameTxt.setValue(mPatient.get("first_name"));
		$.lnameTxt.setValue(mPatient.get("last_name"));
		$.dob.setValue(moment(mPatient.get("birth_date"), Alloy.CFG.apiCodes.dob_format).toDate());

		var value = $.utilities.formatPhoneNumber(mPatient.get("mobile_number")),
		    len = value.length;
		$.moNumberTxt.setValue(value);
		$.moNumberTxt.setSelection(len, len);

		if (store) {
			store.shouldUpdate = false;
			$.storeTitleLbl.text = store.title;
		}
	}

}

function focus() {
	/**
	 * if shouldUpdate is true
	 * fetch the store details from the 'store' variable passed by reference
	 */

	// alert($.nameView.getRect().height);
	if (store && store.shouldUpdate) {
		store.shouldUpdate = false;
		$.storeTitleLbl.text = store.title;
	}
}

function setParentView(view) {
	$.dob.setParentView(view);
}

function didPostlayoutRxContainerView(e) {
	$.contanierViewInfo.removeEventListener("postlayout", didPostlayoutRxContainerView);
	rxContainerViewFromTop = e.source.rect.y;
}

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
}
/*
function getAllPharmacy() {
	/**
	 *step 1: get the stores, step 2: Identify the home pharmacy, step 3: get store details for home pharmacy
	 
	$.http.request({
		method : "stores_list",
		params : {
			data : [{
				stores : {
					search_criteria : "",
					user_lat : "",
					user_long : "",
					search_lat : "",
					search_long : "",
					view_type : "LIST"
				}
			}]
		},
		errorDialogEnabled : false,
		success : getHomePharmacy,
		failure : didGetNoStore
	});
}

function didGetNoStore() {
	// getOrSetPickupModes();

}

function getHomePharmacy(result) {

	if (Alloy.Globals.isLoggedIn) {
		_.each(result.data.stores.stores_list, function(store) {
			if (parseInt(store.ishomepharmacy)) {
				$.http.request({
					method : "stores_get",
					params : {
						data : [{
							stores : {
								id : store.id,
							}
						}]
					},
					keepLoader : Alloy.Models.pickupModes.get("code_values") ? false : true,
					success : didGetStore,
					failure : didFail
				});
			}
		});
	}

}

function didGetStore(result, passthrough) {
	logger.debug("\n\n\n in didgetstore result", JSON.stringify(result, null, 4), "\n\n\n");
	/**
	 * update properties to object
	 * don't replace, if then might clear the reference
	 * when passed through the controllers
	 
	_.extend(store, result.data.stores);
	_.extend(store, {
		title : $.utilities.ucword(store.addressline1),
		subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip
	});

	$.storeTitleLbl.text = store.title;
	$.app.navigator.hideLoader();
	logger.debug("\n\n\n in didgetstore store obj", JSON.stringify(store, null, 4), "\n\n\n");

}
*/
function didClickPharmacy(e) {
	$.app.navigator.open({
		titleid : "titleStores",
		ctrl : "stores",
		ctrlArguments : {
			store : store,
			selectable : true
		},
		stack : true
	});
}

function moveToNext(e) {

}

function didClickSignup(e) {
	/*
	 * Need to re-write the getValue() logic
	 */
	dob = [];
	fname = [];
	lname = [];

	var _viewCount = $.contanierViewInfo.children.length;
	for ( s = 0; s < _viewCount; s++) {
		var fvalue = $.contanierViewInfo.children[s].children[0].children[0].children[0].getValue();
		if (!fvalue) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValFirstName
			});
			return;
		} else if (!utilities.validateName(fvalue)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValFirstNameInvalid
			});
			return;
		} else {
			fname.push(fvalue);
		}

		var lvalue = $.contanierViewInfo.children[s].children[0].children[1].children[0].getValue();
		if (!lvalue) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValLastName
			});
			return;
		} else if (!utilities.validateName(lvalue)) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.registerValLastNameInvalid
			});
			return; 
		} else {
			lname.push(lvalue);
		}
		/*
		 * Need to change the logic
		 */
		var dobFormat = $.contanierViewInfo.children[s].children[2].children[0].getText().toString();
		dobFormat = dobFormat.replace('/','-');
		dobFormat = dobFormat.replace('/','-');
		dob.push(dobFormat);
	}
	mobileNumber = $.moNumberTxt.getValue();
	mobileNumber = $.utilities.validatePhoneNumber(mobileNumber);
	if (!mobileNumber) {
		$.uihelper.showDialog({
			message : $.strings.phoneValPhoneInvalid
		});
		return;
	}
	if (_.isEmpty(store)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValStore
		});
		return;
	}
	uploadInsuranceCardImage();

}

function uploadInsuranceCardImage() {

	var base64Str = Ti.Utils.base64encode(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "insurancecard.jpg").read()).text;
	/**
	 * TIMOB-9111
	 */
	if (OS_IOS) {
		base64Str = base64Str.replace(/[\r\n]+/g, "");
	}
	$.http.request({
		method : "upload_image",
		params : {
			data : [{
				patient : {
					EncodedImageString : base64Str
				}
			}]
		},
		keepLoader : true,
		success : didUploadImage
	});
}

function didUploadImage(result, passthrough) {

	$.http.request({

		method : "store_sendInsuranceCard",
		params : {
			data : [{
				sendInsuranceCard : {
					first_name : fname.join(','),
					last_name : lname.join(','),
					birth_date : dob.join(','),
					mobile : mobileNumber,
					image_url : result.data,
					to_store_id : store.id
				}
			}]
		},
		success : didSuccess

	});

}

function didSuccess(result, passthrough) {
	$.app.navigator.open({
		ctrl : "refillSuccess",
		ctrlArguments : {
			prescriptions : null,
			pickupMode : Alloy.Models.pickupModes.get("selected_code_value"),
			signupEnabled : false,
			fromInsurance : true,
			resultMessage : result.message,
			phone : null
		}
	});

}
/*
function didFail(result, passthrough) {
	/**
	 * if something goes odd with api
	 * just close this screen to
	 * prevent any further actions
	 
	$.app.navigator.hideLoader();
	$.app.navigator.close();
}
*/
function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.moNumberTxt.setValue(value);
	$.moNumberTxt.setSelection(len, len);
}

function didClickAdd(e) {
	if ($.contanierViewInfo.children.length == 10) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.insuranceCardUpdateLimit
		});
		return;
	}
	var ctrl = Alloy.createController("insuranceInput");
	ctrl.setRightIcon("", rightIconDict);
	ctrl.on('close', function() {
		$.contanierViewInfo.remove(ctrl.getView());
		$.contanierViewInfo.height = rxTxtHeight * $.contanierViewInfo.children.length;
		$.view.height = $.view.getRect().height - rxTxtHeight;
	});

	/**
	 *  ctrl.getView() will be ti.textfield widget
	 *  so used ctrl.getView().getView()
	 */
	$.contanierViewInfo.add(ctrl.getView());
	ctrl.getView("dob").setParentView($.window);
	ctrl.getView("vDividerView").height = $.uihelper.getHeightFromChildren($.txtView);
	$.contanierViewInfo.height = (rxTxtHeight * $.contanierViewInfo.children.length);
	$.view.height = $.view.getRect().height + rxTxtHeight;

}

exports.init = init;
exports.setParentView = setParentView;
exports.focus = focus;