var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    choiceDict = {
	top : 12,
	bottom : 12,
	left : 12,
	right : 12,
	height : Ti.UI.SIZE,
	layout : "horizontal",
	horizontalWrap : false
};

function init() {

	http.request({
		method : "PRESCRIPTIONS_REFILL_HISTORY",
		data : {
			client_identifier : "x",
			version : "x",
			session_id : "x",
			filter : [{
				"get_type" : "patient/doctor"
			}],

			data : [{
				refills : [{
					rxnumber : "x",
					fromdate : "x",
					pagenumber : "x",
					pagesize : "x",
					sortorder : "x",
					sortattr : "x",
					featurecode : "x"
				}, {
					rxnumber : "x",
					fromdate : "x",
					pagenumber : "x",
					pagesize : "x",
					sortorder : "x",
					sortattr : "x",
					featurecode : "x"
				}]

			}]

		},
		success : didSuccess,

	});

}

function didSuccess(result) {
	
	refillHistory = result.data.refills;

	if (refillHistory.length) {
		for ( i = 0; i < refillHistory.length; i++) {
			var data = [];
			for (var i in refillHistory) {
				data.push(getRow({
					name : refillHistory[i].storename,
					address : refillHistory[i].address || [],
					state : refillHistory[i].state || [],
					zip : refillHistory[i].zip || [],
					refillDate : refillHistory[i].refilldate,
					storeId: refillHistory[i].storeid

				}));
			}
			$.tableView.setData(data);
		}
	}

}

function getRow(data) {

	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow",
		classes : ["height-75d"],

	}),

	    pharmacyNameLbl = $.UI.create("Label", {
		apiName : "Label",
		left : args.paddingLeft || 12,
		text : data.name,
		classes : ["list-item-title-lbl"]
	}),
	    pharmacyDetailsView = $.UI.create("View", {
		apiName : "View",
		classes : ["list-item-view", "vgroup"]
	}),
	    pharmacyAddressLbl = $.UI.create("Label", {
		apiName : "Label",

		left : args.paddingLeft || 12,
		text : data.address + ", " + data.state + ", " + data.zip,
		classes : ["list-item-info-lbl"]
	}),

	    refillDate = $.UI.create("Label", {
		apiName : "Label",
		top : 12,
		right : 12,
		text : moment(data.refillDate).format('MMM. Do, YYYY'),
		classes : ["list-item-info-lbl"]
	}),
	    dateView = $.UI.create("View", {
		apiName : "View",
		classes : ["list-item-view", "vgroup"]
	});

	pharmacyDetailsView.add(pharmacyNameLbl);
	pharmacyDetailsView.add(pharmacyAddressLbl);
	dateView.add(refillDate);
	row.add(pharmacyDetailsView);
	row.add(dateView);
	row.addEventListener("click",didItemClick);
	return row;
}
function didItemClick(e){
/*
	app.navigator.open({
			ctrl : "storeDetail",
			titleid : "titleStoreDetails",
			ctrlArguments : {
				
			},
			stack : true
	});*/
	alert('On click action has been added. This will navigate only after Store details is implemented');
}
exports.init = init;
