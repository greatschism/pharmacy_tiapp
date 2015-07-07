module.exports = {
	"data" : [{
		"apiName" : "TableView",
		"children" : [{
			"addChild" : "setHeaderView",
			"items" : [{
				"id" : "bannerView",
				"apiName" : "View",
				"classes" : ["auto-width", "auto-height"]
			}]
		}, {
			"addChild" : "setFooterView",
			"items" : [{
				"apiName" : "View",
				"platform" : ["ios"],
				"classes" : ["auto-height"]
			}]
		}, {
			"addChild" : "setData",
			"asArray" : true,
			"items" : [{
				"apiName" : "TableViewRow",
				"children" : [{
					"items" : [{
						"apiName" : "Label",
						"classes" : ["content-left-icon", "touch-disabled"],
						"properties" : {
							"icon" : "thick_prescription"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "titlePrescriptions"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"ctrl" : "prescriptions"
				}
			}, {
				"apiName" : "TableViewRow",
				"children" : [{
					"items" : [{
						"apiName" : "Label",
						"classes" : ["content-left-icon", "touch-disabled"],
						"properties" : {
							"icon" : "refill_camera"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "titleQuickRefill"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"ctrl" : "refill"
				}
			}, {
				"apiName" : "TableViewRow",
				"children" : [{
					"items" : [{
						"apiName" : "Label",
						"classes" : ["content-left-icon", "touch-disabled"],
						"properties" : {
							"icon" : "thick_reminder"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "titleReminders"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"ctrl" : "reminders"
				}
			}, {
				"apiName" : "TableViewRow",
				"children" : [{
					"items" : [{
						"apiName" : "Label",
						"classes" : ["content-left-icon", "touch-disabled"],
						"properties" : {
							"icon" : "users"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "titleFamilyAccounts"
								}
							}]
						}]
					}]
				}]
			}, {
				"apiName" : "TableViewRow",
				"children" : [{
					"items" : [{
						"apiName" : "Label",
						"classes" : ["content-left-icon", "touch-disabled"],
						"properties" : {
							"icon" : "thick_pharmacy"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "titleStores"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"ctrl" : "stores"
				}
			}, {
				"apiName" : "TableViewRow",
				"children" : [{
					"items" : [{
						"apiName" : "Label",
						"classes" : ["content-left-icon", "touch-disabled"],
						"properties" : {
							"icon" : "thick_transfer"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "titleTransferPrescription"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"ctrl" : "transferPrescription"
				}
			}, {
				"apiName" : "TableViewRow",
				"children" : [{
					"items" : [{
						"apiName" : "Label",
						"classes" : ["content-left-icon", "touch-disabled"],
						"properties" : {
							"icon" : "thick_doctor"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "titleDoctors"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"ctrl" : "doctors"
				}
			}, {
				"apiName" : "TableViewRow",
				"children" : [{
					"items" : [{
						"apiName" : "Label",
						"classes" : ["content-left-icon", "touch-disabled"],
						"properties" : {
							"icon" : "thick_account"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "titleAccount"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"ctrl" : "account"
				}
			}]
		}]
	}]
};
