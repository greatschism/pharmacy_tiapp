var args = $.args,
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    prescription = args.prescription,
    postlayoutCount = 0,
    newMedReminder,
    isWindowOpen,
    httpClient,
    logger = require("logger");

function init() {

	Alloy.CFG.remind_before_in_days_max = parseInt(Alloy.Models.appload.get("startReminderPeriod")) > Alloy.CFG.remind_before_in_days_max ? parseInt(Alloy.Models.appload.get("startReminderPeriod")) : Alloy.CFG.remind_before_in_days_max;
	Alloy.CFG.default_refill_reminder.remind_before_in_days = parseInt(Alloy.Models.appload.get("startReminderPeriod"));
	Alloy.CFG.default_refill_reminder.no_of_reminders = parseInt(Alloy.Models.appload.get("numberOfReminder"));
	Alloy.CFG.default_refill_reminder.reminder_hour = parseInt(Alloy.Models.appload.get("reminderSendHour"));
	Alloy.CFG.default_refill_reminder.reminder_minute = parseInt(Alloy.Models.appload.get("reminderSendMinute"));
	Alloy.CFG.default_refill_reminder.reminder_meridiem = Alloy.Models.appload.get("reminderSendMeridiem");
	$.titleLbl.text = prescription.title;
	var refillsLeft = parseInt(prescription.refill_left),
	    refillsLeftIsNaN = _.isNaN(refillsLeft),
	    refillsLeftTitle = refillsLeftIsNaN ? prescription.refill_left : refillsLeft;
	if (!refillsLeftIsNaN && refillsLeft <= Alloy.CFG.prescription_refills_left_negative) {
		$.refillsLeftBtn.applyProperties($.createStyle({
			classes : ["negative-bg-color", "light-fg-color", "negative-border"],
			title : refillsLeftTitle
		}));
	} else {
		$.refillsLeftBtn.title = refillsLeftTitle;
	}
	$.dueBtn.title = prescription.anticipated_refill_date ? moment(prescription.anticipated_refill_date, apiCodes.date_format).format(Alloy.CFG.date_format) : $.strings.strNil;
	$.lastRefillBtn.title = prescription.latest_sold_date ? moment(prescription.latest_sold_date, apiCodes.date_time_format).format(Alloy.CFG.date_format) : $.strings.strNil;
	_.each(["refillsLeftLbl", "dueLbl", "lastRefillLbl"], function(val) {
		$.uihelper.wrapText($[val]);
	});
	_.each(["refillsLeftBtn", "dueBtn", "lastRefillBtn"], function(val) {
		$.uihelper.roundedCorners($[val]);
	});
	_.each(["reminderRefillView", "reminderMedView", "historyView", "instructionView"], function(val) {
		if ($[val]) {
			$.uihelper.wrapViews($[val], "right");
		}
	});
	if (_.has(prescription, "store")) {
		/**
		 * Use case:
		 * 1. if prescriptions/get is already
		 * called for this prescription.
		 * 2. by that time is_dosage_reminder_set flag was "0".
		 * 3. now user opens another prescription's detail
		 * and add a med reminder from there along with
		 * this prescription.
		 *
		 * then is_dosage_reminder_set flag here is out dated.
		 * check for it
		 */
		if (prescription.is_dosage_reminder_set === "0" && Alloy.Collections.remindersMed.length) {
			Alloy.Collections.remindersMed.some(function(model) {
				if (_.indexOf(_.pluck(model.get("prescriptions"), "id"), prescription.id) != -1) {
					/**
					 * got enough to declare
					 * this prescription has
					 * med reminder
					 */
					prescription.is_dosage_reminder_set = "1";
					return true;
				}
				return false;
			});
		}
		//load data
		loadPresecription();
		loadDoctor();
		loadStore();
		loadCopay();
	}

	$.refillsLeftLbl.accessibilityLabel = $.refillsLeftLbl.text;
	$.refillsLeftLbl.accessibilityValue = $.refillsLeftBtn.title;
	$.dueLbl.accessibilityLabel = $.dueLbl.text;
	$.dueLbl.accessibilityValue = $.dueBtn.title !== $.strings.strNil ? $.dueBtn.title : 0;
	$.lastRefillLbl.accessibilityLabel = $.lastRefillLbl.text;
	$.lastRefillLbl.accessibilityValue = $.lastRefillBtn.title !== $.strings.strNil ? $.lastRefillBtn.title : 0;
	setAccessibilityLabelOnSwitch($.reminderRefillSwt, $.strings.prescDetAccessibilityReminderRefill);
	setAccessibilityLabelOnSwitch($.reminderMedSwt, $.strings.prescDetAccessibilityReminderMed);

	$.instructionLbl.accessibilityLabel = $.instructionLbl.text;
	$.instructionLbl.accessibilityValue = $.strings.prescDetLblInstructionAccessibilityCollapsed;
	$.instructionLbl.accessibilityHint = $.strings.prescDetLblInstructionExpandAccessibility;
}

