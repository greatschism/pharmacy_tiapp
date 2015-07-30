var args = arguments[0] || {};
console.log(args);

function focus() {
	$.uihelper.getImage("success",$.successImg);
	store=args.store;
	prescription=args.prescription;
	$.storeNameLbl.text=store.storeName;
	$.storeTitleLbl.text=store.title;
	$.storeSubtitleLbl.text=store.subtitle;
	$.storePhoneAttr.setHtml(String.format($.strings.attrPhone, store.phone_formatted));
		if (prescription) {
		$.prescNameLbl.text = prescription.name;
		if (prescription.rx) {
			$.rxLbl.text = prescription.rx;
		} else {
			/**
			 *  to avoid the empty space
			 * left for
			 */
			$.rxLbl.applyProperties({
				top : 0,
				height : 0
			});
		}
	} else {
		/**
		 * image path is used throughout this module
		 * should not be changed
		 */
		$.prescImg.image = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "transfer.jpg").read();
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



function didClickDone(e) {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

exports.focus = focus;