/**
 * list view
 */
module.exports = {
	"data" : [{
		"id" : "scrollView",
		"apiName" : "ScrollView",
		"classes" : ["vgroup", "top", "fill-width", "fill-height"],
		"children" : [{
			"items" : [{
				"apiName" : "View",
				"classes" : ["margin-left-large", "margin-right-large", "auto-height", "hgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
						},
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-prescription"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h5", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titlePrescriptions"
								}
							}]
						}],
						"navigation" : {
							"ctrl" : "prescriptions"
						}
					}, {
						"apiName" : "View",
						"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
						},
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-refill-camera"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h5", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleRefill"
								}
							}]
						}],
						"navigation" : {
							"action" : "refill"
						}
					}, {
						"apiName" : "View",
						"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
						},
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-reminder"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h5", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleReminders"
								}
							}]
						}],
						"feature_name" : "is_reminders_enabled",
						"navigation" : {
							"ctrl" : "reminders"
						}
					}]
				}]
			}, {
				"apiName" : "View",
				"classes" : ["margin-left-large", "margin-right-large", "auto-height", "hgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
						},
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-users"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h5", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleFamilyAccounts"
								}
							}]
						}],
						"feature_name" : "is_proxy_enabled",
						"navigation" : {
							"ctrl" : "familyCare"
						}
					}, {
						"apiName" : "View",
						"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
						},
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-pharmacy"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h5", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleStores"
								}
							}]
						}],
						"feature_name" : "is_storelocator_enabled",
						"navigation" : {
							"ctrl" : "stores"
						}
					}, {
						"apiName" : "View",
						"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
						},
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-transfer"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h5", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleTransfer"
								}
							}]
						}],
						"feature_name" : "is_transferrx_enabled",
						"navigation" : {
							"ctrl" : "transfer"
						}
					}]
				}]
			}, {
				"apiName" : "View",
				"classes" : ["margin-left-large", "margin-right-large", "auto-height", "hgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
						},
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-reward"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h5", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleInsurance"
								}
							}]
						}],
						"feature_name" : "is_insurancecard_enabled",
						"navigation" : {
							"ctrl" : "insurance",
							"titleid" : "titleInsuranceCard"
						}
					}, {
						"apiName" : "View",
						"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
						},
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-doctor"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h5", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleDoctors"
								}
							}]
						}],
						"feature_name" : "is_doctors_enabled",
						"navigation" : {
							"ctrl" : "doctors"
						}
					}, {
						"apiName" : "View",
						"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
						},
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-account"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h5", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleAccount"
								}
							}]
						}],
						"feature_name" : "is_doctors_enabled",
						"navigation" : {
							"ctrl" : "account"
						}
					}]
				}]
			},{
				"apiName" : "View",
				"classes" : ["margin-top-medium", "h-divider-light"]
			},{
				"id" : "bannerView",
				"apiName" : "View",
				"classes" : ["top", "auto-width", "auto-height"],
				"actions" : [{
					"event" : "postlayout",
					"keepAlive" : true,
					"binders" : [{
						"id" : "scrollView"
					}]
				}]
			}]
		}]
	}]
};
