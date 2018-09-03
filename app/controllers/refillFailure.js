var args = $.args,
    store,
    isWindowOpen;

function init() {
	$.titleLbl.text = args.refillErroMessage;
	_.each(["typeView", "phoneView"], function(val) {
		if ($[val]) {
			$.uihelper.wrapViews($[val]);
		}
	});
	_.each(["typeLbl", "phoneLbl"], function(val) {
		if ($[val]) {
			$.uihelper.wrapText($[val]);
		}
	});
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		var storeId = $.utilities.getProperty(Alloy.CFG.latest_store_refilled);
		if (storeId) {
			$.http.request({
				method : "stores_get",
				params : {
					data : [{
						stores : {
							id : storeId
						}
					}]
				},
				success : didGetStore
			});
		}
	}
}

function didGetStore(result, passthrough) {
	/*
	if(! Alloy.Globals.isMailOrderService )
	{
		store = result.data.stores;
	}
	*/
}

function didClickType(e) {
	$.app.navigator.open({
		titleid : "titleRefillType",
		ctrl : "refillType",
		ctrlArguments : {
			phone : args.phone
		}
	});
}

function didClickPhone(e) {
	if (store) {
		$.uihelper.openDialer($.utilities.validatePhoneNumber(store.phone));
	} else {
		$.app.navigator.open({
			titleid : "titleStores",
			ctrl : "stores"
		});
	}
}

exports.init = init;
exports.focus = focus;
