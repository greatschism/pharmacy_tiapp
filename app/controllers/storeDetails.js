var args = arguments[0] || {},
    CONSTS = "CONST_" + $.__controllerPath,
    store = args.store,
    httpClient;

function init() {
	/**
	 * check whether to call api
	 * or use cached data
	 */
	if (!_.has(store, "hours")) {
		httpClient = $.http.request({
			method : "stores_get",
			params : {
				feature_code : "THXXX",
				data : [{
					stores : {
						id : store.id
					}
				}]
			},
			showLoader : false,
			success : didGetStore
		});
	} else {
		setTimeout(didGetStore, 1000);
	}
}

function didGetStore(result, passthrough) {
	httpClient = null;
	if (result && result.data) {
		_.extend(store, result.data.stores);
		_.extend(store, {
			ishomepharmacy : parseInt(store.ishomepharmacy) || 0,
			isbookmarked : parseInt(store.isbookmarked) || 0,
			phone_formatted : $.utilities.formatPhoneNumber(store.phone)
		});
	}
	$.titleLbl.text = store.title;
	$.subtitleLbl.text = store.subtitle;
	$.phoneReplyLbl.text = store.phone_formatted;
	if (Alloy.Globals.isLoggedIn) {
		updateHome();
		updateFavourite();
	}
	var data = [],
	    hours = store.hours || [],
	    services = store.services || [],
	    tillTime = (hours[0] || {}).hours.split("- ")[1] || "",
	    clockLbl,
	    iconClass,
	    lblClass;
	if (tillTime && store.is_open) {
		clockLbl = String.format($.strings.storeDetLblOpen, tillTime);
		iconClass = "icon-view-positive-icon";
		lblClass = "icon-view-positive-icon-description";
	} else {
		clockLbl = tillTime ? String.format($.strings.storeDetLblClose, tillTime) : $.strings.storeDetLblClosed;
		iconClass = "icon-view-negative-icon";
		lblClass = "icon-view-negative-icon-description";
	}
	$.addClass($.clockIconLbl, [iconClass]);
	$.addClass($.clockLbl, [lblClass], {
		text : clockLbl
	});
	if (hours.length) {
		var hoursSection = $.uihelper.createTableViewSection($, $.strings.storeDetSectionHours);
		_.each(hours, function(hour) {
			hoursSection.add(Alloy.createController("itemTemplates/promptReply", {
				data : hour,
				promptProperty : "day",
				replyProperty : "hours"
			}).getView());
		});
		data.push(hoursSection);
	}
	if (services.length) {
		var servicesSection = $.uihelper.createTableViewSection($, $.strings.storeDetSectionServices);
		_.each(services, function(val) {
			servicesSection.add(Alloy.createController("itemTemplates/label", {
				title : val
			}).getView());
		});
		data.push(servicesSection);
	}
	$.tableView.setData(data);
	$.loader.hide();
}

function updateHome() {
	$.homeIconBtn.applyProperties($.createStyle({
		classes : [store.ishomepharmacy ? "primary-icon" : "inactive-icon"]
	}));
}

function updateFavourite() {
	var isFavourite = store.isbookmarked || store.ishomepharmacy,
	    text = $.strings[ isFavourite ? "storeDetBtnFavouriteRemove" : "storeDetBtnFavouriteAdd"],
	    dict;
	/**
	 * if it is favourite
	 * the text remove from favourite has no enough space
	 * and occurs in multiple lines
	 *
	 * to remove extra padding when it is favourite
	 * and vice versa follow this
	 */
	if (isFavourite && !Alloy.TSS[CONSTS]) {
		$.favouriteView.addEventListener("postlayout", didPostlayout);
	}
	/**
	 * whether we should update the padding
	 */
	if (Alloy.TSS[CONSTS] && Alloy.TSS[CONSTS].shouldUpdate) {
		dict = isFavourite ? {
			top : $.favouriteLbl.minTop,
			bottom : $.favouriteLbl.minBottom,
			text : text
		} : {
			top : $.favouriteLbl.maxTop,
			bottom : $.favouriteLbl.maxBottom,
			text : text
		};
	}
	if (dict) {
		$.favouriteLbl.applyProperties(dict);
	} else {
		$.favouriteLbl.text = text;
	}
	$.favouriteIconLbl.applyProperties($.createStyle({
		classes : [store.isbookmarked || store.ishomepharmacy ? "icon-filled-star" : "icon-star"]
	}));
}

/**
 * ui fix: multi-line button is a hack of view with label
 * to control padding top and bottom
 * check this
 */