function setAccessibilityLabelOnSwitch(switchObj, strValue) {
	var iDict = {};
	iDict.accessibilityLabel = strValue;
	iDict.accessibilityHint = $.strings.prescriptionSwitchAccessibilityHint;
	switchObj.applyProperties(iDict);
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		if (!_.has(prescription, "store")) {
			httpClient = $.http.request({
				method : "prescriptions_get",
				params : {
					data : [{
						prescriptions : {
							id : prescription.id,
							sort_order_preferences : Alloy.Models.sortOrderPreferences.get("selected_code_value"),
							prescription_display_status : apiCodes.prescription_display_status_active
						}
					}]
				},
				showLoader : false,
				success : didGetPrescription
			});
		}
	} else if (newMedReminder) {
		/**
		 * if method is valid then
		 * user has added the reminder
		 * successfully
		 */
		if (newMedReminder.method) {
			//update collection (method should be pointing to add)
			Alloy.Collections.remindersMed.add(newMedReminder);
			//update flag
			prescription.is_dosage_reminder_set = "1";
		} else {
			/**
			 * no reminder was added
			 * revert switch state
			 */
			$.reminderMedSwt.setValue(false, true);
		}
		newMedReminder = null;
	}
}

function didGetPrescription(result, passthrough) {
	_.extend(prescription, result.data.prescriptions);
	prescription.dosage_instruction_message = $.utilities.ucfirst(prescription.dosage_instruction_message || $.strings.strNotAvailable);
	loadPresecription();
	/**
	 * docor_id can be null
	 */
	if (prescription.doctor_id) {
		getDoctor();
	} else {
		loadDoctor();
		getStore();
	}
	loadCopay();
}

function getDoctor() {
	httpClient = $.http.request({
		method : "doctors_get",
		params : {
			data : [{
				doctors : {
					id : prescription.doctor_id,
				}
			}]
		},
		showLoader : false,
		success : didGetDoctor
	});
}

function didGetDoctor(result, passthrough) {
	prescription.doctor = {};
	var doctor = prescription.doctor;
	_.extend(doctor, result.data.doctors);
	/**
	 * image and defaultImage
	 * is required when user goes
	 * to doctor details from this screen
	 */
	var imageURL = doctor.image_url;
	_.extend(doctor, {
		title : $.strings.strPrefixDoctor.concat($.utilities.ucword(doctor.first_name) + " " + $.utilities.ucword(doctor.last_name)),
		image : imageURL && imageURL != "null" ? imageURL : "",
		defaultImage : $.uihelper.getImage("default_profile").image
	});
	loadDoctor();
	getStore();
}

function getStore() {
	httpClient = $.http.request({
		method : "stores_get",
		params : {
			data : [{
				stores : {
					id : prescription.original_store_id,
				}
			}]
		},
		showLoader : false,
		success : didGetStore
	});
}

function didGetStore(result, passthrough) {
	httpClient = null;
	prescription.store = {};
	var store = prescription.store;
	_.extend(store, result.data.stores);
	_.extend(store, {
		title : $.utilities.ucword(store.addressline1),
		subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + $.utilities.ucword(store.zip)
	});
	loadStore();
}

