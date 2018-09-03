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
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titlePrescriptions"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-prescription"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
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
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titleReminders"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-reminder"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
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
				"classes" : ["top", "bottom", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titleRefill"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-refill-now"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
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
				"classes" : ["top", "bottom", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titleStores"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-pharmacy"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
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
				"classes" : ["top", "bottom", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titleServices"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-services"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
								"properties" : {
									"textid" : "titleServices"
								}
							}]
						}]
					}]
				}],
				"navigation" : {
					"url" : "https://www.gianteagle.com/Pharmacy/Services"
				}
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titleTransfer"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-transfer"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
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
				"classes" : ["top", "bottom", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titleAccount"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-account"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
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
				"classes" : ["top", "bottom", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titleFamilyAccounts"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-users"]
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
				"classes" : ["top", "bottom", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titleInsurance"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-reward"]
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
				"feature_name" : "is_insurancecard_enabled",
				"navigation" : {
					"ctrl" : "insurance",
					"titleid" : "titleInsuranceCard"
				}
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "h-divider-light"]
			}, {
				"apiName" : "View",
				"classes" : ["top", "bottom", "auto-height", "vgroup", "hwrap-disabled", "accessibility-actionablelements"],
				"properties" : {
					"textid" : "titleDoctors"
				},
				"children" : [{
					"items" : [{
						"apiName" : "View",
						"classes" : ["top", "bottom", "auto-height", "hgroup", "hwrap-disabled", "accessibility-disabled", "touch-disabled"],
						"children" : [{
							"items" : [{
								"apiName" : "Label",
								"classes" : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left", "i4", "primary-fg-color", "touch-disabled", "icon-thick-doctor"]
							}, {
								"apiName" : "Label",
								"classes" : ["margin-left-medium", "h4", "fg-color", "touch-disabled"],
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
				"classes" : ["top", "bottom", "h-divider-light"]
			}]
		}]
	}]
};
