var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    DUE_FOR_REFILL_IN_DAYS = Alloy._due_for_refill_in_days,
    msgPickUp = Alloy.Globals.strings.msgPickUp,
    patientName,
    readyForRefill,
    otherPrescriptions,
    prescriptions,
    iconLbl = $.UI.create("Label", {
	apiName : "Label",
	height : 32,
	width : 32,
	font : {
		fontSize : 20
	},
	text : Alloy.CFG.icons.spot,
	color : "#45cdef",
	classes : ["width-90", "padding-left", "auto-height", "success-color"]
});

function init() {
	patientName = args.patientName;

	http.request({
		method : "PRESCRIPTIONS_LIST",
		success : didSuccess,

	});
}

function addRx(str) {
	var strTemp = "Rx# ";
	str = strTemp + str;
	return str;
}

function didSuccess(result) {
	prescriptions = result.data.prescriptions;

	var inprocessPrescriptions = _.reject(prescriptions, function(obj) {
		return obj.refill_status != "INPROCESS" && obj.refill_status != "READYFORPICKUP";
	}),

	    readyForRefill = _.where(prescriptions, {
		refill_status : "READYTOREFILL"
	}),
	    otherPrescriptions = _.where(prescriptions, {
		refill_status : "OTHERS"
	});

	var addIcon = $.UI.create("Label", {
		apiName : "Label",
		height : 32,
		width : 32,
		classes : ["userIcon", "small-icon", "right"]
	});

	var sectionHeading = patientName + "" + strings.sectionPatientsPrescription;
	$.userLbl.text = sectionHeading;

	//$.outerSection = uihelper.createTableViewSection($, sectionHeading, $, addIcon);*/
	if (readyForRefill.length) {

		var addAllLbl = $.UI.create("Label", {
			apiName : "Label",
			classes : ["padding-right", "h14"],
			text : strings.lblSelectAll,
			color : "#599DFF"
		});

		$.readyForRefillSection = uihelper.createTableViewSection($, strings.sectionReadyForRefill, $, addAllLbl);
		for (var i in readyForRefill) {

			var prescription = readyForRefill[i],
			    anticipatedRefillDate = moment(prescription.anticipated_refill_date, "YYYY/MM/DD");
			todaysDate = moment();

			ndays = anticipatedRefillDate.diff(todaysDate, 'days');

			row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),

			contentView = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view", "auto-height", "padding-top", "padding-bottom"]
			}),
			iconView = $.UI.create("View", {
				apiName : "Label",
				classes : ["left", "auto-height", "auto-width"],
			}),
			detailsView = $.UI.create("View", {
				apiName : "View",
				classes : ["vgroup", "auto-height", "auto-width"],
				left : 40,
			}),
			messageView = $.UI.create("View", {
				apiName : "View",
				classes : ["vgroup", "auto-height", "auto-width", "right"],
			}),
			icon = $.UI.create("Label", {
				apiName : "Label",
				height : 32,
				width : 32,
				classes : ["spotIcon", "small-icon"]
			}),
			prescriptionLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["h1", "left"]
			}),
			rxNoLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["h3", "left"]
			}),
			msgLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["h3", "left"]
			});
			prescriptionLbl.text = utilities.ucfirst(prescription.presc_name);
			rxNoLbl.text = addRx(prescription.rx_number);

			if (ndays < 0) {
				msgLbl.text = strings.msgOverdueBy + "\n" + Math.abs(ndays) + " days";
				msgLbl.color = Alloy.TSS.list_item_critical_detail_lbl.color;
			} else if (ndays >= 0) {
				msgLbl.text = strings.msgDueFoRefillIn + "\n" + Math.abs(ndays) + " days";
			}
			iconView.add(icon);
			detailsView.add(prescriptionLbl);
			detailsView.add(rxNoLbl);
			messageView.add(msgLbl);

			contentView.add(iconView);
			contentView.add(detailsView);
			contentView.add(messageView);
			row.add(contentView);

			$.readyForRefillSection.add(row);
		}

	}

	if (otherPrescriptions.length) {

		var addAllLbl = $.UI.create("Label", {
			apiName : "Label",
			classes : ["padding-right", "h14"],
			text : strings.lblSelectAll,
			color : "#599DFF"
		});
		console.log("others");

		$.otherPrescriptionsSection = uihelper.createTableViewSection($, strings.sectionOtherPrescriptions, $, addAllLbl);

		for (var i in otherPrescriptions) {

			var prescription = otherPrescriptions[i],
			    anticipatedRefillDate = moment(prescription.anticipated_refill_date, "YYYY/MM/DD").format("MM/DD/YYYY"),
			    row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow"
			}),
			    contentView = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view", "auto-height", "padding-top", "padding-bottom"]
			}),
			    iconView = $.UI.create("View", {
				apiName : "Label",
				classes : ["left", "auto-height", "auto-width"],
			}),
			    detailsView = $.UI.create("View", {
				apiName : "View",
				classes : ["vgroup", "auto-height", "auto-width"],
				left : 40,
			}),
			    messageView = $.UI.create("View", {
				apiName : "View",
				classes : ["vgroup", "auto-height", "auto-width", "right"],
			}),
			    icon = $.UI.create("Label", {
				apiName : "Label",
				height : 32,
				width : 32,
				classes : ["spotIcon", "small-icon"]
			}),
			    prescriptionLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["h1", "left"]
			}),
			    rxNoLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["h3", "left"]
			}),
			    msgLbl = $.UI.create("Label", {
				apiName : "Label",
				classes : ["h3", "left"]
			});
			prescriptionLbl.text = utilities.ucfirst(prescription.presc_name);
			rxNoLbl.text = addRx(prescription.rx_number);
			msgLbl.text = strings.msgDueFoRefillOn + "\n" + anticipatedRefillDate;

			iconView.add(icon);
			detailsView.add(prescriptionLbl);
			detailsView.add(rxNoLbl);
			messageView.add(msgLbl);

			contentView.add(iconView);
			contentView.add(detailsView);
			contentView.add(messageView);
			row.add(contentView);

			$.otherPrescriptionsSection.add(row);
		}

	}
	$.tableView.data = [$.outerSection, $.readyForRefillSection, $.otherPrescriptionsSection];

}