function loadPresecription() {
	/*
	 * Hide schedule 2 drug for refill
	 *
	 */	
	 if ($.refillBtn && prescription.schedule == 2) {
		$.refillBtn.height = 0;
	}

	$.instructionAsyncView.hide();
	$.instructionExp.setStopListening(true);
	/**
	 * make sure reminders
	 * module is enabled
	 */
	if (Alloy.CFG.is_reminders_enabled) {
		/**
		 * all switches will be off
		 * by default
		 */
		//refill reminder
		if (prescription.is_refill_reminder_set === "1") {
			$.reminderRefillSwt.setValue(true, isWindowOpen);
		}
		//med reminder
		if (prescription.is_dosage_reminder_set === "1") {
			$.reminderMedSwt.setValue(true, isWindowOpen);
		}
	}
	//dosage instructions
	$.prescInstructionLbl.text = prescription.dosage_instruction_message;

	if (_.has(prescription, "quantity")) {
		if (prescription.quantity != null) {
			$.quantityReplyLbl.text = prescription.quantity;
			// $.copayView.hide(false);

		} else {
			logger.debug("quantity is null");
			// $.copayView.hide(true);
			$.quantityView.height = 0;
		}
	} else {
		$.quantityView.height = 0;
	}
}

function loadDoctor() {
	$.rxReplyLbl.text = prescription.rx_number;
	$.expiryReplyLbl.text = moment(prescription.expiration_date, apiCodes.date_format).format(Alloy.CFG.date_format);
	$.doctorReplyLbl.text = prescription.doctor ? prescription.doctor.title : $.strings.strNotAvailable;
}

function loadStore() {
	$.prescAsyncView.hide();
	$.storeReplyLbl.text = Alloy.CFG.is_specialty_store_grouping_enabled ?(prescription.is_specialty_store && prescription.store_phone ? prescription.store_phone : prescription.store.title + "\n" + prescription.store.subtitle):
	prescription.store.title + "\n" + prescription.store.subtitle;
	/**
	 * Keep the expandable view opened
	 * by default (PHA-1086)
	 *
	 * &&
	 *
	 * height has to be calculated and applied for expanable views only once the page is rendered
	 * this may cause jerk on screen, avoid it by showing a loader on init
	 */
	setTimeout(didUpdateUI, 1000);
}

function didUpdateUI() {
	/**
	 * PHA-1086 - keep it expanded
	 * incase to revert:
	 * 1. Update the toggle
	 * (show more / less) title in xml
	 * 2. remove $.prescExp.expand();
	 * 3. keep only $.loader.hide();
	 * 4. move this setTimeout(didUpdateUI, 1000);
	 * to init
	 */
	$.prescExp.expand();
	if (Ti.App.accessibilityEnabled) {
		togglePrescription();
	};
	$.loader.hide();
}

function didPostlayoutPrompt(e) {
		var source = e.source,
	    children = source.getParent().children;
	    source.removeEventListener("postlayout", didPostlayoutPrompt);
	    children[1].applyProperties({
			left : children[1].left + children[0].rect.width,
			visible : true
		});		    
	postlayoutCount++;
	if (postlayoutCount === 4) {
		$.prescExp.setStopListening(true);
	}
}
function didPostlayoutPromptStore(e){
		var source = e.source,
	    children = source.getParent().children;

	    source.removeEventListener("postlayout", didPostlayoutPromptStore);

		if(prescription.is_specialty_store || "1" === prescription.syncScriptEnrolled || "Y" === prescription.prefill  ) {
			$.reminderRefillView.hide();
			$.reminderRefillView.height = 0;

		}

	    if(prescription.is_specialty_store && prescription.store_phone){	    		    
	    children[1].applyProperties({
			left : children[1].left + children[0].rect.width,
			visible : true
		});		    		
		children[2].applyProperties({
			left : children[0].rect.width + (2 * children[1].rect.width),
			visible : true
		});
	}
	else{
	    children[2].applyProperties({
			left : children[2].left + children[0].rect.width,
			visible : true
		});	
	}
	postlayoutCount++;
	if (postlayoutCount === 4) {
		$.prescExp.setStopListening(true);
	}
}

function didClickStore(e){
	if(Alloy.CFG.is_specialty_store_grouping_enabled){	
	if(prescription.is_specialty_store && prescription.store_phone){
			storePhone();
		}
	else{
	  $.app.navigator.open({
		  titleid : "titleStoreDetails",
		  ctrl : "storeDetails",
		  ctrlArguments : {
			  store : prescription.store
		  },
		  stack : true
	  });
	 }
	}
	else{
	  $.app.navigator.open({
		  titleid : "titleStoreDetails",
		  ctrl : "storeDetails",
		  ctrlArguments : {
			  store : prescription.store
		  },
		  stack : true
	  });
	 }
}

