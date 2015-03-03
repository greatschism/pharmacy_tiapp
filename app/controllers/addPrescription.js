var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    dialog = require("dialog"),
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    DUE_FOR_REFILL_IN_DAYS = Alloy._due_for_refill_in_days,
    msgPickUp = Alloy.Globals.strings.msgPickUp,

    readyToRefill,
    otherPrescriptions,
    prescriptions;

function init() {
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

	console.log(prescriptions);

	if (readyForRefill.length) {
		console.log("ready to refill");
		$.readyForRefillSection = uihelper.createTableViewSection($, strings.sectionReadyForRefill);
		for (var i in readyForRefill) {
			console.log('ready for refill' + readyForRefill[i]);
			var transform = readyForRefill[i],
		 anticipatedRefillDate = moment(transform.anticipated_refill_date, "YYYY/MM/DD");
			todaysDate = moment();

			ndays = anticipatedRefillDate.diff(todaysDate, 'days');
			console.log(ndays);
			row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow",
				classes : ["height-75d"],

			}),

           icon = $.UI.create("View",{
           	apiName: "View",
           	height: 50,
           	classes : ["vgroup"]
           	
           }),
           
           iconLbl = $.UI.create("Label", {
				apiName : "Label",
				height : 32,
				width : 32,
				font : {
					fontSize : 20
				},
				text : Alloy.CFG.icons.addition,
				color : "#599DFF",
				classes : ["width-90", "padding-left", "auto-height"]
			}),


			
			content = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view", "vgroup"]
			}),

			sub = $.UI.create("View", {
				apiName : "View",
				//classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
			}),

			
			detail = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-info-lbl"]
			}),
			rx = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl", "left"]
			}),
			due = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl"]
			});
			row.className = "readyForRefill";
			sub.rowId = transform.id;
		
			title.text = utilities.ucfirst(transform.presc_name);
			rx.text = addRx(transform.rx_number);


             icon.add(iconLbl);
     
		
			detail.add(rx);
			detail.add(due);

			content.add(title);
			content.add(detail);

			
			row.add(icon);
		
			row.add(content);
			if (ndays < 0) {
				var overDueLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
				});
				content = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-view"]
				});
				overDueDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				overDueLbl.text = strings.msgOverdueBy;
				overDueDetailLbl.text = Math.abs(ndays) + "days";
				row.add(content);
				content.add(overDueLbl);
				content.add(overDueDetailLbl);
				console.log("reached");

			} else if (ndays >= 0) {
				var dueForRefillLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
				});
				content = $.UI.create("View", {
					apiName : "View",
					classes : ["list-item-view"]
				});
				dueForRefillDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				dueForRefillLbl.text = strings.msgDueFoRefillIn;
				dueForRefillDetailLbl.text = ndays + "days";
				row.add(content);
				content.add(dueForRefillLbl);
				content.add(dueForRefillDetailLbl);
			} else {

			}

			$.readyForRefillSection.add(row);
		}

	}

	if (otherPrescriptions.length) {
		console.log("others");
		$.otherPrescriptionsSection = uihelper.createTableViewSection($, strings.sectionOtherPrescriptions);
		for (var i in otherPrescriptions) {
			console.log('otherPrescriptions' + otherPrescriptions[i]);
			var transform = otherPrescriptions[i],
			    anticipatedRefillDate = moment(transform.anticipated_refill_date, "YYYY/MM/DD");
			todaysDate = moment();

			ndays = anticipatedRefillDate.diff(todaysDate, 'days');
			console.log(ndays);
			row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow",
				classes : ["height-75d"]
			}),
			
			
			
			vseparator = $.UI.create("View", {
				apiName : "View",
				//classes : ["vseparator", "height-70", "touch-disabled"]
			}),
			content = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view", "vgroup"]
			}),
			sub = $.UI.create("View", {
				apiName : "View",
				//classes : ["padding-top", "padding-bottom", "margin-left", "margin-right", "auto-height", "vgroup"]
			}),
			title = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-title-lbl", "left"]
			}),
			detail = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-info-lbl"]
			}),
			rx = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl", "left"]
			}),
			due = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl"]
			});
			row.className = "others";
			content.rowId = transform.id;
			//content.addEventListener("click", didItemClick);
			title.text = utilities.ucfirst(transform.presc_name);
			rx.text = addRx(transform.rx_number);

			detail.add(rx);
			detail.add(due);
			content.add(title);
			content.add(detail);
			row.add(content);
			if (ndays < 0) {
				var overDueLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right", "padding-bottom"]
				});
				overDueDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				overDueLbl.text = strings.msgOverdueBy;
				overDueDetailLbl.text = ndays;
				detail.add(overDueLbl);
				detail.add(overDueDetailLbl);
			} else if (ndays >= 0) {
				var dueForRefillLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-info-lbl", "right"]
				});
				dueForRefillDetailLbl = $.UI.create("Label", {
					apiName : "Label",
					classes : ["list-item-critical-detail-lbl", "right"]
				});
				dueForRefillLbl.text = strings.msgDueFoRefillOn;
				dueForRefillDetailLbl.text = ndays + "days";
				detail.add(dueForRefillLbl);
				detail.add(dueForRefillDetailLbl);
			} else {

			}
			$.otherPrescriptionsSection.add(row);
		}

	}
	$.tableView.data = [$.readyForRefillSection, $.otherPrescriptionsSection];
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
	//app.navigator.open({
	//	ctrl : "orderDetails",

	//	ctrlArguments : {
	//		prescription : prescriptions
	//	},
	//	stack : true
	//});
	Ti.APP.info(_result.message);
}

function didItemClick(e) {
	var newPresc = e.rowId;
	alert("you clicked" + newPresc);
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
