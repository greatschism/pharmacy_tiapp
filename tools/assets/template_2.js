/**
 * gird view
 */
module.exports = {
	"data" : [{
		"apiName" : "ScrollView",
		"classes" : ["vgroup"],
		"children" : [{
			"items" : [{
				"id" : "bannerView",
				"apiName" : "View",
				"classes" : ["auto-width", "auto-height"]
			}, {
				"apiName" : "View",
				"classes" : ["h-divider-light", "touch-disabled"]
			}, {
				"id" : "tilesView",
				"apiName" : "View",
				"classes" : ["auto-height", "hide"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["auto-height", "vgroup", "show"],
						"actions" : [{
							"event" : "postlayout",
							"binders" : [{
								"id" : "vdivider",
								"pick" : ["height"]
							}, {
								"id" : "tilesView",
								"pick" : ["visible"]
							}]
						}],
						"children" : [{
							"items" : [{
								"apiName" : "View",
								"classes" : ["auto-height"],
								"children" : [{
									"items" : [{
										"apiName" : "View",
										"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-prescription"]
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "margin-bottom-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
										"classes" : ["right", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-refill-camera"]
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "margin-bottom-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
												"properties" : {
													"textid" : "titleRefill"
												}
											}]
										}],
										"navigation" : {
											"action" : "refill"
										}
									}]
								}]
							}, {
								"apiName" : "View",
								"classes" : ["h-divider-light", "touch-disabled"]
							}, {
								"apiName" : "View",
								"classes" : ["auto-height"],
								"children" : [{
									"items" : [{
										"apiName" : "View",
										"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-reminder"]
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "margin-bottom-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
												"properties" : {
													"textid" : "titleReminders"
												}
											}]
										}],
										"feature_name" : "is_reminders_enabled",
										"navigation" : {
											"ctrl" : "reminders"
										}
									}, {
										"apiName" : "View",
										"classes" : ["right", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-users"]
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "margin-bottom-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
												"properties" : {
													"textid" : "titleFamilyAccounts"
												}
											}]
										}],
										"feature_name" : "is_proxy_enabled",
										"navigation" : {
											"ctrl" : "familyCare"
										}
									}]
								}]
							}, {
								"apiName" : "View",
								"classes" : ["h-divider-light", "touch-disabled"]
							}, {
								"apiName" : "View",
								"classes" : ["auto-height"],
								"children" : [{
									"items" : [{
										"apiName" : "View",
										"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-pharmacy"]
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "margin-bottom-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
										"classes" : ["right", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-transfer"]
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "margin-bottom-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
								"classes" : ["h-divider-light", "touch-disabled"]
							}, {
								"apiName" : "View",
								"classes" : ["auto-height"],
								"children" : [{
									"items" : [{
										"apiName" : "View",
										"classes" : ["left", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-doctor"]
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "margin-bottom-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
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
										"classes" : ["right", "margin-top-large", "margin-bottom-large", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "i4", "primary-fg-color", "touch-disabled", "icon-thick-account"]
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top-medium", "margin-bottom-medium", "h4", "fg-color", "txt-center", "touch-disabled"],
												"properties" : {
													"textid" : "titleAccount"
												}
											}]
										}],
										"navigation" : {
											"ctrl" : "account"
										}
									}]
								}]
							}, {
								"apiName" : "View",
								"classes" : ["h-divider-light", "touch-disabled"]
							}]
						}]
					}, {
						"id" : "vdivider",
						"apiName" : "View",
						"classes" : ["top", "v-divider-light", "touch-disabled"]
					}]
				}]
			}]
		}]
	}]
};
