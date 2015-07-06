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
		"windowSoftInputMode" : "Ti.UI.Android.SOFT_INPUT_STATE_HIDDEN"
	},
	"TableView" : {
		"footerDividersEnabled" : true
	},
	"ListView" : {
		"footerDividersEnabled" : true
	},
	"TableView[platform=android]" : {
		"filterAttribute" : "title"
	},
	"TableView[platform=ios]" : {
		"filterAttribute" : "filterableText"
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
	".row-selection-disabled" : {
		"selectedBackgroundColor" : "transparent"
	},
	".selection-disabled" : {
		"backgroundSelectedColor" : null
	},
	".touch-disabled" : {
		"touchEnabled" : false
	},
	".accessibility-disabled" : {
		"accessibilityHidden" : true
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
	".loader-embedded" : {
		"indicatorDict" : {
			"accessibilityLabel" : "Alloy.Globals.strings.msgPleaseWait"
		}
	},
	".swt[platform=android]" : {
		"trackShape" : "Ti.App.Android.R.drawable.switch_track",
		"thumbShape" : "Ti.App.Android.R.drawable.switch_thumb",
		"style" : "Ti.UI.Android.SWITCH_STYLE_SWITCH"
	},
	".content-right-swt[platform=android]" : {
		"trackShape" : "Ti.App.Android.R.drawable.switch_track",
		"thumbShape" : "Ti.App.Android.R.drawable.switch_thumb",
		"style" : "Ti.UI.Android.SWITCH_STYLE_SWITCH"
	},
	".content-child-icon" : {
		"text" : "Alloy.CFG.icons.thin_arrow_right"
	},
	".content-up-icon" : {
		"text" : "Alloy.CFG.icons.thin_arrow_up"
	},
	".content-down-icon" : {
		"text" : "Alloy.CFG.icons.thin_arrow_down"
	},
	".optionpicker" : {
		"iconText" : "Alloy.CFG.icons.spot",
		"selectedIconText" : "Alloy.CFG.icons.thin_filled_success"
	},
	".search-txt" : {
		"leftIconText" : "Alloy.CFG.icons.search",
		"clearIconText" : "Alloy.CFG.icons.cancel"
	},
	".txt-ricon-help" : {
		"rightIconText" : "Alloy.CFG.icons.help",
		"rightIconAccessibility" : {
			"accessibilityLabel" : "Alloy.Globals.strings.accessibilityLblHelp"
		}
	},
	".tooltip-down" : {
		"direction" : "down",
		"iconText" : "Alloy.CFG.icons.filled_arrow_down"
	},
	".tooltip-left" : {
		"direction" : "left",
		"iconText" : "Alloy.CFG.icons.filled_arrow_left"
	}
};
