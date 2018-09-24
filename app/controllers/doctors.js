var args = $.args,
    apiCodes = Alloy.CFG.apiCodes,
    prescriptions = [],
    rows,
    swipeOptions,
    currentDoctor,
    defaultImg,
    isWindowOpen;

function init() {
	defaultImg = $.uihelper.getImage("default_profile").image;
	swipeOptions = [{
		action : 1,
		title : $.strings.doctorsSwipeOptRemove,
		type : "negative"
	}];
	$.patientSwitcher.set({
		title : $.strings.doctorsPatientSwitcher,
		where : {
			is_partial : false
		}
	});
	$.tableView.applyProperties({
		top : $.uihelper.getHeightFromChildren($.headerView),
		bottom : $.tableView.bottom
	});

	if (OS_IOS) {
		//required if the user returns to the app and was already on the page
		//TODO: make sure that the actions are not performed if the user needs to be logged out first
		Ti.App.addEventListener("resumed", performDeepLinkAction);
	}
}

function performDeepLinkAction() {
	//Ti.API.info("performDeepLinkAction() "+ Alloy.Globals.url)
	if( typeof Alloy.Globals.url === 'string' ) {
		var navPage = (Alloy.Globals.url.split('page='))[1];
			navPage =navPage.split('&');

		if(navPage[0] === "doctors") {
			var urlInfo = (navPage[1].split('info='))[1];
			var urlData = (navPage[2].split('data='))[1];

			//for POC purposes we are simply alerting url GET param values
			//to extend functionality, these values would be used to elicit specific action/behavior in the app
			alert("info = "+urlInfo+"  data = "+urlData);
		}

		//reset Alloy.Globals.url - otherwise the app may think that it hasn't yet acted on the deep link
		Alloy.Globals.url = undefined;
    }
}

function didChangePatient(e) {
	getDoctors();
}

function focus() {
	/*
	 * avoid null pointer if another controller or another instance of this controller
	 * used this global variable in it's life span
	 */
	Alloy.Globals.currentTable = $.tableView;
	/**
	 * keep api calls in focus and validate
	 * window open by first focus flag - isWindowOpen
	 */
	if (!isWindowOpen) {
		isWindowOpen = true;
		getDoctors();
	} else if (currentDoctor.method) {
		var method = currentDoctor.method;
		/**
		 * to prevent method property
		 * added to model / collection
		 * delete it before adding / processing
		 */
		delete currentDoctor.method;
		switch(method) {
		case "doctors_add":
			Alloy.Collections.doctors.add(currentDoctor);
			var row = processModel(Alloy.Collections.doctors.last());
			$.tableView.appendRow(row.getView());
			rows.push(row);
			break;
		case "doctors_update":
			delete currentDoctor.updated;
			_.some(rows, function(row, index) {
				if (row.getParams().id == currentDoctor.id) {
					var model = Alloy.Collections.doctors.at(index);
					model.set(_.pick(currentDoctor, ["first_name", "last_name", "doctor_dea", "phone", "fax", "addressline1", "addressline2", "zip", "city", "state", "notes", "image_url"]));
					var newRow = processModel(model);
					$.tableView.updateRow( OS_IOS ? index : row.getView(), newRow.getView());
					rows[index] = newRow;
					return true;
				}
				return false;
			});
			break;
		case "doctors_delete":
			didDeleteDoctor(null, currentDoctor);
			break;
		}
		currentDoctor = null;
	}
		
	performDeepLinkAction();
}

function getDoctors() {
	$.http.request({
		method : "doctors_list",
		params : {
			filter : {
				sort_type : apiCodes.doctors_sort_type_asc,
				sort_by : apiCodes.doctors_sort_by_fname
			}
		},
		keepLoader : true,
		success : didGetDoctors
	});
}

function didGetDoctors(result, passthrough) {
	Alloy.Collections.doctors.reset(result.data.doctors);
	$.http.request({
		method : "prescriptions_list",
		params : {
			data : [{
				prescriptions : {
					sort_order_preferences : apiCodes.prescriptions_sort_by_name,
					prescription_display_status : apiCodes.prescription_display_status_active
				}
			}]
		},
		errorDialogEnabled : false,
		success : didGetPrescriptions,
		failure : didGetPrescriptions
	});
}

function didGetPrescriptions(result, passthrough) {
	if (result.data && result.data.prescriptions) {
		prescriptions = result.data.prescriptions;
	}
	rows = [];
	var data = [];
	Alloy.Collections.doctors.each(function(model) {
		var row = processModel(model);
		data.push(row.getView());
		rows.push(row);
	});
	$.tableView.setData(data);
	/*
	 *  reset the swipe flag
	 *  once a fresh list is loaded
	 *  not resetting this block further swipe actions
	 */
	Alloy.Globals.isSwipeInProgress = false;
	Alloy.Globals.currentRow = null;
}

