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
									"icon" : "thick_prescription"
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
									"icon" : "thick_pharmacy"
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
									"icon" : "thick_transfer"
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
									"icon" : "thick_doctor"
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
									"icon" : "thick_account"
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