function didClickAddAll(e) {
	addedAll = new Array;
	if (readyForRefill.length) {
		for (var i in readyForRefill) {
			addedAll[i] = readyForRefill[i];

		}

	}
	if (otherPrescriptions.length) {
		for (var i in readyForRefill) {
			addedAll[i] = otherPrescriptions[i];

		}
	}
}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickDone() {

	http.request({
		method : "PRESCRIPTIONS_ADD",

		data : {
			filter : null,
			data : [{
				prescriptions : [{
					id : "1",
					rx_number : "2345678",
					presc_name : "Lovastin, 200 mg",
					is_overdue : "1",
					prefill : "x",
					doctor_id : "x",
					anticipated_refill_date : "2015/12/15",
					expiration_date : "2015/12/15",
					refill_remaining_preferences : "x",
					refill_started_date : "x",
					latest_refill_requested_date : "2015-02-11",
					latest_refill_promised_date : "2015-02-13",
					latest_filled_date : "2015-02-16",
					restockperiod : "10",
					presc_last_filled_date : "x",
					latest_sold_date : "x",
					latest_refill_completed_date : "x",
					refill_status : "OTHERS"
				}]

			}]
		},
		success : didAddPrescription,

	});

}

function didAddPrescription(_result) {
	app.navigator.open({
		ctrl : "orderDetails",

		ctrlArguments : {
			//prescription :
		},
		stack : true
	});

}

function didItemClick(e) {
	var rowId = e.row.rowId;
	var rowName = e.row.rowName;
	section = e.section;
	var prescription = _.findWhere(readyForRefill, {
		rx_number : rowId,
		presn_name : rowName

	});
	selectedPresc = new Array;
	var row = e.source;
	if (e.row) {

		selectedPresc.push(rowId);
		selectedPresc.push(rowName);
		iconLbl.text = Alloy.CFG.icons.checkbox;
		iconLbl.color = "#00A14B";

	}

	alert(row.text + ' ' + row.title.text);

}

function terminate() {
	$.destroy();
}

function didAndroidBack() {
	return $.toggleMenu.hide();
}

exports.init = init;
exports.terminate = terminate;
exports.androidback = didAndroidBack;
