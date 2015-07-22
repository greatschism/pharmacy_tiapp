var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    isBusy = false,
    rxTxts = [$.rxTxt],
    rightIconText = $.createStyle({
	classes : ["icon-unfilled-remove"]
}).text,
    rightIconDict = $.createStyle({
	classes : ["txt-negative-right-icon"],
	touchEnabled : true
}),
    rxTxtHeight;

function init() {
	rxTxtHeight = $.createStyle({
		classes : ["txt"]
	}).height + $.createStyle({
		classes : ["margin-top"]
	}).top;
	$.containerView.height = rxTxtHeight;
}

function didClickAdd(e) {
	if (isBusy) {
		return;
	}
	isBusy = true;
	var len = rxTxts.length,
	    height = (rxTxtHeight * (len + 1)),
	    anim = Ti.UI.createAnimation({
		height : height,
		duration : 200
	});
	anim.addEventListener("complete", function didComplete() {
		anim.removeEventListener("complete", didComplete);
		$.containerView.height = height;
		if (len === 1) {
			_.extend(rightIconDict, {
				title : rightIconText,
				touchEnabled : true
			});
			rxTxts[0].setRightIcon("", rightIconDict);
		}
		var ctrl = Alloy.createController("templates/rxTxtWithRIcon");
		ctrl.setRightIcon("", rightIconDict);
		ctrl.on("click", didClickRemove);
		/**
		 *  ctrl.getView() is ti.textfield widget
		 *  so used ctrl.getView().getView()
		 */
		$.containerView.add(ctrl.getView().getView());
		rxTxts.push(ctrl);
		isBusy = false;
	});
	$.containerView.animate(anim);
}

function didClickRemove(e) {
	isBusy = true;
	var widgetToRemove = e.source.getView();
	rxTxts = _.reject(rxTxts, function(widget) {
		if (widget.getView().getView() == widgetToRemove) {
			return true;
		}
		return false;
	});
	$.containerView.remove(widgetToRemove);
	if (rxTxts.length == 1) {
		_.extend(rightIconDict, {
			title : "",
			touchEnabled : false
		});
		rxTxts[0].setRightIcon("", rightIconDict);
	}
	var len = rxTxts.length,
	    height = (rxTxtHeight * len),
	    anim = Ti.UI.createAnimation({
		height : height,
		duration : 200
	});
	anim.addEventListener("complete", function didComplete() {
		anim.removeEventListener("complete", didComplete);
		$.containerView.height = height;
		isBusy = false;
	});
	$.containerView.animate(anim);
}

function didClickOrder(e) {
	var storeId;
	//process store
	//process rx numbers
	var validRxs = [];
	_.some(rxTxts, function(rxTxt) {
		var value = rxTxt.getValue();
		if (value) {
			validRxs.push({
				rx_number : value,
				store_id : storeId,
				pickup_mode : apiCodes.pickup_mode_instore,
				pickup_time_group : apiCodes.pickup_time_group_asap
			});
			return false;
		}
		return true;
	});
	var validLen = validRxs.length;
	if (validLen != rxTxts.length) {
		$.uihelper.showDialog({
			message : $.strings.refillQuickMsgRxInvalid,
			success : function() {
				rxTxts[validLen].getView().focus();
			}
		});
		return false;
	}
}

exports.init = init;
