var args = $.args,
    CONSTS = "CONST_" + $.__controllerPath,
    store = args.store,
    httpClient,
    isWindowOpen;

function init() {
	/**
	 * check whether to call api
	 * or use cached data
	 */
	if (_.has(store, "hours")) {
		setTimeout(didGetStore, 1000);
	}
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		if (!_.has(store, "hours")) {
			httpClient = $.http.request({
				method : "stores_get",
				params : {
					data : [{
						stores : {
							id : store.id
						}
					}]
				},
				showLoader : false,
				success : didGetStore,
				failure : didFailed
			});
		}
	}
}

function didGetStore(result, passthrough) {
	httpClient = null;
	if (result && result.data) {
		_.extend(store, _.omit(result.data.stores, ["distance"]));
	}
	/**
	 * phone_formatted will only be available
	 * at this screen, so check for that whetehr if
	 * that is already cached if not put it
	 */
	if (!_.has(store, "phone_formatted")) {
		_.extend(store, {
			ishomepharmacy : parseInt(store.ishomepharmacy) || 0,
			isbookmarked : parseInt(store.isbookmarked) || 0,
			phone_formatted : $.utilities.formatPhoneNumber(store.phone)
		});
	}
	if (Alloy.Globals.isLoggedIn) {
		updateHome();
		updateFavourite();
	}
	$.titleLbl.text = store.title;
	$.subtitleLbl.text = store.subtitle;
	var data = [],
	    hours = store.hours || [],
	    services = store.services || [],
	    tillTime,
	    clockType,
	    clockLbl,
	    lblClass;
	//store hours
	var hoursSection = $.uihelper.createTableViewSection($, $.strings.storeDetSectionHours);
	if (hours.length) {
		//0th index will have today's hours
		tillTime = hours[0].hours.split("-")[1];
		if (store.is_open === "1" && tillTime) {
			clockType = "positive";
			clockLbl = String.format($.strings.storeDetLblOpen, tillTime);
		} else {
			clockType = "negative";
			clockLbl = tillTime ? String.format($.strings.storeDetLblClose, tillTime) : $.strings.storeDetLblClosed;
		}
		_.each(hours, function(hour) {
			hoursSection.add(Alloy.createController("itemTemplates/promptReply", {
				prompt : hour.day + ":",
				reply : hour.hours
			}).getView());
		});
	} else {
		clockType = "negative";
		clockLbl = $.strings.storeDetLblNotAvailable;
		hoursSection.add(Alloy.createController("itemTemplates/label", {
			title : $.strings.storeDetLblHoursNotAvailable
		}).getView());
	}
	data.push(hoursSection);
	/**
	 * distance may not be available
	 * if it is not via store list
	 */
	if (_.isNumber(store.distance)) {
		$.uihelper.wrapViews($.distanceView);
		$.distanceLbl.text = String.format($.strings.storeDetLblDistance, store.distance.toFixed(2));
	} else {
		$.storeContentView.remove($.distanceView);
	}
	//clock / is opened
	$.uihelper.wrapViews($.clockView);
	$.clockIconLbl.applyProperties($.createStyle({
		classes : [clockType + "-fg-color"]
	}));
	$.clockLbl.applyProperties($.createStyle({
		classes : [clockType + "-fg-color"],
		text : clockLbl
	}));
	$.phoneAttr.setHtml(String.format($.strings.attrPhone, store.phone_formatted));
	//store services
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

function didFailed(){
	$.app.navigator.close();
	$.loader.hide();
}

function updateHome() {
	$.homeIconBtn.applyProperties($.createStyle({
		classes : [store.ishomepharmacy ? "primary-fg-color" : "inactive-fg-color"]
	}));
}

function updateFavourite() {
	var isFavourite = store.isbookmarked || store.ishomepharmacy;
	$.favouriteLbl.text = $.strings[ isFavourite ? "storeDetBtnFavouriteRemove" : "storeDetBtnFavouriteAdd"];
	$.favouriteIconLbl.applyProperties($.createStyle({
		classes : ["accessibility-enabled", store.isbookmarked || store.ishomepharmacy ? "icon-filled-star" : "icon-star"],
		accessibilityLabel : $.strings.storeDetIconFavStore
	}));
}

function contactsHandler() {
	$.uihelper.getPhone({
		firstName : store.title,
		phone : {
			work : [store.phone_formatted]
		}
	}, store.phone);
}

function didClickPhone(e) {
	if(!Titanium.Contacts.hasContactsPermissions()) {
		Titanium.Contacts.requestContactsPermissions(function(result){
			if(result.success) {
				contactsHandler();
			}
			else{
				$.analyticsHandler.trackEvent("StoreFinder-StoreDetails", "click", "DeniedContactsPermission");
			}
		});
	} else {
		contactsHandler();
	}
}

function didClickDirection(e) {
	$.uihelper.getDirection(_.pick(store, ["latitude", "longitude"]));
}

function didClickRefill(e) {
	var navigation;
	if (Alloy.Globals.isLoggedIn) {
		/**
		 * add prescriptions
		 * and then to order details
		 */
		navigation = {
			titleid : "titlePrescriptionsAdd",
			ctrl : "prescriptions",
			ctrlArguments : {
				filters : {
					refill_status : [Alloy.CFG.apiCodes.refill_status_in_process, Alloy.CFG.apiCodes.refill_status_ready]
				},
				selectable : true,
				minLength : 1,
				useCache : false,
				navigation : {
					titleid : "titleOrderDetails",
					ctrl : "orderDetails",
					ctrlArguments : {
						store : store,
						canAdd : false
					},
					stack : true
				}
			},
			stack : true
		};
	} else {
		navigation = {
			titleid : "titleRefillType",
			ctrl : "refillType",
			ctrlArguments : {
				store : store
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
	if (result && result.code == Alloy.CFG.apiCodes.success) {
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
		buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
		cancelIndex : 1,
		success : didConfirmHome
	});
}

function didConfirmHome() {
	updateStatus(1, 1);
}

function handleEvent(e) {
	$.analyticsHandler.handleEvent($.ctrlShortCode, e);
}

function terminate() {
	if (httpClient) {
		httpClient.abort();
	}
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
