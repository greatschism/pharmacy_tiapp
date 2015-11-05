/**
 * list view
 * without family care
 */
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
									"top" : 15,
									"bottom" : 15,
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
									"top" : 15,
									"bottom" : 15,
									"textid" : "titleRefill"
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
									"top" : 15,
									"bottom" : 15,
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
									"top" : 15,
									"bottom" : 15,
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
									"top" : 15,
									"bottom" : 15,
									"textid" : "titleTransfer"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"ctrl" : "transfer"
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
									"top" : 15,
									"bottom" : 15,
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
									"top" : 15,
									"bottom" : 15,
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
