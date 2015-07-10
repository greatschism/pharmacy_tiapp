var args = arguments[0] || {},
    store = args.store;

function init() {
	if (!_.has(store, "hours")) {
		$.http.request({
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
			errorDialogEnabled : false,
			success : didGetStore
		});
	} else {
		setTimeout(loadStore, 1000);
	}
}

function didGetStore(result, passthrough) {
	_.extend(store, _.pick(result.data.stores, ["hours", "services"]));
	loadStore();
}

function loadStore() {
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
	/**
	 *  store is_open property yet to be exposed
	 *  in order to show the open or close time
	 */
	var data = [],
	    hours = store.hours || [],
	    services = store.services || [],
	    lKey,
	    iconClass,
	    lblClass;
	if (store.is_open) {
		lKey = "storeDetLblOpen";
		iconClass = "content-detail-positive-icon";
		lblClass = "content-detail-positive-icon-description";
	} else {
		lKey = "storeDetLblClose";
		iconClass = "content-detail-negative-icon";
		lblClass = "content-detail-negative-icon-description";
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
	/*
	 * services is a object in response
	 * must to be fixed from server side
	 */
	if (_.isObject(services)) {
		services = [services];
	}
	if (services.length) {
		var servicesSection = $.uihelper.createTableViewSection($, $.strings.storeDetSectionServices);
		_.each(services, function(val) {
			/**
			 *  should be modified once api is fixed
			 */
			val = _.keys(val)[0];
			servicesSection.add(Alloy.createController("itemTemplates/label", {
				value : val
			}).getView());
		});
		data.push(servicesSection);
	}
	$.tableView.setData(data);
	$.loader.hide();
}

function updateHome() {
	$.homeIconBtn.applyProperties($.createStyle({
		classes : [store.ishomepharmacy ? "primary-icon-btn" : "inactive-icon-btn"]
	}));
}

function updateFavourite() {
	$.favouriteLbl.text = $.strings[store.isbookmarked || store.ishomepharmacy ? "storeDetBtnFavouriteRemove" : "storeDetBtnFavouriteAdd"];
	$.favouriteIconLbl.applyProperties($.createStyle({
		classes : [store.isbookmarked || store.ishomepharmacy ? "icon-filled-star" : "icon-star"]
	}));
}

function didClickPhone(e) {
	$.uihelper.getDialer({
		firstName : store.title,
		phone : {
			work : [store.phone_formatted]
		}
	}, store.phone);
}

function didClickDirection(e) {
	/**
	 * if args.isSearch true then
	 * may have to pass source as the search location
	 */
	$.uihelper.getDirection({
		latitude : store.latitude,
		longitude : store.longitude
	});
}

function didClickRefill(e) {
	$.app.navigator.open({
		titleid : "titleOrderDetails",
		ctrl : "orderDetails",
		ctrlArguments : {
			store : store
		},
		stack : true
	});
}

function didClickFavourite(e) {

}

function didClickHome(e) {

}

exports.init = init;
