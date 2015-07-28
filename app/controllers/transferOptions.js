var args = arguments[0] || {};
function didCompleteTransfer(){
	
}
function didReviewTransfer(){
	$.app.navigator.open({
				titleid : "titleTransferType",
				ctrl : "transferReview",
				ctrlArguments : {
					prescription:args.prescription,
					stores:args.store,
					user:args.user,
					transferAllPrescSwtValue : $.transferAllPrescSwt.getValue(),
					sendtxtMsgSwtValue: $.sendTxtMsgSwt.getValue()
				},
				stack : true
			});
}
