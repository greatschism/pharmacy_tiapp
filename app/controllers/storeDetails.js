var args = arguments[0] || {},
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
	}
	$.titleLbl.text = store.title;
	$.subtitleLbl.text = store.subtitle;
	if (!store.phone_formatted) {
		store.phone_formatted = $.utilities.formatPhoneNumber(store.phone);
	}
	$.phoneReplyLbl.text = store.phone_formatted;
	if (Alloy.Globals.isLoggedIn) {
		updateHome();
		updateFavourite();
	}
	var data = [],
	    hours = store.hours || [],
	    services = store.services || [],
	    lKey,
	    iconClass,
	    lblClass;
	if (store.is_open) {
		lKey = "storeDetLblOpen";
		iconClass = "icon-view-positive-icon";
		lblClass = "icon-view-positive-icon-description";
	} else {
		lKey = "storeDetLblClose";
		iconClass = "icon-view-negative-icon";
		lblClass = "icon-view-negative-icon-description";
	}
	$.addClass($.clockIconLbl, [iconClass]);
	$.addClass($.clockLbl, [lblClass], {
		text : String.format($.strings[lKey], hours.length ? hours[0].hours.split("- ")[1] : "")
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
		classes : [store.ishomepharmacy ? "secondary-icon" : "inactive-icon"]
	}));
}

function updateFavourite() {
	$.favouriteLbl.text = $.strings[store.isbookmarked || store.ishomepharmacy ? "storeDetBtnFavouriteRemove" : "storeDetBtnFavouriteAdd"];
	$.favouriteIconLbl.applyProperties($.createStyle({
		classes : [store.isbookmarked || store.ishomepharmacy ? "icon-filled-star" : "icon-star"]
	}));
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
						store : store
					},
					stack : true
				}
			},
			stack : true
		};
	}
	$.app.navigator.open(navigation);
}

function didClickFavourite(e) {

}

function didClickHome(e) {

}

function terminate() {
	if (httpClient) {
		httpClient.abort();
	}
}

exports.init = init;
exports.terminate = terminate;