function processModel(model) {
	var docPrescs,
	    subtitle;
	if (model.get("doctor_type") != apiCodes.doctor_type_manual) {
		docPrescs = _.where(prescriptions, {
			doctor_id : model.get("id")
		});
		/* Description format
		 * 0 drugs You have no active prescriptions associated
		 * 1 drug has prescribed you [DRUGNAME].
		 * 2 drugs has prescribed you [DRUGNAME] and [DRUGNAME].
		 * 3 drugs has prescribed you [DRUGNAME], [DRUGNAME] and [DRUGNAME].
		 * 4 or more has prescribed you [DRUGNAME], [DRUGNAME], and [X] more.
		 */
		var len = docPrescs.length;
		if (len) {
			//When len is > 0
			subtitle = $.utilities.ucword(docPrescs[0].presc_name);
			if (len > 1) {
				//when > 1 and switch case used for defining when it is == 2, ==3 and > 3
				switch(len) {
				case 2:
					subtitle += " " + $.strings.strAnd + " " + $.utilities.ucword(docPrescs[1].presc_name);
					break;
				case 3:
					subtitle += ", " + $.utilities.ucword(docPrescs[1].presc_name) + " " + $.strings.strAnd + " " + $.utilities.ucword(docPrescs[2].presc_name);
					break;
				default:
					subtitle += ", " + $.utilities.ucword(docPrescs[1].presc_name) + " " + $.strings.strAnd + " [" + (len - 2) + "] " + $.strings.strMore;
				}
			}
			subtitle = String.format($.strings.doctorsLblPrescribed, subtitle);
		} else {
			subtitle = $.strings.doctorsLblPrescribedNone;
		}
	} else {
		subtitle = $.strings.doctorsLblManual;
	}
	/**
	 * api has to be fixed
	 * returns null as string
	 */
	var imageURL = model.get("image_url");
	var decodedImageURL = '';
	if(OS_ANDROID)
	{
		if(imageURL != null && imageURL != '' && typeof(imageURL) !== 'undefined')
		{
			decodedImageURL = decodeURIComponent(imageURL);
			if(decodedImageURL.indexOf('?') != -1)
			{
				imageURL = decodedImageURL.split('?')[0];
			} else {
				imageURL = decodedImageURL;
			}
		}
	}
	model.set({
		image : imageURL && imageURL != "null" ? imageURL : "",
		defaultImage : defaultImg,
		title : $.strings.strPrefixDoctor.concat($.utilities.ucword(model.get("first_name") || "") + " " + $.utilities.ucword(model.get("last_name") || "")),
		subtitle : subtitle,
		prescriptions : docPrescs,
		options : Ti.App.accessibilityEnabled ? null : swipeOptions
	});
	var row = Alloy.createController("itemTemplates/contentViewSwipeable", model.toJSON());
	row.on("clickoption", didClickSwipeOption);
	return row;
}

function didClickSwipeOption(e) {
	if (Alloy.Globals.currentRow) {
		Alloy.Globals.currentRow.touchEnd();
	}
	/**
	 * we have only one option now, so no need for any further validation
	 * just confirm and remove doctor
	 */
	var data = e.data;
	if (data.doctor_type != apiCodes.doctor_type_manual) {
		$.uihelper.showDialog({
			message : $.strings.doctorsMsgRemoveRestricted
		});
	} else {
		$.uihelper.showDialog({
			message : String.format($.strings.doctorsMsgRemoveConfirm, data.title),
			buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
			cancelIndex : 1,
			success : function() {
				$.http.request({
					method : "doctors_delete",
					params : {
						data : [{
							doctors : {
								id : data.id
							}
						}]
					},
					passthrough : data,
					success : didDeleteDoctor
				});
			}
		});
	}
}

function didDeleteDoctor(result, passthrough) {
	/**
	 * no need to call the list api
	 * as it is a successful delete
	 * and api is going to return the same data set
	 */
	rows = _.reject(rows, function(row, index) {
		if (passthrough.id === row.getParams().id) {
			$.tableView.deleteRow(row.getView());
			return true;
		}
		return false;
	});
	//remove model from collection
	Alloy.Collections.doctors.remove(Alloy.Collections.doctors.findWhere({
		id : passthrough.id
	}));
}

function didClickAdd(e) {
	currentDoctor = {};
	$.app.navigator.open({
		titleid : "titleDoctorAdd",
		ctrl : "doctorSettings",
		ctrlArguments : {
			isUpdate : false,
			doctor : currentDoctor
		},
		stack : true
	});
}

function didClickTableView(e) {
	if (Alloy.Globals.currentRow) {
		return Alloy.Globals.currentRow.touchEnd();
	}
	var row = rows[e.index];
	if (row) {
		currentDoctor = row.getParams();
		$.app.navigator.open({
			titleid : "titleDoctorDetails",
			ctrl : "doctorDetails",
			ctrlArguments : {
				doctor : currentDoctor,
				canUpdate : true
			},
			stack : true
		});
	}
}

function setParentView(view) {
	$.patientSwitcher.setParentView(view);
}

function terminate() {
	//terminate patient switcher
	$.patientSwitcher.terminate();
	/**
	 * not resetting currentTable object
	 * as there are chance when nullify it here
	 * may affect the object being set on next
	 * controllers init / focus method
	 */
	Alloy.Globals.currentRow = null;
	Alloy.Globals.isSwipeInProgress = false;

	if (OS_IOS) {
		Ti.App.removeEventListener("resumed", performDeepLinkAction);
	}
}


exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
exports.setParentView = setParentView;
