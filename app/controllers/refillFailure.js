var args = arguments[0] || {},
    store,
    isWindowOpen;

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		var storeId = $.utilities.getProperty(Alloy.CFG.latest_store_refilled);
		if (storeId) {
			$.http.request({
				method : "stores_get",
				params : {
					feature_code : "THXXX",
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
	store = result.data.stores;
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
		$.uihelper.openDialer(store.phone);
	} else {
		$.app.navigator.open({
			titleid : "titleStores",
			ctrl : "stores"
		});
	}
}

exports.focus = focus;
