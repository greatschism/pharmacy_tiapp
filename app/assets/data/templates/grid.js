module.exports = {
	"data" : [{
		"id" : "scrollView",
		"apiName" : "ScrollView",
		"classes" : ["hide"],
		"children" : [{
			"items" : [{
				"apiName" : "View",
				"classes" : ["top", "auto-height", "vgroup", "show"],
				"actions" : [{
					"event" : "postlayout",
					"binders" : [{
						"id" : "vdivider",
						"properties" : ["height"]
					}, {
						"id" : "scrollView",
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
										"classes" : ["margin-top", "primary-icon-large", "touch-disabled", "accessibility-disabled"],
										"properties" : {
											"icon" : "prescriptions"
										}
									}, {
										"apiName" : "Label",
										"classes" : ["margin-top", "margin-bottom", "lbl-centered", "touch-disabled"],
										"properties" : {
											"textid" : "strPrescriptions"
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
										"classes" : ["margin-top", "primary-icon-large", "touch-disabled", "accessibility-disabled"],
										"properties" : {
											"icon" : "refill_camera"
										}
									}, {
										"apiName" : "Label",
										"classes" : ["margin-top", "margin-bottom", "lbl-centered", "touch-disabled"],
										"properties" : {
											"textid" : "strRefillNow"
										}
									}]
								}],
								"navigation" : {
									"action" : "refillViaCamera"
								}
							}]
						}]
					}, {
						"apiName" : "View",
						"classes" : ["h-divider", "touch-disabled"]
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
										"classes" : ["margin-top", "primary-icon-large", "touch-disabled", "accessibility-disabled"],
										"properties" : {
											"icon" : "pharmacies"
										}
									}, {
										"apiName" : "Label",
										"classes" : ["margin-top", "margin-bottom", "lbl-centered", "touch-disabled"],
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
										"classes" : ["margin-top", "primary-icon-large", "touch-disabled", "accessibility-disabled"],
										"properties" : {
											"icon" : "transfer"
										}
									}, {
										"apiName" : "Label",
										"classes" : ["margin-top", "margin-bottom", "lbl-centered", "touch-disabled"],
										"properties" : {
											"textid" : "titleTransferPrescription"
										}
									}]
								}],
								"navigation" : {
									"action" : "transferPrescription"
								}
							}]
						}]
					}, {
						"apiName" : "View",
						"classes" : ["h-divider", "touch-disabled"]
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
										"classes" : ["margin-top", "primary-icon-large", "touch-disabled", "accessibility-disabled"],
										"properties" : {
											"icon" : "doctors"
										}
									}, {
										"apiName" : "Label",
										"classes" : ["margin-top", "margin-bottom", "lbl-centered", "touch-disabled"],
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
										"classes" : ["margin-top", "primary-icon-large", "touch-disabled", "accessibility-disabled"],
										"properties" : {
											"icon" : "account"
										}
									}, {
										"apiName" : "Label",
										"classes" : ["margin-top", "margin-bottom", "lbl-centered", "touch-disabled"],
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
						"classes" : ["h-divider", "touch-disabled"]
					}]
				}]
			}, {
				"id" : "vdivider",
				"apiName" : "View",
				"classes" : ["top", "v-divider", "touch-disabled"]
			}]
		}]
	}]
};
