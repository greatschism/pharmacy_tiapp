var args = arguments[0] || {},
    prescriptions = args.prescriptions || [],
    store = args.store;

function init() {
	$.uihelper.getImage("success", $.successImg);
}

function focus() {
	var storeId = prescriptions[0].refill_store_id;
	if (_.isEmpty(store) || store.id != storeId) {
		$.http.request({
			method : "stores_get",
			params : {
				feature_code : "THXXX",
				data : [{
					stores : {
						id : storeId,
					}
				}]
			},
			success : didGetStore
		});
	} else {
		updateTable();
	}
}

function didGetStore(result, passthrough) {
	store = result.data.stores;
	_.extend(store, {
		title : $.utilities.ucword(store.addressline1),
		subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip,
		phone_formatted : $.utilities.formatPhoneNumber(store.phone)
	});
	updateTable();
}

function updateTable() {
	console.log(store);
	console.log(prescriptions);
	$.storeSection = $.uihelper.createTableViewSection($, $.strings.refillSuccessSectionStore);
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.refillSuccessSectionPresc);
	/*_.each(prescriptions, function(prescription) {
		$.prescSection.add(Alloy.createController("itemTemplates/masterDetailWithLIcon", {
			title : $.strings.strPrefixRx.concat(prescription.rx_number_id)
		}).getView());
	});*/
	$.tableView.setData([$.storeSection, $.prescSection]);
}

function didClickSignup(e) {
	$.app.navigator.open({
		titleid : "titleSignup",
		ctrl : "signup"
	});
}

exports.init = init;
exports.focus = focus;
