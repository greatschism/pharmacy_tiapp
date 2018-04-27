/**
 * spread view
 */
module.exports = {
	"data" : [{
		"id" : "scrollView",
		"apiName" : "ScrollView",
		"classes" : ["width-100", "vgroup"],
		"children" : [{
			"items" : [{
				"id" : "bannerView",
				"apiName" : "View",
				"classes" : ["auto-width", "auto-height"]
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
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-prescription"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-doctor"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleAccount"
								}
							}]
						}],
						"navigation" : {
							"ctrl" : "account"
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
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-coupon"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleRewards"
								}
							}]
						}],
						"navigation" : {
							"url" : "https://www.pharmacarewards.com/cp/login.aspx?RGD=90C3391A-AC59-4B3F-A164-0FAB24998D0B"
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
								"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-cart"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-top-medium", "margin-bottom-medium", "margin-left-medium", "margin-right-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
								"properties" : {
									"textid" : "titleShop"
								}
							}]
						}],
						"navigation" : {
							"url" : "https://www.pharmaca.com"
						}
					}]
				}]
			}]
		}]
	}]
};