function didPostlayout(e) {
	var source = e.source,
	    child = source.children[0],
	    height = source.rect.height;
	source.removeEventListener("postlayout", didPostlayout);
	if (!height) {
		var blob = source.toImage();
		height = blob.height;
		blob = null;
		if (OS_ANDROID) {
			height /= $.app.logicalDensityFactor;
		}
	}
	Alloy.TSS[CONSTS] = {};
	if (source.maxHeight < height) {
		Alloy.TSS[CONSTS].shouldUpdate = true;
		child.applyProperties({
			top : child.minTop,
			bottom : child.minBottom
		});
	} else {
		Alloy.TSS[CONSTS].shouldUpdate = false;
	}
}

function didClickPhone(e) {
	$.uihelper.getPhone({
		firstName : store.title,
		phone : {
			work : [store.phone_formatted]
		}
	}, store.phone);
}

function didClickDirection(e) {
	$.uihelper.getDirection({
		latitude : store.latitude,
		longitude : store.longitude
	}, args.currentLocation);
}

function didClickRefill(e) {
	var navigation;
	if (Alloy.Globals.loggedIn) {
		navigation = {
			titleid : "titleTypeRx",
			ctrl : "typeRx",
			ctrlArguments : {
				store : store
			},
			stack : true
		};
	} else {
		/**
		 * add prescriptions
		 * and then to order details
		 *
		 * Note: when it is from store details
		 * force pickupMode to pickup_mode_instore
		 */
		navigation = {
			titleid : "titleAddPrescriptions",
			ctrl : "prescriptions",
			ctrlArguments : {
				filters : {
					refill_status : [Alloy.CFG.apiCodes.refill_status_in_process, Alloy.CFG.apiCodes.refill_status_ready]
				},
				selectable : true,
				navigation : {
					titleid : "titleOrderDetails",
					ctrl : "orderDetails",
					ctrlArguments : {
						store : store,
						canAdd : false,
						pickupMode : Alloy.CFG.apiCodes.pickup_mode_instore
					},
					stack : true
				}
			},
			stack : true
		};
	}
	$.app.navigator.open(navigation);
}

function updateStatus(isFavourite, isHome) {
	var storeObj = {
		id : store.id
	},
	    method;
	if (isFavourite || isHome) {
		method = store.isbookmarked ? "stores_bookmark_update" : "stores_bookmark_add";
		_.extend(storeObj, {
			is_primary : isHome,
			fav_alias : isFavourite
		});
	} else {
		method = "stores_bookmark_delete";
	}
	httpClient = $.http.request({
		method : method,
		params : {
			feature_code : "THXXX",
			data : [{
				stores : storeObj
			}]
		},
		passthrough : {
			ishomepharmacy : isHome,
			isbookmarked : isFavourite
		},
		success : didUpdateBookmark,
		failure : didUpdateBookmark
	});
}

function didUpdateBookmark(result, passthrough) {
	httpClient = null;
	if (result && result.code == Alloy.CFG.apiCodes.success_code) {
		_.extend(store, passthrough);
		/*
		 * update ui
		 */
		updateHome();
		updateFavourite();
		/**
		 * update the store item on list view
		 * in stores list
		 */
		store.shouldUpdate = true;
	}
}

function didClickFavourite(e) {
	if (store.ishomepharmacy) {
		$.uihelper.showDialog({
			message : $.strings.storeDetMsgHomeCantUpdate
		});
		return false;
	}
	/**
	 * if already favourite, remove it
	 * else add it
	 * Note: only be called when it is not home store,
	 * so home flag is always passed as 0
	 */
	updateStatus(store.isbookmarked ? 0 : 1, 0);
}

function didClickHome(e) {
	/**
	 * home store can't be removed from favourite
	 * can only mark another store as home
	 * at that case the current home
	 * will become just favourite
	 */
	if (store.ishomepharmacy) {
		$.uihelper.showDialog({
			message : $.strings.storeDetMsgHomeCantUpdate
		});
		return false;
	}
	$.uihelper.showDialog({
		title : $.strings.storeDetDialogTitleHomeConfirm,
		message : String.format($.strings.storeDetMsgHomeConfirm, store.title),
		buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnCancel],
		cancelIndex : 1,
		success : didConfirmHome
	});
}

function didConfirmHome() {
	updateStatus(1, 1);
}

function terminate() {
	if (httpClient) {
		httpClient.abort();
	}
}

exports.init = init;
exports.terminate = terminate;
