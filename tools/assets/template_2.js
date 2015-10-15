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
								"properties" : ["height"]
							}, {
								"id" : "tilesView",
								"properties" : ["visible"]
							}]
						}],
						"children" : [{
							"items" : [{
								"apiName" : "View",
								"classes" : ["auto-height"],
								"children" : [{
									"items" : [{
										"apiName" : "View",
										"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top", "primary-icon", "touch-disabled", "accessibility-disabled"],
												"properties" : {
													"icon" : "thick_prescription"
												}
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top", "margin-bottom", "lbl-centered-wrap", "touch-disabled"],
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
										"classes" : ["right", "margin-top", "margin-bottom", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top", "primary-icon", "touch-disabled", "accessibility-disabled"],
												"properties" : {
													"icon" : "refill_camera"
												}
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top", "margin-bottom", "lbl-centered-wrap", "touch-disabled"],
												"properties" : {
													"textid" : "titleRefill"
												}
											}]
										}],
										"navigation" : {
											"ctrl" : "refill"
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
										"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top", "primary-icon", "touch-disabled", "accessibility-disabled"],
												"properties" : {
													"icon" : "thick_reminder"
												}
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top", "margin-bottom", "lbl-centered-wrap", "touch-disabled"],
												"properties" : {
													"textid" : "titleReminders"
												}
											}]
										}],
										"navigation" : {
											"ctrl" : "reminders"
										}
									}, {
										"apiName" : "View",
										"classes" : ["right", "margin-top", "margin-bottom", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top", "primary-icon", "touch-disabled", "accessibility-disabled"],
												"properties" : {
													"icon" : "users"
												}
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top", "margin-bottom", "lbl-centered-wrap", "touch-disabled"],
												"properties" : {
													"textid" : "titleFamilyAccounts"
												}
											}]
										}],
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
										"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top", "primary-icon", "touch-disabled", "accessibility-disabled"],
												"properties" : {
													"icon" : "thick_pharmacy"
												}
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top", "margin-bottom", "lbl-centered-wrap", "touch-disabled"],
												"properties" : {
													"textid" : "titleStores"
												}
											}]
										}],
										"navigation" : {
											"ctrl" : "stores"
										}
									}, {
										"apiName" : "View",
										"classes" : ["right", "margin-top", "margin-bottom", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top", "primary-icon", "touch-disabled", "accessibility-disabled"],
												"properties" : {
													"icon" : "thick_transfer"
												}
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top", "margin-bottom", "lbl-centered-wrap", "touch-disabled"],
												"properties" : {
													"textid" : "titleTransfer"
												}
											}]
										}],
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
										"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top", "primary-icon", "touch-disabled", "accessibility-disabled"],
												"properties" : {
													"icon" : "thick_doctor"
												}
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top", "margin-bottom", "lbl-centered-wrap", "touch-disabled"],
												"properties" : {
													"textid" : "titleDoctors"
												}
											}]
										}],
										"navigation" : {
											"ctrl" : "doctors"
										}
									}, {
										"apiName" : "View",
										"classes" : ["right", "margin-top", "margin-bottom", "auto-height", "vgroup"],
										"properties" : {
											"width" : "50%"
										},
										"children" : [{
											"items" : [{
												"apiName" : "Label",
												"classes" : ["margin-top", "primary-icon", "touch-disabled", "accessibility-disabled"],
												"properties" : {
													"icon" : "thick_account"
												}
											}, {
												"apiName" : "Label",
												"classes" : ["margin-top", "margin-bottom", "lbl-centered-wrap", "touch-disabled"],
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
