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
			}, {
				"apiName" : "View",
				"classes" : ["margin-top", "margin-bottom", "auto-height", "vgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["margin-top-medium", "bottom", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-prescription"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled", "accessibility-actionablelements"],
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
			},{
				"apiName" : "View",
				"classes" : ["margin-top-medium", "margin-bottom-medium" , "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["margin-top", "margin-bottom", "auto-height", "vgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["bottom", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-refill-camera"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled", "accessibility-actionablelements"],
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
				"apiName" : "View",
				"classes" : ["margin-top-medium", "margin-bottom-medium", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["margin-top", "margin-bottom", "auto-height", "vgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["bottom", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-reminder"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled", "accessibility-actionablelements"],
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
				"apiName" : "View",
				"classes" : ["margin-top-medium", "margin-bottom-medium", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["margin-top", "margin-bottom", "auto-height", "vgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["bottom", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
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
				"apiName" : "View",
				"classes" : ["margin-top-medium", "margin-bottom-medium", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["margin-top", "margin-bottom", "auto-height", "vgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["bottom", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-pharmacy"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled", "accessibility-actionablelements"],
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
				"apiName" : "View",
				"classes" : ["margin-top-medium", "margin-bottom-medium", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["margin-top", "margin-bottom", "auto-height", "vgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["bottom", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-transfer"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled", "accessibility-actionablelements"],
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
				"apiName" : "View",
				"classes" : ["margin-top-medium", "margin-bottom-medium", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["margin-top", "margin-bottom", "auto-height", "vgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["bottom", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-reward"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
								"properties" : {
									"textid" : "titleInsurance"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"ctrl" : "insurance",
					"titleid" : "titleInsuranceCard"

				}
			}, {
				"apiName" : "View",
				"classes" : ["margin-top-medium", "h-divider-light"]

			}, {
				"apiName" : "View",
				"classes" : ["margin-top", "margin-bottom", "auto-height", "vgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["bottom", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-doctor"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled", "accessibility-actionablelements"],
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
				"apiName" : "View",
				"classes" : ["margin-top-medium", "margin-bottom-medium", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["margin-top", "margin-bottom", "auto-height", "vgroup", "hwrap-disabled"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["bottom", "auto-height", "hgroup", "hwrap-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-account"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled", "accessibility-actionablelements"],
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
			}, {
				"apiName" : "View",
				"classes" : ["margin-top-medium", "h-divider-light"]
			}]
		}]
	}]
};