function storePhone(){
	if(!Titanium.Contacts.hasContactsPermissions()) {
		Titanium.Contacts.requestContactsPermissions(function(result){
			if(result.success) {
				contactsHandler();
			}
			else{
				$.analyticsHandler.trackEvent("Spacialty-ContactDetails", "click", "DeniedContactsPermission");
			}
		});
	} else {
		contactsHandler();
	}
}
function contactsHandler() {
	 if (prescription.store_phone!= null) {
		 $.uihelper.getPhone({
			 firstName : prescription.original_store_store_name,
			 phone : {
				 work : [prescription.store_phone]
			 }
		 }, prescription.store_phone);
	 }
}

function didClickDoctor(e) {
	/**
	 *  list of prescriptions should be available
	 *  as the only way for prescription details screen
	 *  is prescription list
	 */
	if (prescription.doctor) {
		var doctor = _.clone(prescription.doctor);
		doctor.prescriptions = [];
		Alloy.Collections.prescriptions.each(function(model) {
			if (model.get("doctor_id") == doctor.id) {
				doctor.prescriptions.push(model.toJSON());
			}
		});
		$.app.navigator.open({
			titleid : "titleDoctorDetails",
			ctrl : "doctorDetails",
			ctrlArguments : {
				doctor : doctor
			},
			stack : true
		});
	}
}

function togglePrescription(e) {
	var title,
	    result;
	if ($.prescExp.isExpanded()) {
		title = "prescDetExpand";
		result = $.prescExp.collapse();
	} else {
		title = "prescDetCollapse";
		result = $.prescExp.expand();
	}
	if (result) {
		$.toggleLbl.text = $.strings[title];
	}
}

function toggleInstruction(e) {
	var classes,
	    result;
	if ($.instructionExp.isExpanded()) {
		$.prescInstructionLbl.accessibilityHidden = true;
		$.instructionLbl.accessibilityLabel = $.instructionLbl.text;
		$.instructionLbl.accessibilityValue = $.strings.prescDetLblInstructionAccessibilityCollapsed;
		$.instructionLbl.accessibilityHint = $.strings.prescDetLblInstructionExpandAccessibility;
		classes = ["icon-thin-arrow-down"];
		result = $.instructionExp.collapse();
	} else {
		$.prescInstructionLbl.accessibilityHidden = false;
		$.instructionLbl.accessibilityLabel = $.instructionLbl.text;
		$.instructionLbl.accessibilityValue = "";
		$.instructionLbl.accessibilityHint = $.strings.prescDetLblInstructionCollapseAccessibility;
		classes = ["icon-thin-arrow-up"];
		result = $.instructionExp.expand();
	}
	if (result) {
		$.arrowLbl.applyProperties($.createStyle({
			classes : classes
		}));
	}
}

function didClickRefill(e) {
	rx.canRefill(prescription, didConfirmRefill);
}

function didConfirmRefill() {
	Alloy.Globals.isMailOrderService = false;

	$.app.navigator.open({
		titleid : "titleOrderDetails",
		ctrl : "orderDetails",
		ctrlArguments : {
			prescriptions : [prescription]
		},
		stack : true
	});
}

function didClickHide(e) {
	$.uihelper.showDialog({
		message : String.format($.strings.prescDetMsgHideConfirm, prescription.title),
		buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
		cancelIndex : 1,
		success : didConfirmHide
	});
}

function didConfirmHide() {
	httpClient = $.http.request({
		method : "prescriptions_hide",
		params : {
			data : [{
				prescriptions : [{
					id : prescription.id
				}]
			}]
		},
		success : didHidePrescription
	});
}

function didHidePrescription(result, passthrough) {
	httpClient = null;
	//triggers a reload when prescription list is focused
	prescription.shouldUpdate = true;
	$.app.navigator.close();
}

function showHistory(e) {
	$.app.navigator.open({
		titleid : "titleRefillHistory",
		ctrl : "refillHistory",
		ctrlArguments : {
			prescription : prescription
		},
		stack : true
	});
}

