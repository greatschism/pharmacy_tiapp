(function() {

	var Locale = require("localization");
	Locale.init();
	Alloy.Globals.strings = Locale.currentLanguage.strings;

	Alloy.Globals.loggedIn = false;
	Alloy.Globals.currentLocation = {};
	if (Ti.Platform.model == "google_sdk" || Ti.Platform.model == "Simulator") {
		Alloy.Globals.currentLocation = {
			latitude : 12.9739156,
			longitude : 77.6172187
		};
	}

	Alloy.Globals.Map = OS_MOBILEWEB ? Ti.Map : require("ti.map");

	Alloy.Collections.menuItems = new Backbone.Collection();
	Alloy.Collections.termsAndConditions = new Backbone.Collection();
	Alloy.Collections.stores = new Backbone.Collection();
	Alloy.Collections.doctors = new Backbone.Collection();

	Alloy.Models.user = new Backbone.Model({
		loggedIn : false,
		sessionId : "",
		appLoad : {}
	});
	Alloy.Models.store = new Backbone.Model();

	Alloy.Models.user.on("change:loggedIn", function didLoginChange() {
		Alloy.Globals.loggedIn = Alloy.Models.user.get("loggedIn");
	});

	//styles
	_.extend(Alloy, {
		_navigator : "hamburger",
		_due_for_refill_in_days : 7,
		_content_height : 48,
		_border_radius : 6,
		_m_top : 24,
		_m_bottom : 24,
		_m_left : 16,
		_m_right : 16,
		_p_top : 16,
		_p_bottom : 16,
		_p_left : 8,
		_p_right : 8,
		_typo_h1 : {
			fontFamily : Alloy.CFG.fonts.regular,
			fontSize : 24,
		},
		_typo_height_h1 : 28,
		_typo_h2 : {
			fontFamily : Alloy.CFG.fonts.medium,
			fontSize : 20
		},
		_typo_height_h2 : 24,
		_typo_h3 : {
			fontFamily : Alloy.CFG.fonts.regular,
			fontSize : 16
		},
		_typo_height_h3 : 20,
		_typo_h4 : {
			fontFamily : Alloy.CFG.fonts.medium,
			fontSize : 14
		},
		_typo_height_h4 : 18,
		_typo_h5 : {
			fontFamily : Alloy.CFG.fonts.regular,
			fontSize : 14
		},
		_typo_height_h5 : 18,
		_typo_h6 : {
			fontFamily : Alloy.CFG.fonts.regular,
			fontSize : 12
		},
		_typo_height_h6 : 16,
		_switch_color : "#4bd865",
		_fg_primary : "#FFFFFF",
		_fg_secondary : "#000000",
		_fg_tertiary : "#F7941E",
		_fg_quaternary : "#C4C4C4",
		_fg_quinary : "#599DFF",
		_bg_primary : "#F7941E",
		_bg_secondary : "#6D6E71",
		_bg_tertiary : "#808285",
		_bg_quaternary : "#C4C4C4",
		_bg_quinary : "#EFEFF4",
		_bg_senary : "#FFFFFF",
		_br_primary : "#F7941E",
		_br_secondary : "#C4C4C4",
		_add_color : "#599DFF",
		_success_color : "#00A14B",
		_error_color : "#ED1C24",
		_approval_color : "#F6931E",
		_reminder_color : ["#AF7AC4", "#27AE60", "#F39C12", "#D35400", "#47C9AF", "#4094FC", "#34495E", "#D4FB79", "#76D6FF", "#C1382A", "#AAB7B7", "#D28874", "#7C7645", "#FC4063", "#845FFF", "#3F09F6"]
	});

	var items = [{
		titleid : "titleHome",
		ctrl : "home",
		icon : "home",
		disaplyAtHome : false,
		requiresLogin : false,
		landingPage : true
	}, {
		titleid : "strPrescriptions",
		ctrl : "prescriptions",
		icon : "prescriptions",
		disaplyAtHome : true,
		requiresLogin : true
	}, {
		titleid : "strReminders",
		action : "reminders",
		icon : "reminder",
		requiresLogin : true
	}, {
		titleid : "titlePharmacyRewards",
		action : "pharmacyRewards",
		icon : "reward",
		requiresLogin : true
	}, {
		titleid : "titleCoupons",
		action : "coupons",
		icon : "coupon",
		requiresLogin : true
	}, {
		titleid : "titleFamilyAccounts",
		action : "familyAccounts",
		icon : "users_list",
		requiresLogin : true
	}, {
		titleid : "titleTransferPrescription",
		action : "transferPrescription",
		icon : "transfer",
		disaplyAtHome : true,
		requiresLogin : true
	}, {
		titleid : "titleDoctors",
		ctrl : "doctors",
		icon : "doctors",
		disaplyAtHome : true,
		requiresLogin : true
	}, {
		titleid : "titleRefillViaCamera",
		action : "refillViaCamera",
		icon : "refill_camera",
		disaplyAtHome : true,
		requiresLogin : false
	}, {
		titleid : "titleStores",
		ctrl : "stores",
		icon : "pharmacies",
		disaplyAtHome : true,
		requiresLogin : false
	}, {
		titleid : "titleAccount",
		ctrl : "account",
		icon : "account",
		disaplyAtHome : true,
		requiresLogin : true
	}];
	Alloy.Collections.menuItems.reset(items);

	//Templates
	Alloy.Globals.homePageTemplates = [{
		title : "List",
		data : [{
			apiName : "TableView",
			addChild : "setData",
			asArray : true,
			children : [{
				apiName : "TableViewRow",
				children : [{
					apiName : "View",
					classes : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					addChild : "add",
					children : [{
						apiName : "Label",
						classes : ["left", "fg-tertiary", "touch-disabled"],
						properties : {
							icon : "prescriptions",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-left", "h4-fixed", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "strPrescriptions"
						}
					}]
				}],
				navigation : {
					ctrl : "prescriptions"
				}
			}, {
				apiName : "TableViewRow",
				children : [{
					apiName : "View",
					classes : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					addChild : "add",
					children : [{
						apiName : "Label",
						classes : ["left", "fg-tertiary", "touch-disabled"],
						properties : {
							icon : "refill_camera",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-left", "h4-fixed", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleRefillViaCamera"
						}
					}]
				}],
				navigation : {
					action : "refillViaCamera"
				}
			}, {
				apiName : "TableViewRow",
				children : [{
					apiName : "View",
					classes : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					addChild : "add",
					children : [{
						apiName : "Label",
						classes : ["left", "fg-tertiary", "touch-disabled"],
						properties : {
							icon : "pharmacies",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-left", "h4-fixed", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleStores"
						}
					}]
				}],
				navigation : {
					ctrl : "stores"
				}
			}, {
				apiName : "TableViewRow",
				children : [{
					apiName : "View",
					classes : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					addChild : "add",
					children : [{
						apiName : "Label",
						classes : ["left", "fg-tertiary", "touch-disabled"],
						properties : {
							icon : "transfer",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-left", "h4-fixed", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleTransferPrescription"
						}
					}]
				}],
				navigation : {
					action : "transferPrescription"
				}
			}, {
				apiName : "TableViewRow",
				children : [{
					apiName : "View",
					classes : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					addChild : "add",
					children : [{
						apiName : "Label",
						classes : ["left", "fg-tertiary", "touch-disabled"],
						properties : {
							icon : "doctors",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-left", "h4-fixed", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleDoctors"
						}
					}]
				}],
				navigation : {
					ctrl : "doctors"
				}
			}, {
				apiName : "TableViewRow",
				children : [{
					apiName : "View",
					classes : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					addChild : "add",
					children : [{
						apiName : "Label",
						classes : ["left", "fg-tertiary", "touch-disabled"],
						properties : {
							icon : "account",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-left", "h4-fixed", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleAccount"
						}
					}]
				}],
				navigation : {
					ctrl : "account"
				}
			}]
		}]
	}, {
		title : "Grid",
		data : [{
			apiName : "ScrollView",
			classes : ["vgroup"],
			children : [{
				apiName : "View",
				classes : ["auto-height"],
				children : [{
					apiName : "View",
					classes : ["margin-top", "margin-bottom", "left", "width-50", "auto-height", "vgroup"],
					children : [{
						apiName : "Label",
						classes : ["fg-tertiary", "touch-disabled"],
						properties : {
							icon : "prescriptions",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-top", "margin-left", "margin-right", "h4-fixed", "text-center", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "strPrescriptions"
						}
					}],
					navigation : {
						ctrl : "prescriptions"
					}
				}, {
					apiName : "View",
					classes : ["margin-top", "margin-bottom", "right", "width-50", "auto-height", "vgroup"],
					children : [{
						apiName : "Label",
						classes : ["fg-tertiary", "touch-disabled"],
						properties : {
							icon : "refill_camera",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-top", "margin-left", "margin-right", "h4-fixed", "text-center", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleRefillViaCamera"
						}
					}],
					navigation : {
						action : "refillViaCamera"
					}
				}]
			}, {
				apiName : "View",
				classes : ["hseparator", "touch-disabled"]
			}, {
				apiName : "View",
				classes : ["auto-height"],
				children : [{
					apiName : "View",
					classes : ["margin-top", "margin-bottom", "left", "width-50", "auto-height", "vgroup"],
					children : [{
						apiName : "Label",
						classes : ["fg-tertiary", "touch-disabled"],
						properties : {
							icon : "pharmacies",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-top", "margin-left", "margin-right", "h4-fixed", "text-center", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleStores"
						}
					}],
					navigation : {
						ctrl : "stores"
					}
				}, {
					apiName : "View",
					classes : ["margin-top", "margin-bottom", "right", "width-50", "auto-height", "vgroup"],
					children : [{
						apiName : "Label",
						classes : ["fg-tertiary", "touch-disabled"],
						properties : {
							icon : "transfer",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-top", "margin-left", "margin-right", "h4-fixed", "text-center", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleTransferPrescription"
						}
					}],
					navigation : {
						action : "transferPrescription"
					}
				}]
			}, {
				apiName : "View",
				classes : ["hseparator", "touch-disabled"]
			}, {
				apiName : "View",
				classes : ["auto-height"],
				children : [{
					apiName : "View",
					classes : ["margin-top", "margin-bottom", "left", "width-50", "auto-height", "vgroup"],
					children : [{
						apiName : "Label",
						classes : ["fg-tertiary", "touch-disabled"],
						properties : {
							icon : "doctors",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-top", "margin-left", "margin-right", "h4-fixed", "text-center", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleDoctors"
						}
					}],
					navigation : {
						ctrl : "doctors"
					}
				}, {
					apiName : "View",
					classes : ["margin-top", "margin-bottom", "right", "width-50", "auto-height", "vgroup"],
					children : [{
						apiName : "Label",
						classes : ["fg-tertiary", "touch-disabled"],
						properties : {
							icon : "account",
							font : {
								fontFamily : "mscripts",
								fontSize : 40
							}
						}
					}, {
						apiName : "Label",
						classes : ["padding-top", "margin-left", "margin-right", "h4-fixed", "text-center", "fg-secondary", "touch-disabled"],
						properties : {
							textid : "titleAccount"
						}
					}],
					navigation : {
						ctrl : "account"
					}
				}]
			}, {
				apiName : "View",
				classes : ["hseparator", "touch-disabled"]
			}]
		}, {
			apiName : "View",
			classes : ["vseparator", "touch-disabled"]
		}]
	}];

	Alloy.Globals.templateIndex = 0;

})();
