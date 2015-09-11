module.exports = {
	"Theme" : {
		"version" : "Alloy.TSS.Theme.version"
	},
	"Window[formFactor=handheld]" : {
		"orientationModes" : ["Ti.UI.PORTRAIT"]
	},
	"Window[formFactor=tablet]" : {
		"orientationModes" : ["Ti.UI.PORTRAIT", "Ti.UI.UPSIDE_PORTRAIT"]
	},
	"Window[platform=android]" : {
		"windowSoftInputMode" : "Ti.UI.Android.SOFT_INPUT_STATE_HIDDEN | Ti.UI.Android.SOFT_INPUT_ADJUST_PAN"
	},
	"TableView" : {
		"footerDividersEnabled" : true,
		"filterAttribute" : "Alloy.Globals.filterAttribute"
	},
	"ListView" : {
		"footerDividersEnabled" : true
	},
	"TableViewRow" : {
		"height" : "Ti.UI.SIZE"
	},
	"ListItem" : {
		"height" : "Ti.UI.SIZE"
	},
	"Button[platform=ios]" : {
		"style" : "Ti.UI.iPhone.SystemButtonStyle.PLAIN"
	},
	"ImageView" : {
		"width" : "Ti.UI.SIZE",
		"height" : "Ti.UI.SIZE"
	},
	"ImageView[platform=ios]" : {
		"preventDefaultImage" : true
	},
	".top" : {
		"top" : 0
	},
	".bottom" : {
		"bottom" : 0
	},
	".left" : {
		"left" : 0
	},
	".right" : {
		"right" : 0
	},
	".auto-width" : {
		"width" : "Ti.UI.SIZE"
	},
	".auto-height" : {
		"height" : "Ti.UI.SIZE"
	},
	".fill-width" : {
		"width" : "Ti.UI.FILL"
	},
	".fill-height" : {
		"height" : "Ti.UI.FILL"
	},
	".width-100" : {
		"width" : "100%"
	},
	".height-100" : {
		"height" : "100%"
	},
	".vgroup" : {
		"layout" : "vertical"
	},
	".hgroup" : {
		"layout" : "horizontal"
	},
	".hgroup-no-wrap" : {
		"layout" : "horizontal",
		"horizontalWrap" : false
	},
	".show" : {
		"visible" : true
	},
	".hide" : {
		"visible" : false
	},
	".fade-in" : {
		"opacity" : 1
	},
	".fade-out" : {
		"opacity" : 0
	},
	".touch-disabled" : {
		"touchEnabled" : false
	},
	".accessibility-disabled" : {
		"accessibilityHidden" : true
	},
	".bubble-disabled" : {
		"bubbleParent" : false
	},
	".bubble-disabled-widget" : {
		"bubbleParent" : true
	},
	".background-disabled" : {
		"backgroundColor" : "transparent"
	},
	".table-separator-disabled" : {
		"separatorColor" : "transparent"
	},
	".row-selection-disabled" : {
		"selectedBackgroundColor" : "transparent"
	},
	".autocaps-sentences" : {
		"autocapitalization" : "Ti.UI.TEXT_AUTOCAPITALIZATION_SENTENCES"
	},
	".autocaps-words" : {
		"autocapitalization" : "Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS"
	},
	".keyboard-email" : {
		"keyboardType" : "Ti.UI.KEYBOARD_EMAIL"
	},
	".keyboard-number" : {
		"keyboardType" : "Ti.UI.KEYBOARD_NUMBER_PAD"
	},
	".keyboard-phone" : {
		"keyboardType" : "Ti.UI.KEYBOARD_PHONE_PAD"
	},
	".returnkey-previous" : {
		"returnKeyType" : "Ti.UI.RETURNKEY_PREVIOUS"
	},
	".returnkey-next" : {
		"returnKeyType" : "Ti.UI.RETURNKEY_NEXT"
	},
	".returnkey-done" : {
		"returnKeyType" : "Ti.UI.RETURNKEY_DONE"
	},
	".returnkey-search" : {
		"returnKeyType" : "Ti.UI.RETURNKEY_SEARCH"
	},
	".role-ignore" : {
		"role" : "ignore"
	},
	".role-right-nav-btn" : {
		"role" : "rightNavButton"
	},
	".role-content-view" : {
		"role" : "contentView"
	},
	".role-header-view" : {
		"role" : "headerView"
	},
	".role-footer-view" : {
		"role" : "footerView"
	},
	".role-master-view" : {
		"role" : "masterView"
	},
	".role-detail-view" : {
		"role" : "detailView"
	},
	".swt[platform=android]" : {
		"accessibilityLabelOn" : "Alloy.Globals.strings.accessibilityLblSwitchOn",
		"accessibilityLabelOff" : "Alloy.Globals.strings.accessibilityLblSwitchOff",
		"trackShape" : "Ti.App.Android.R.drawable.switch_track",
		"thumbShape" : "Ti.App.Android.R.drawable.switch_thumb",
		"style" : "Ti.UI.Android.SWITCH_STYLE_SWITCH"
	},
	".async-view" : {
		"indicatorDict" : {
			"accessibilityLabel" : "Alloy.Globals.strings.msgLoading"
		}
	},
	".loader-embedded" : {
		"width" : "Ti.UI.SIZE",
		"height" : "Ti.UI.SIZE",
		"backgroundColor" : "transparent",
		"indicatorDict" : {
			"top" : 12,
			"bottom" : 12,
			"accessibilityLabel" : "Alloy.Globals.strings.msgLoading"
		}
	},
	".loader-embedded-fill" : {
		"width" : "Ti.UI.FILL",
		"height" : "Ti.UI.FILL",
		"indicatorDict" : {
			"accessibilityLabel" : "Alloy.Globals.strings.msgLoading"
		}
	},
	".selection-disabled" : {
		"backgroundSelectedColor" : null
	},
	".optionpicker" : {
		"iconText" : "Alloy.CFG.icons.spot",
		"selectedIconText" : "Alloy.CFG.icons.thin_filled_success"
	},
	".dropdown" : {
		"iconText" : "Alloy.CFG.icons.thin_arrow_down",
		"selectedIconText" : "Alloy.CFG.icons.thin_filled_success"
	},
	".form-dropdown" : {
		"iconText" : "Alloy.CFG.icons.thin_arrow_down",
		"selectedIconText" : "Alloy.CFG.icons.thin_filled_success"
	},
	".form-dropdown-50" : {
		"iconText" : "Alloy.CFG.icons.thin_arrow_down",
		"selectedIconText" : "Alloy.CFG.icons.thin_filled_success"
	},
	".date" : {
		"title" : "Alloy.Globals.strings.dialogTitleDatePicker",
		"leftTitle" : "Alloy.Globals.strings.dialogBtnCancel",
		"rightTitle" : "Alloy.Globals.strings.dialogBtnOK",
		"format" : "Alloy.CFG.date_format",
		"formatLong" : "Alloy.CFG.date_format_long",
		"type" : "Ti.UI.PICKER_TYPE_DATE"
	},
	".time" : {
		"title" : "Alloy.Globals.strings.dialogTitleTimePicker",
		"leftTitle" : "Alloy.Globals.strings.dialogBtnCancel",
		"rightTitle" : "Alloy.Globals.strings.dialogBtnOK",
		"format" : "Alloy.CFG.time_format",
		"formatLong" : "Alloy.CFG.date_format_long",
		"type" : "Ti.UI.PICKER_TYPE_TIME"
	},
	".search-txt" : {
		"leftIconText" : "Alloy.CFG.icons.search",
		"clearIconText" : "Alloy.CFG.icons.filled_cancel"
	},
	".txt-ricon-help" : {
		"rightIconText" : "Alloy.CFG.icons.help",
		"rightIconAccessibility" : {
			"accessibilityLabel" : "Alloy.Globals.strings.iconAccessibilityLblHelp"
		}
	},
	".tooltip-unfilled-arrow-up" : {
		"arrowPadding" : 7,
		"direction" : "top",
		"iconText" : "Alloy.CFG.icons.tooltip_arrow_up"
	},
	".tooltip-arrow-up" : {
		"arrowPadding" : 8,
		"direction" : "top",
		"iconText" : "Alloy.CFG.icons.filled_arrow_up"
	},
	".tooltip-arrow-down" : {
		"arrowPadding" : 8,
		"direction" : "bottom",
		"iconText" : "Alloy.CFG.icons.filled_arrow_down"
	},
	".tooltip-arrow-left" : {
		"arrowPadding" : 8,
		"direction" : "left",
		"iconText" : "Alloy.CFG.icons.filled_arrow_left"
	},
	".tooltip-arrow-right" : {
		"arrowPadding" : 8,
		"direction" : "right",
		"iconText" : "Alloy.CFG.icons.filled_arrow_right"
	}
};
