var args = arguments[0] || {};

function didClickPhoto(e) {
	$.uihelper.getPhoto(didGetPhoto, $.window);
}

function didGetPhoto(blob) {
	/**
	 * keeping this blob in memory around the process
	 * is not a good idea, let's keep it in a file until
	 * we need this back
	 */
	$.utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "transfer.jpg"), blob, false);
	blob = null;
	if (Alloy.Globals.isLoggedIn) {
		$.app.navigator.open({
			titleid : "titleTransferStore",
			ctrl : "stores",
			ctrlArguments : {
				navigation : {
					titleid : "titleTransferOptions",
					ctrl : "transferOptions",
					ctrlArguments : {
						store : {}
					},
					stack : true
				},
				selectable : true
			},
			stack : true
		});
	} else {
		$.app.navigator.open({
			titleid : "titleTransferUserDetails",
			ctrl : "transferUserDetails",
			stack : true
		});
	}
}

function didClickType(e) {
	$.app.navigator.open({
		titleid : "titleTransferType",
		ctrl : "transferType",
		stack : true
	});
}
