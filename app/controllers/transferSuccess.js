var args = arguments[0] || {};

/*
function focus(){
	$.uihelper.getImage("success",$.successImg);
	$.pharmacyNameLbl.text = $.utilities.ucword(args.stores.store_name);
	$.pharmacyAddress1Lbl.text = args.stores.title;
	$.pharmacyAddress2Lbl.text = args.stores.subtitle;
	getStore();
	$.prescNameLbl.text = args.prescription.name;
	if (args.prescription.rx) {
		$.prescNumberLbl.text = args.prescription.rx;
	}
	$.successIcon.applyProperties($.createStyle({
		classes : ["icon-checkbox"]
	}));
}*/
function focus() {
	
	var tKey,
	    iKey,
	    lKey;
	
		//complete success
		tKey = "transferSuccessLblHeader";
		iKey = "success";
		lKey = "transferSuccessLblContact";

	
	if (iKey) {
		var dict = $.createStyle({
			classes : ["margin-top"]
		});
		_.extend(dict, $.uihelper.getImage(iKey));
		$.successImg.applyProperties(dict);
	}
	$.lblTransfer.text=$.strings[tKey];
	$.lbl.text = $.strings[lKey];
	var storeId = args.stores.id;
	if (storeId) {
		getStore(storeId);
	} else {
		updateTable();
	}
}

function getStore(storeId) {
	/**
	 *  prescriptions length should not be zero
	 *  at this screen
	 *  always call store get as we don't have
	 *  store's phone number with list api
	 */
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

function didGetStore(result, passthrough) {
	store = result.data.stores;
	var phoneFormatted = $.utilities.formatPhoneNumber(store.phone);
	_.extend(store, {
		phone_formatted : phoneFormatted,
		title : $.utilities.ucword(store.addressline1),
		subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip,
		attributed : String.format($.strings.attrPhone, phoneFormatted)
	});
	updateTable();
}

function updateTable() {
	/**
	 * process table
	 */
	var data = [];
	   
	if (store) {
		//add pickup details
		$.pickupSection = $.uihelper.createTableViewSection($, $.strings.transferSuccessLblRefillDetTitle);
		data.push($.pickupSection);
	}
	if (store) {
		/**
		 * this is a successful refill
		 * so store last used store id
		 */
		$.utilities.setProperty(Alloy.CFG.latest_store_refilled, store.id);
		var storeRow = Alloy.createController("itemTemplates/contentViewAttributed", store);
		storeRow.on("click", didClickStorePhone);
		$.pickupSection.add(storeRow.getView());
	}
	
	/**
	 *  tentative case we are contacting your doctor
	 *  is not handled as api doesn't have a unique
	 *  identifier yet for that case
	 */
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.transferSuccessLblPrescDetTitle);
	var subtitleClasses = ["content-subtitle-wrap"],
	titleClasses=["content-title-wrap"],
	    successClasses = ["margin-top", "content-positive-left-icon", "icon-checkbox"];
	  

		_.extend(args.prescription, {
			titleClasses:titleClasses,
			subtitleClasses : subtitleClasses,
			iconClasses :  successClasses
		});
		_.extend(args.prescription, {
		title : args.prescription.name,
		subtitle : args.prescription.rx
		
	});
		$.prescSection.add(Alloy.createController("itemTemplates/contentViewWithLIcon", args.prescription).getView());

	data.push($.prescSection);

	///update table
	$.tableView.setData(data);

	/**
	 * this is a successful refill
	 * so store phone number if available
	 */
	if (args.phone) {
		$.utilities.setProperty(Alloy.CFG.latest_phone_used, args.phone);
	}
}

function didClickStorePhone(e) {
	$.uihelper.getPhone({
		firstName : store.title,
		phone : {
			work : [store.phone_formatted]
		}
	}, store.phone);
}



function didClickDone(e) {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

exports.focus = focus;