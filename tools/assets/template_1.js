/**
 * list view
 */
module.exports = {
	"data" : [{
		"apiName" : "View",
		"children" : [{
			"items" : [{
				"id" : "bannerView",
				"apiName" : "View",
				"classes" : ["top", "auto-width", "auto-height"],
				"actions" : [{
					"event" : "postlayout",
					"keepAlive" : true,
					"binders" : [{
						"id" : "tableView",
						"transform" : [{
							"from" : "height",
							"to" : "top"
						}]
					}]
				}]
			}, {
				"id" : "tableView",
				"apiName" : "TableView",
				"children" : [{
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
								"apiName" : "View",
								"classes" : ["margin-top-large", "margin-bottom-large", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
								"children" : [{
									"items" : [{
										"apiName" : "Label",
										"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-prescription"]
									}, {
										"apiName" : "Label",
										"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
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
								"apiName" : "View",
								"classes" : ["margin-top-large", "margin-bottom-large", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
								"children" : [{
									"items" : [{
										"apiName" : "Label",
										"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-refill-camera"]
									}, {
										"apiName" : "Label",
										"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
										"properties" : {
											"textid" : "titleRefill"
										}
									}]
								}]
							}]
						}],
						"navigation" : {
							"action" : "refill"
						}
					}, {
						"apiName" : "TableViewRow",
						"children" : [{
							"items" : [{
								"apiName" : "View",
								"classes" : ["margin-top-large", "margin-bottom-large", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
								"children" : [{
									"items" : [{
										"apiName" : "Label",
										"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-reminder"]
									}, {
										"apiName" : "Label",
										"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
										"properties" : {
											"textid" : "titleReminders"
										}
									}]
								}]
							}]
						}],
						"feature_name" : "is_reminders_enabled",
						"navigation" : {
							"ctrl" : "reminders"
						}
					}, {
						"apiName" : "TableViewRow",
						"children" : [{
							"items" : [{
								"apiName" : "View",
								"classes" : ["margin-top-large", "margin-bottom-large", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
								"children" : [{
									"items" : [{
										"apiName" : "Label",
										"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-users"]
									}, {
										"apiName" : "Label",
										"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
										"properties" : {
											"textid" : "titleFamilyAccounts"
										}
									}]
								}]
							}]
						}],
						"feature_name" : "is_proxy_enabled",
						"navigation" : {
							"ctrl" : "familyCare"
						}
					}, {
						"apiName" : "TableViewRow",
						"children" : [{
							"items" : [{
								"apiName" : "View",
								"classes" : ["margin-top-large", "margin-bottom-large", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
								"children" : [{
									"items" : [{
										"apiName" : "Label",
										"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-pharmacy"]
									}, {
										"apiName" : "Label",
										"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
										"properties" : {
											"textid" : "titleStores"
										}
									}]
								}]
							}]
						}],
						"feature_name" : "is_storelocator_enabled",
						"navigation" : {
							"ctrl" : "stores"
						}
					}, {
						"apiName" : "TableViewRow",
						"children" : [{
							"items" : [{
								"apiName" : "View",
								"classes" : ["margin-top-large", "margin-bottom-large", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
								"children" : [{
									"items" : [{
										"apiName" : "Label",
										"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-transfer"]
									}, {
										"apiName" : "Label",
										"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
										"properties" : {
											"textid" : "titleTransfer"
										}
									}]
								}]
							}]
						}],
						"feature_name" : "is_transferrx_enabled",
						"navigation" : {
							"ctrl" : "transfer"
						}
					}, {
						"apiName" : "TableViewRow",
						"children" : [{
							"items" : [{
								"apiName" : "View",
								"classes" : ["margin-top-large", "margin-bottom-large", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
								"children" : [{
									"items" : [{
										"apiName" : "Label",
										"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-doctor"]
									}, {
										"apiName" : "Label",
										"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
										"properties" : {
											"textid" : "titleDoctors"
										}
									}]
								}]
							}]
						}],
						"feature_name" : "is_doctors_enabled",
						"navigation" : {
							"ctrl" : "doctors"
						}
					}, {
						"apiName" : "TableViewRow",
						"children" : [{
							"items" : [{
								"apiName" : "View",
								"classes" : ["margin-top-large", "margin-bottom-large", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
								"children" : [{
									"items" : [{
										"apiName" : "Label",
										"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-account"]
									}, {
										"apiName" : "Label",
										"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
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
		}]
	}]
};