function didChangeRefill(e) {
	/**
	 * in order to set refill_all_prescriptions flag
	 * while add / update reminder, we need both active
	 * and hidden prescriptions count
	 * Note: prescription details screen will be available only
	 * from prescriptions list / prescription module where
	 * active prescriptions are only listed, so just get hidden
	 * and add it's length with Alloy.Collections.prescriptions.length
	 */
	$.http.request({
		method : "prescriptions_list",
		params : {
			data : [{
				prescriptions : {
					sort_order_preferences : apiCodes.prescriptions_sort_by_name,
					prescription_display_status : apiCodes.prescription_display_status_hidden
				}
			}]
		},
		passthrough : {
			value : e.value
		},
		keepLoader : true,
		errorDialogEnabled : false,
		success : didGetPrescriptions,
		failure : didGetPrescriptions
	});
}

function didGetPrescriptions(result, passthrough) {
	passthrough.hiddenPrescriptionsLength = result.data && result.data.prescriptions.length || 0;
	$.http.request({
		method : "reminders_refill_get",
		params : {
			data : [{
				reminders : {
					type : apiCodes.reminder_type_refill
				}
			}]
		},
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : false,
		success : didGetRefillReminder,
		failure : didGetRefillReminder
	});
}

function didGetRefillReminder(result, passthrough) {
	/**
	 * if success
	 * or
	 * when no refill reminders
	 * set earlier - first time
	 */
	if (result.data || result.errorCode === apiCodes.no_refill_reminders) {
		var currentData;
		if (result.data) {
			//get existing reminders
			currentData = result.data.reminders;
			if (passthrough.value) {
				//add it
				currentData.prescriptions.push(_.pick(prescription, ["id"]));
			} else {
				//remove it
				var prescId = prescription.id;
				currentData.prescriptions = _.reject(currentData.prescriptions, function(pObj) {
					return pObj.id == prescId;
				});
			}
		} else {
			/**
			 * handle when no reminders set already
			 * adding reminder with only this prescription
			 * Note: switch value (passthrough.value) must
			 * be true here
			 */
			currentData = {
				prescriptions : [_.pick(prescription, ["id"])]
			};
			_.extend(currentData, Alloy.CFG.default_refill_reminder);
		}
		$.http.request({
			method : result.data ? "reminders_refill_update" : "reminders_refill_add",
			params : {
				data : [{
					reminders : _.extend(_.omit(currentData, ["recurring", "additional_reminder_date"]), {
						refill_all_prescriptions : currentData.prescriptions.length === (Alloy.Collections.prescriptions.length + passthrough.hiddenPrescriptionsLength) ? 1 : 0,
						type : apiCodes.reminder_type_refill,
						reminder_enabled : 1
					})
				}]
			},
			passthrough : passthrough,
			success : didSetRefillReminder,
			failure : didNotSetRefillReminder
		});
	} else {
		$.app.navigator.hideLoader();
	}
}

function didSetRefillReminder(result, passthrough) {
	/**
	 * update prescription data
	 * as the api call passed
	 */
	if (passthrough.value) {
		prescription.is_refill_reminder_set = "1";
		/**
		 * verify reminder mode is not null
		 */
		var mPatient = Alloy.Collections.patients.findWhere({
			selected : true
		}),
		    colName = _.findWhere(Alloy.CFG.reminders, {
			id : "refill"
		}).col_pref;
		if (mPatient.get(colName) === apiCodes.reminder_delivery_mode_none) {
			$.uihelper.showDialog({
				message : $.strings.remindersRefillMsgDeliveryModeNoneConfirm,
				buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
				cancelIndex : 1,
				success : function didConfirmPush() {
					/**
					 * device token should have been sent
					 * already at authenticator while login
					 */
					var params = {};
					params[colName] = authenticator.getPushModeForDeviceToken();
					authenticator.updatePreferences(params, {});
				}
			});
		}
	} else {
		prescription.is_refill_reminder_set = "0";
	}
}

function didNotSetRefillReminder(result, passthrough) {
	/**
	 * revert switch state
	 * as the api call failed
	 */
	$.reminderRefillSwt.setValue(!passthrough.value, true);
}

