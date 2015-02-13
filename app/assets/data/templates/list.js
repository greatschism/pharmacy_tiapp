module.exports = [{
	"apiName" : "TableView",
	"children" : [{
		"addChild" : "setFooterView",
		"items" : [{
			"apiName" : "View",
			"classes" : ["footer-view-break"]
		}]
	}, {
		"addChild" : "setData",
		"asArray" : true,
		"items" : [{
			"apiName" : "TableViewRow",
			"children" : [{
				"items" : [{
					"apiName" : "View",
					"classes" : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					"children" : [{
						"items" : [{
							"apiName" : "Label",
							"classes" : ["left", "large-icon", "primary-color", "touch-disabled"],
							"properties" : {
								"icon" : "prescriptions"
							}
						}, {
							"apiName" : "Label",
							"classes" : ["padding-left", "list-item-title-lbl", "touch-disabled"],
							"properties" : {
								"textid" : "strPrescriptions"
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
					"classes" : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					"children" : [{
						"items" : [{
							"apiName" : "Label",
							"classes" : ["left", "large-icon", "primary-color", "touch-disabled"],
							"properties" : {
								"icon" : "refill_camera"
							}
						}, {
							"apiName" : "Label",
							"classes" : ["padding-left", "list-item-title-lbl", "touch-disabled"],
							"properties" : {
								"textid" : "titleRefillViaCamera"
							}
						}]
					}]
				}]
			}],
			"navigation" : {
				"action" : "refillViaCamera",
				"ctrl" : "refill"
			}
		}, {
			"apiName" : "TableViewRow",
			"children" : [{
				"items" : [{
					"apiName" : "View",
					"classes" : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					"children" : [{
						"items" : [{
							"apiName" : "Label",
							"classes" : ["left", "large-icon", "primary-color", "touch-disabled"],
							"properties" : {
								"icon" : "pharmacies"
							}
						}, {
							"apiName" : "Label",
							"classes" : ["padding-left", "list-item-title-lbl", "touch-disabled"],
							"properties" : {
								"textid" : "titleStores"
							}
						}]
					}]
				}]
			}],
			"navigation" : {
				"ctrl" : "stores"
			}
		}, {
			"apiName" : "TableViewRow",
			"children" : [{
				"items" : [{
					"apiName" : "View",
					"classes" : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					"children" : [{
						"items" : [{
							"apiName" : "Label",
							"classes" : ["left", "large-icon", "primary-color", "touch-disabled"],
							"properties" : {
								"icon" : "transfer"
							}
						}, {
							"apiName" : "Label",
							"classes" : ["padding-left", "list-item-title-lbl", "touch-disabled"],
							"properties" : {
								"textid" : "titleTransferPrescription"
							}
						}]
					}]
				}]
			}],
			"navigation" : {
				"action" : "transferPrescription"
			}
		}, {
			"apiName" : "TableViewRow",
			"children" : [{
				"items" : [{
					"apiName" : "View",
					"classes" : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					"children" : [{
						"items" : [{
							"apiName" : "Label",
							"classes" : ["left", "large-icon", "primary-color", "touch-disabled"],
							"properties" : {
								"icon" : "doctors"
							}
						}, {
							"apiName" : "Label",
							"classes" : ["padding-left", "list-item-title-lbl", "touch-disabled"],
							"properties" : {
								"textid" : "titleDoctors"
							}
						}]
					}]
				}]
			}],
			"navigation" : {
				"ctrl" : "doctors"
			}
		}, {
			"apiName" : "TableViewRow",
			"children" : [{
				"items" : [{
					"apiName" : "View",
					"classes" : ["list-item-view", "hgroup", "no-hwrap", "touch-disabled"],
					"children" : [{
						"items" : [{
							"apiName" : "Label",
							"classes" : ["left", "large-icon", "primary-color", "touch-disabled"],
							"properties" : {
								"icon" : "account"
							}
						}, {
							"apiName" : "Label",
							"classes" : ["padding-left", "list-item-title-lbl", "touch-disabled"],
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
}]; 