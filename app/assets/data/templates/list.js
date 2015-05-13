module.exports = {
	"data" : [{
		"apiName" : "TableView",
		"children" : [{
			"addChild" : "setFooterView",
			"items" : [{
				"apiName" : "View",
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
							"icon" : "prescriptions"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "strPrescriptions"
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
									"textid" : "strRefillNow"
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
							"icon" : "reminder"
						}
					}, {
						"apiName" : "View",
						"classes" : ["content-view-with-licon", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["content-lbl", "touch-disabled"],
								"properties" : {
									"textid" : "strReminders"
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
							"icon" : "users_list"
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
				}],
				"navigation" : {
					"ctrl" : "addFamilyAccount"
				}
			}, {
				"apiName" : "TableViewRow",
				"children" : [{
					"items" : [{
						"apiName" : "Label",
						"classes" : ["content-left-icon", "touch-disabled"],
						"properties" : {
							"icon" : "pharmacies"
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
							"icon" : "transfer"
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
							"icon" : "doctors"
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
							"icon" : "account"
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
