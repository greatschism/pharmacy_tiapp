module.exports = {
	"data" : [{
		"apiName" : "ScrollView",
		"classes" : ["vgroup"],
		"children" : [{
			"items" : [{
				"apiName" : "View",
				"classes" : ["auto-height"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["left", "margin-top", "margin-bottom", "width-50", "auto-height", "vgroup"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["large-icon", "primary-color", "touch-disabled", "accessibility-disabled"],
								"properties" : {
									"icon" : "prescriptions"
								}
							}, {
								"apiName" : "Label",
								"classes" : ["padding-top", "margin-left", "margin-right", "single-line-title-lbl", "text-center", "touch-disabled"],
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
						"classes" : ["right", "margin-top", "margin-bottom", "width-50", "auto-height", "vgroup"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["large-icon", "primary-color", "touch-disabled", "accessibility-disabled"],
								"properties" : {
									"icon" : "refill_camera"
								}
							}, {
								"apiName" : "Label",
								"classes" : ["padding-top", "margin-left", "margin-right", "single-line-title-lbl", "text-center", "touch-disabled"],
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
				"classes" : ["hseparator", "touch-disabled"]
			}, {
				"apiName" : "View",
				"classes" : ["auto-height"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["left", "margin-top", "margin-bottom", "width-50", "auto-height", "vgroup"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["large-icon", "primary-color", "touch-disabled", "accessibility-disabled"],
								"properties" : {
									"icon" : "pharmacies"
								}
							}, {
								"apiName" : "Label",
								"classes" : ["padding-top", "margin-left", "margin-right", "single-line-title-lbl", "text-center", "touch-disabled"],
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
						"classes" : ["right", "margin-top", "margin-bottom", "width-50", "auto-height", "vgroup"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["large-icon", "primary-color", "touch-disabled", "accessibility-disabled"],
								"properties" : {
									"icon" : "transfer"
								}
							}, {
								"apiName" : "Label",
								"classes" : ["padding-top", "margin-left", "margin-right", "single-line-title-lbl", "text-center", "touch-disabled"],
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
				"classes" : ["hseparator", "touch-disabled"]
			}, {
				"apiName" : "View",
				"classes" : ["auto-height"],
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["left", "margin-top", "margin-bottom", "width-50", "auto-height", "vgroup"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["large-icon", "primary-color", "touch-disabled", "accessibility-disabled"],
								"properties" : {
									"icon" : "doctors"
								}
							}, {
								"apiName" : "Label",
								"classes" : ["padding-top", "margin-left", "margin-right", "single-line-title-lbl", "text-center", "touch-disabled"],
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
						"classes" : ["right", "margin-top", "margin-bottom", "width-50", "auto-height", "vgroup"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["large-icon", "primary-color", "touch-disabled", "accessibility-disabled"],
								"properties" : {
									"icon" : "account"
								}
							}, {
								"apiName" : "Label",
								"classes" : ["padding-top", "margin-left", "margin-right", "single-line-title-lbl", "text-center", "touch-disabled"],
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
				"classes" : ["hseparator", "touch-disabled"]
			}]
		}]
	}, {
		"apiName" : "View",
		"classes" : ["vseparator", "touch-disabled"]
	}]
};