function didChangeMed(e) {
	if (e.value) {
		/**
		 * allow user to create a med
		 * reminder. Take him
		 * to reminder's prescription
		 * selection screen with
		 * this prescription as selected
		 *
		 * Note: We also need the
		 * reminders med list api here,
		 * as have reminder validation
		 * on click on check mark in prescription
		 * selection list. Also remember
		 * it is not possible to show the hidden
		 * prescriptions here.
		 *
		 * Caution: if we try to call prescription
		 * list twice (for active and hidden) then store
		 * it in a collection, it may work for reminders.
		 * But later then if user goes to refill prescription
		 * selection screen, he will get to see hidden
		 * prescription there.
		 *
		 * Also using cached reminders list
		 * may conflict, when prescription is
		 * removed from reminder
		 */
		$.http.request({
			method : "reminders_med_list",
			params : {
				data : [{
					reminders : {
						type : apiCodes.reminder_type_med
					}
				}]
			},
			errorDialogEnabled : false,
			success : didGetMedReminders,
			failure : didGetMedReminders
		});
	} else {
		/**
		 * remove from med reminder
		 */
		$.http.request({
			method : "reminders_med_delete_prescription",
			params : {
				data : [{
					reminders : {
						type : apiCodes.reminder_type_med,
						prescriptions : _.pick(prescription, ["id"])
					}
				}]
			},
			success : didRemoveMedReminder,
			failure : didNotRemoveMedReminder
		});
	}
}

function didGetMedReminders(result, passthrough) {
	/**
	 * check whether it is a success call
	 * since no reminders found is considered as a error and data is null
	 * set reminders node to empty array in order to reset the collection and list
	 */
	if (!result.data) {
		//keep object structure
		result.data = {
			reminders : []
		};
	}
	//update collections
	Alloy.Collections.remindersMed.reset(result.data.reminders);
	/**
	 * open prescription to add reminder
	 * same as in remindersMed -> didClickAdd
	 */
	newMedReminder = {};
	var firstLaunchReminders = $.utilities.getProperty(Alloy.CFG.first_launch_med_reminders, true, "bool", false);
	if (firstLaunchReminders) {
		$.utilities.setProperty(Alloy.CFG.first_launch_med_reminders, false, "bool", false);
	}
	$.app.navigator.open({
		titleid : "titleRemindersMedPrescriptions",
		ctrl : "prescriptions",
		ctrlArguments : {
			navigation : {
				titleid : "titleRemindersMedSettings",
				ctrl : "remindersMedSettings",
				ctrlArguments : {
					isUpdate : false,
					canAdd : false,
					reminder : newMedReminder
				},
				stack : true
			},
			isMedReminder : true,
			sectionHeaderViewDisabled : true,
			showMedReminderTooltip : firstLaunchReminders,
			patientSwitcherDisabled : true,
			showHiddenPrescriptions : true,
			validator : "medReminder",
			selectable : true,
			minLength : 1,
			useCache : true,
			selectedItems : [prescription.id],
			navigationFrom : ""
		},
		stack : true
	});
}

function didRemoveMedReminder(result, passthrough) {
	/**
	 * update prescription data
	 * as the api call passed
	 * (prescription deleted from
	 * 	all med reminders)
	 */
	prescription.is_dosage_reminder_set = "0";
}

function didNotRemoveMedReminder(result, passthrough) {
	/**
	 * revert switch state
	 * as the api call failed
	 * (prescription was not deleted
	 * 	from med reminders)
	 */
	$.reminderMedSwt.setValue(true, true);
}

function terminate() {
	// if (httpClient) {
		// httpClient.abort();
	// }
}

function loadCopay() {
	logger.debug("\n\n\ncopay amount", prescription.copay);
	logger.debug("\n\n\nrefill status", prescription.refill_status);
	logger.debug("\n\n\nprescription", JSON.stringify(prescription));

	if (prescription.refill_status === apiCodes.refill_status_ready) {
		if (_.has(prescription, "copay")) {
			if (prescription.copay != null) {
				$.copayReplyLbl.text = "$" + prescription.copay;
				// $.copayView.hide(false);

			} else {
				logger.debug("copay is null");
				// $.copayView.hide(true);
				if($.copayView) {
					$.copayView.height = 0;
				}
			}
		}
	} else {
		if($.copayView) {
			$.copayView.height = 0;
		}

	}
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
