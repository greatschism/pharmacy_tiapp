module.exports = {
	"data" : [{
		"id" : "scrollView",
		"apiName" : "ScrollView",
		"classes" : ["width-100", "vgroup"],
		"children" : [{
			"items" : [{
				"apiName" : "View",
				"classes" : ["auto-height", "hgroup-no-wrap"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
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
						"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
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
					}, {
						"apiName" : "View",
						"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
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
					}]
				}]
			}, {
				"apiName" : "View",
				"classes" : ["auto-height", "hgroup-no-wrap"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
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
					}, {
						"apiName" : "View",
						"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
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
						"classes" : ["left", "margin-top", "margin-bottom", "auto-height", "vgroup"],
						"properties" : {
							"width" : "33%"
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
			}]
		}]
	}]
};
