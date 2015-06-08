module.exports = {
	"data" : {
		"config" : {
			"navigator" : "hamburger",
			"left_drawer_width" : 270,
			"date_format" : "MM/DD/YYYY",
			"date_time_format" : "MM/DD/YYYY hh:mm a",
			"prescription_auto_hide_at" : 60,
			"prescription_tooltip_reminder_at" : 5,
			"prescription_critical_reminder_at" : 3,
			"rx_number" : {
				"prefix" : "Rx# ",
				"format" : " (xxxx-xxxxxxx)",
				"length" : 12,
				"validator" : "^[0-9]{4}-[0-9]{7}$",
				"formatters" : [{
					"pattern" : "\\D",
					"modifiters" : "g",
					"value" : ""
				}, {
					"pattern" : "(\\d{4})(\\d)",
					"modifiters" : "",
					"value" : "$1-$2"
				}]
			},
			"support" : {
				"call" : "1234567890",
				"email" : "support@mscripts.com"
			}
		},
		"tss" : {
			"Window" : {
				"barColor" : "#F7941E",
				"statusBarColor" : "#CC7312",
				"titleAttributes" : {
					"font" : {
						"fontFamily" : "medium",
						"fontSize" : 17
					},
					"color" : "#FFFFFF"
				},
				"navTintColor" : "#FFFFFF",
				"backgroundColor" : "#FFFFFF"
			},
			"Label" : {
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"textAlign" : "left",
				"color" : "#000000"
			},
			"Button" : {
				"height" : 50,
				"font" : {
					"fontFamily" : "medium ",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#FFFFFF",
				"selectedColor" : "#F7941E",
				"backgroundColor" : "#F7941E",
				"backgroundSelectedColor" : "#FFFFFF",
				"borderColor" : "#F7941E",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			"TextField" : {
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"textAlign" : "left",
				"color" : "#808285",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808083",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			"ListView" : {
				"separatorColor" : "#D3D4D3",
				"backgroundColor" : "#FFFFFF"
			},
			"ListView[platform=ios]" : {
				"separatorInsets" : {
					"top" : 0,
					"bottom" : 0,
					"left" : 0,
					"right" : 0
				}
			},
			"TableView" : {
				"separatorColor" : "#D3D4D3",
				"backgroundColor" : "#FFFFFF"
			},
			"TableView[platform=ios]" : {
				"separatorInsets" : {
					"top" : 0,
					"bottom" : 0,
					"left" : 0,
					"right" : 0
				}
			},
			"ListItem" : {
				"backgroundColor" : "#FFFFFF",
				"selectedBackgroundColor" : "#D3D4D3",
				"selectionAsOverlay" : true
			},
			"TableViewRow" : {
				"backgroundColor" : "#FFFFFF",
				"selectedBackgroundColor" : "#D3D4D3",
				"selectionAsOverlay" : true
			},
			".margin-top" : {
				"top" : 12
			},
			".margin-bottom" : {
				"bottom" : 12
			},
			".margin-left" : {
				"left" : 12
			},
			".margin-right" : {
				"right" : 12
			},
			".between-margin-left" : {
				"left" : 12
			},
			".between-margin-right" : {
				"right" : 12
			},
			".primary-btn" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"font" : {
					"fontFamily" : "medium ",
					"fontSize" : 17
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#F7941E",
				"backgroundSelectedColor" : "#F7941E",
				"borderColor" : "#F7941E"
			},
			".primary-btn-small" : {
				"width" : "48%",
				"height" : 50,
				"font" : {
					"fontFamily" : "medium ",
					"fontSize" : 17
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#F7941E",
				"backgroundSelectedColor" : "#F7941E",
				"borderColor" : "#F7941E"
			},
			".secondary-btn" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#F7941E",
				"selectedColor" : "#F7941E",
				"backgroundColor" : "#FFFFFF",
				"backgroundSelectedColor" : "#FFFFFF",
				"borderColor" : "#F7941E"
			},
			".secondary-btn-small" : {
				"width" : "48%",
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#F7941E",
				"selectedColor" : "#F7941E",
				"backgroundColor" : "#FFFFFF",
				"backgroundSelectedColor" : "#FFFFFF",
				"borderColor" : "#F7941E"
			},
			".thirriary-btn" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#599DFF",
				"selectedColor" : "#599DFF",
				"backgroundColor" : "#FFFFFF",
				"backgroundSelectedColor" : "#FFFFFF",
				"borderColor" : "transparent"
			},
			".thirriary-btn-small" : {
				"width" : "48%",
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#599DFF",
				"selectedColor" : "#599DFF",
				"backgroundColor" : "#FFFFFF",
				"backgroundSelectedColor" : "#FFFFFF",
				"borderColor" : "transparent"
			},
			".btn-view" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent"
			},
			".btn-left-icon" : {
				"left" : 0,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#599DFF",
				"touchEnabled" : false,
				"accessibilityHidden" : true
			},
			".btn-lbl-with-licon" : {
				"left" : 36,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"touchEnabled" : false
			},
			".btn-right-icon" : {
				"right" : 0,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#599DFF",
				"touchEnabled" : false,
				"accessibilityHidden" : true
			},
			".btn-lbl-with-ricon" : {
				"left" : 0,
				"right" : 36,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"touchEnabled" : false
			},
			".nav-btn" : {
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "transparent",
				"backgroundSelectedColor" : "transparent",
				"borderColor" : "transparent"
			},
			".nav-icon-btn" : {
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "transparent",
				"backgroundSelectedColor" : "transparent",
				"borderColor" : "transparent"
			},
			".info-view-30" : {
				"left" : 0,
				"width" : "30%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".info-view-35" : {
				"left" : 0,
				"width" : "35%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".info-view-title" : {
				"left" : 4,
				"right" : 4,
				"height" : 17,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 12
				},
				"color" : "#6d6e71",
				"textAlign" : "center",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".info-btn" : {
				"top" : 8,
				"left" : 4,
				"right" : 4,
				"height" : 30,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 12
				},
				"color" : "#000000",
				"selectedColor" : "#000000",
				"backgroundColor" : "#EEEEF3",
				"backgroundSelectedColor" : "#EEEEF3",
				"borderColor" : "#EEEEF3",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".info-negative-btn" : {
				"top" : 8,
				"left" : 4,
				"right" : 4,
				"height" : 30,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 12
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#ED1C24",
				"backgroundSelectedColor" : "#ED1C24",
				"borderColor" : "#ED1C24",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".swt[platform=ios]" : {
				"width" : 56,
				"height" : 36,
				"tintColor" : "#A7A7A7",
				"onTintColor" : "#38E780",
				"backgroundColor" : "#A7A7A7",
				"borderRadius" : 16
			},
			".swt[platform=android]" : {
				"width" : 56,
				"height" : 36,
				"trackTintColorOn" : "#38E780",
				"trackTintColorOff" : "#BFA7A7A7",
				"thumbTintColorOn" : "#BF38E780",
				"thumbTintColorOff" : "#A7A7A7"
			},
			".dropdown" : {
				"left" : 12,
				"right" : 12,
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"color" : "#000000",
				"optionPadding" : {
					"top" : 12,
					"bottom" : 12,
					"left" : 12,
					"right" : 12
				},
				"paddingLeft" : 12,
				"paddingRight" : 46,
				"iconPaddingRight" : 12,
				"hintTextColor" : "#C4C4C4",
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"iconColor" : "#D4D4D4",
				"selectedIconColor" : "#D4D4D4",
				"toolbarDict" : {
					"height" : 40,
					"backgroundColor" : "transparent"
				},
				"leftButtonDict" : {
					"left" : 12,
					"color" : "#000000",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightButtonDict" : {
					"left" : 12,
					"color" : "#000000",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"borderColor" : "#D4D4D4",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".txt" : {
				"left" : 12,
				"right" : 12,
				"height" : 50,
				"paddingLeft" : 8,
				"paddingRight" : 8,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"buttonFont" : {
					"fontFamily" : "bold",
					"fontSize" : 12
				},
				"leftIconDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightIconDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"leftButtonDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightButtonDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808083",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".txt-small" : {
				"width" : "48%",
				"height" : 50,
				"paddingLeft" : 8,
				"paddingRight" : 8,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"buttonFont" : {
					"fontFamily" : "bold",
					"fontSize" : 12
				},
				"leftIconDict" : {
					"color" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightIconDict" : {
					"color" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"leftButtonDict" : {
					"color" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightButtonDict" : {
					"color" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808083",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".search-bar" : {
				"width" : "fill",
				"backgroundColor" : "#EEEEF3"
			},
			".search-txt" : {
				"top" : 8,
				"bottom" : 8,
				"left" : 8,
				"right" : 8,
				"paddingLeft" : 8,
				"paddingRight" : 8,
				"height" : 30,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"buttonFont" : {
					"fontFamily" : "bold",
					"fontSize" : 12
				},
				"leftIconDict" : {
					"color" : "#5b5b5b",
					"selectedColor" : "#5b5b5b",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"leftIconAccessibility" : {
					"accessibilityHidden" : true
				},
				"rightIconDict" : {
					"color" : "#5b5b5b",
					"selectedColor" : "#5b5b5b",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightButtonDict" : {
					"color" : "#5b5b5b",
					"selectedColor" : "#5b5b5b",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".txta" : {
				"left" : 12,
				"right" : 12,
				"height" : 144,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"color" : "#808285",
				"textAlign" : "left",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808083",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".form-group" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808083",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".form-vgroup" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"layout" : "vertical",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808083",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".form-hgroup" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"layout" : "horizontal",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808083",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			".form-txt" : {
				"width" : "fill",
				"height" : 50,
				"paddingLeft" : 8,
				"paddingRight" : 8,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"buttonFont" : {
					"fontFamily" : "bold",
					"fontSize" : 12
				},
				"leftIconDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightIconDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"leftButtonDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightButtonDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent"
			},
			".form-txt-small" : {
				"width" : "50%",
				"height" : 50,
				"paddingLeft" : 8,
				"paddingRight" : 8,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"buttonFont" : {
					"fontFamily" : "bold",
					"fontSize" : 12
				},
				"leftIconDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightIconDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"leftButtonDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightButtonDict" : {
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent"
			},
			".form-dropdown" : {
				"width" : "fill",
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"color" : "#1a1a1a",
				"optionPadding" : {
					"top" : 12,
					"bottom" : 12,
					"left" : 12,
					"right" : 12
				},
				"paddingLeft" : 12,
				"paddingRight" : 46,
				"iconPaddingRight" : 12,
				"hintTextColor" : "#C4C4C4",
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"iconColor" : "#808184",
				"selectedIconColor" : "#808184",
				"toolbarDict" : {
					"height" : 40,
					"backgroundColor" : "#6D6E70"
				},
				"leftButtonDict" : {
					"left" : 12,
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightButtonDict" : {
					"left" : 12,
					"color" : "#808184",
					"selectedColor" : "#808184",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"borderColor" : "transparent"
			},
			".menu-view" : {
				"separatorColor" : "transparent",
				"backgroundColor" : "#F7941E"
			},
			".menu-row" : {
				"backgroundColor" : "transparent",
				"selectedBackgroundColor" : "#50D3D4D3"
			},
			".menu-item-view" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"touchEnabled" : false
			},
			".menu-item-icon" : {
				"left" : 0,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#FFFFFF",
				"touchEnabled" : false,
				"accessibilityHidden" : true
			},
			".menu-item-lbl" : {
				"left" : 36,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#FFFFFF",
				"touchEnabled" : false
			},
			".container-view" : {
				"width" : "100%",
				"height" : "auto"
			},
			".swipe-view" : {
				"right" : 48,
				"width" : "auto",
				"height" : "auto"
			},
			".swipe-content-view" : {
				"left" : 48,
				"width" : "auto",
				"height" : "auto",
				"layout" : "horizontal"
			},
			".swipe-view-btn-40" : {
				"left" : 0,
				"width" : "40%",
				"height" : 65,
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#808285",
				"backgroundSelectedColor" : "#808285",
				"borderColor" : "transparent"
			},
			".swipe-view-btn-30" : {
				"left" : 0,
				"width" : "30%",
				"height" : 65,
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#808285",
				"backgroundSelectedColor" : "#808285",
				"borderColor" : "transparent"
			},
			".swipe-view-positive-btn-40" : {
				"left" : 0,
				"width" : "40%",
				"height" : 65,
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#009245",
				"backgroundSelectedColor" : "#009245",
				"borderColor" : "transparent"
			},
			".swipe-view-positive-btn-30" : {
				"left" : 0,
				"width" : "30%",
				"height" : 65,
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#009245",
				"backgroundSelectedColor" : "#009245",
				"borderColor" : "transparent"
			},
			".swipe-view-negative-btn-40" : {
				"left" : 0,
				"width" : "40%",
				"height" : 65,
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#ED1C24",
				"backgroundSelectedColor" : "#ED1C24",
				"borderColor" : "transparent"
			},
			".swipe-view-negative-btn-30" : {
				"left" : 0,
				"width" : "30%",
				"height" : 65,
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#ED1C24",
				"backgroundSelectedColor" : "#ED1C24",
				"borderColor" : "transparent"
			},
			".content-view" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 12,
				"height" : "auto"
			},
			".content-view-vgroup" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-view-with-rswt" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 80,
				"height" : "auto"
			},
			".content-view-vgroup-with-rswt" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 80,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-child-icon" : {
				"right" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 12
				},
				"color" : "#808082",
				"accessibilityHidden" : true
			},
			".content-down-icon" : {
				"right" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 12
				},
				"color" : "#808082",
				"accessibilityHidden" : true
			},
			".content-view-with-child" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 36,
				"height" : "auto"
			},
			".content-view-vgroup-with-child" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 36,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-left-icon" : {
				"left" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#F7941E",
				"accessibilityHidden" : true
			},
			".content-inactive-left-icon" : {
				"left" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#A6A8AB",
				"accessibilityHidden" : true
			},
			".content-positive-left-icon" : {
				"left" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#009344",
				"accessibilityHidden" : true
			},
			".content-negative-left-icon" : {
				"left" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#ED1C24",
				"accessibilityHidden" : true
			},
			".content-tentative-left-icon" : {
				"left" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#F7941E",
				"accessibilityHidden" : true
			},
			".content-view-with-licon" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 12,
				"height" : "auto"
			},
			".content-view-vgroup-with-licon" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 12,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-view-with-licon-child" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 36,
				"height" : "auto"
			},
			".content-view-vgroup-with-licon-child" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 36,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-right-icon" : {
				"right" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#F7941E",
				"accessibilityHidden" : true
			},
			".content-negative-right-icon" : {
				"left" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#ED1C24",
				"accessibilityHidden" : true
			},
			".content-help-right-icon" : {
				"left" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#599DFF",
				"accessibilityHidden" : true
			},
			".content-view-with-ricon" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 48,
				"height" : "auto"
			},
			".content-view-vgroup-with-ricon" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 48,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-view-with-lricon" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 48,
				"height" : "auto"
			},
			".content-view-vgroup-with-lricon" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 48,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-left-image" : {
				"left" : 12,
				"width" : 120,
				"height" : 90
			},
			".content-view-with-limage" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 144,
				"right" : 12,
				"height" : "auto"
			},
			".content-view-vgroup-with-limage" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 144,
				"right" : 12,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-view-with-limage-child" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 144,
				"right" : 36,
				"height" : "auto"
			},
			".content-view-vgroup-with-limage-child" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 144,
				"right" : 36,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-left-image-large" : {
				"left" : 12,
				"width" : 240,
				"height" : 180
			},
			".content-view-with-limage-large" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 252,
				"right" : 12,
				"height" : "auto"
			},
			".content-view-vgroup-with-limage-large" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 252,
				"right" : 12,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-left-color-box" : {
				"top" : 0,
				"left" : 12,
				"width" : 24,
				"height" : "auto"
			},
			".content-view-with-lcolor-box" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 12,
				"height" : "auto"
			},
			".content-view-vgroup-with-lcolor-box" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 12,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-view-with-lcolor-box-child" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 36,
				"height" : "auto"
			},
			".content-view-vgroup-with-lcolor-box-child" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 48,
				"right" : 36,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-view-progressbar" : {
				"top" : 12,
				"width" : "fill",
				"height" : 10
			},
			".content-view-progressbar-unfill" : {
				"width" : "fill",
				"height" : "fill",
				"backgroundColor" : "#C4C4C4"
			},
			".content-view-progressbar-fill" : {
				"top" : 1,
				"bottom" : 1,
				"left" : 1,
				"right" : 1,
				"backgroundColor" : "#1C75BB"
			},
			".content-lbl" : {
				"left" : 0,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-lbl-wrap" : {
				"left" : 0,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-lbl-attributed" : {
				"left" : 0,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"secondaryFont" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#000000",
				"secondaryColor" : "#0095FF",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-lbl-attributed-wrap" : {
				"left" : 0,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"secondaryFont" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#000000",
				"secondaryColor" : "#0095FF",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-title" : {
				"left" : 0,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-title-wrap" : {
				"left" : 0,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-subtitle" : {
				"top" : 12,
				"left" : 0,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#797979",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-subtitle-wrap" : {
				"top" : 12,
				"left" : 0,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-subtitle-view" : {
				"top" : 12,
				"width" : "auto",
				"height" : "auto",
				"layout" : "horizontal"
			},
			".content-subtitle-positive-icon" : {
				"left" : 0,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 12
				},
				"color" : "#009344",
				"accessibilityHidden" : true
			},
			".content-subtitle-positive-icon-description" : {
				"left" : 0,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-subtitle-positive-icon-description-wrap" : {
				"left" : 0,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-attributed" : {
				"top" : 12,
				"left" : 0,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"secondaryFont" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"secondaryColor" : "#0095ff",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-attributed-wrap" : {
				"top" : 12,
				"left" : 0,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"secondaryFont" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"secondaryColor" : "#0095ff",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-master-view-75" : {
				"left" : 0,
				"width" : "75%",
				"layout" : "vertical"
			},
			".content-detail-view-25" : {
				"right" : 0,
				"width" : "25%",
				"layout" : "vertical"
			},
			".content-master-view-70" : {
				"left" : 0,
				"width" : "70%",
				"layout" : "vertical"
			},
			".content-detail-view-30" : {
				"right" : 0,
				"width" : "30%",
				"layout" : "vertical"
			},
			".content-master-view-60" : {
				"left" : 0,
				"width" : "60%",
				"layout" : "vertical"
			},
			".content-detail-view-40" : {
				"right" : 0,
				"width" : "40%",
				"layout" : "vertical"
			},
			".content-master-view-50" : {
				"left" : 0,
				"width" : "50%",
				"layout" : "vertical"
			},
			".content-detail-view-50" : {
				"right" : 0,
				"width" : "50%",
				"layout" : "vertical"
			},
			".content-detail-title" : {
				"left" : 16,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-subtitle" : {
				"top" : 12,
				"left" : 16,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-positive-title" : {
				"left" : 16,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-positive-subtitle" : {
				"top" : 12,
				"left" : 16,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-negative-title" : {
				"left" : 16,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-negative-subtitle" : {
				"top" : 12,
				"left" : 16,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-icon-view" : {
				"left" : 16,
				"width" : "auto",
				"height" : "auto",
				"layout" : "horizontal"
			},
			".content-detail-positive-icon" : {
				"left" : 0,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 12
				},
				"color" : "#009344",
				"accessibilityHidden" : true
			},
			".content-detail-positive-icon-description" : {
				"left" : 4,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#797979",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-detail-nagative-icon" : {
				"left" : 0,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 12
				},
				"color" : "#ED1C24",
				"accessibilityHidden" : true
			},
			".content-detail-negative-icon-description" : {
				"left" : 4,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#ED1C24",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-subject" : {
				"left" : 0,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-subject-wrap" : {
				"left" : 0,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-header-view" : {
				"width" : "fill",
				"height" : 40,
				"backgroundColor" : "#EEEEF3"
			},
			".content-header-lbl" : {
				"left" : 12,
				"right" : 12,
				"height" : 22,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 15
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-header-right-icon-btn" : {
				"right" : 4,
				"width" : 40,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 24
				},
				"color" : "#599cff",
				"selectedColor" : "#599cff",
				"backgroundColor" : "transparent",
				"backgroundSelectedColor" : "transparent",
				"borderColor" : "transparent",
				"accessibilityHidden" : true
			},
			".content-header-lbl-with-ricon-btn" : {
				"left" : 12,
				"right" : 48,
				"height" : 22,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 15
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-header-view-wrap" : {
				"width" : "fill",
				"height" : "auto",
				"backgroundColor" : "#EEEEF3"
			},
			".content-header-lbl-wrap" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-header-attributed-wrap" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"secondaryFont" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"secondaryColor" : "#0095ff",
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-group" : {
				"width" : "fill",
				"height" : "auto",
				"layout" : "horizontal"
			},
			".content-group-prompt" : {
				"left" : 0,
				"height" : "auto",
				"width" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-group-reply" : {
				"left" : 4,
				"height" : "auto",
				"width" : "auto",
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-group-reply-link" : {
				"left" : 4,
				"height" : "auto",
				"width" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#0095ff",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-group-reply-with-margin" : {
				"left" : 16,
				"height" : "auto",
				"width" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".h-divider" : {
				"width" : "fill",
				"height" : 1,
				"backgroundColor" : "#D4D4D4"
			},
			".v-divider" : {
				"width" : 1,
				"height" : "fill",
				"backgroundColor" : "#D4D4D4"
			},
			".option-divider-view" : {
				"left" : 12,
				"right" : 12,
				"height" : 50
			},
			".option-divider-line" : {
				"width" : "fill",
				"height" : 1,
				"backgroundColor" : "#D4D4D4"
			},
			".option-divider-lbl" : {
				"width" : 52,
				"height" : "fill",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000000",
				"backgroundColor" : "#FFFFFF"
			},
			".tooltip-attributed-lbl-wrap" : {
				"left" : 12,
				"right" : 12,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"secondaryFont" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"color" : "#FFFFFF",
				"secondaryColor" : "#FFFFFF",
				"textAlign" : "center",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".tooltip-down" : {
				"direction" : "down",
				"arrowDict" : {
					"color" : "#808184"
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"labelDict" : {
					"paddingTop" : 12,
					"paddingBottom" : 12,
					"left" : 12,
					"right" : 12,
					"textAlign" : "center",
					"color" : "#FFFFFF"
				},
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#FFFFFF",
				"backgroundColor" : "#6D6E70"
			},
			".negative-tooltip-left" : {
				"direction" : "left",
				"arrowDict" : {
					"color" : "#ED1C24"
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"labelDict" : {
					"paddingTop" : 12,
					"paddingBottom" : 12,
					"left" : 12,
					"right" : 12,
					"textAlign" : "center",
					"color" : "#FFFFFF"
				},
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#FFFFFF",
				"backgroundColor" : "#ED1C24"
			},
			".primary-icon-large" : {
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 34
				},
				"color" : "#F7941E"
			},
			".lbl-with-rswt" : {
				"left" : 12,
				"right" : 80,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false,
				"touchEnabled" : false
			},
			".lbl" : {
				"left" : 12,
				"right" : 12,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".lbl-wrap" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".lbl-centered" : {
				"left" : 12,
				"right" : 12,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "center",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".lbl-centered-wrap" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "center",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".attributed" : {
				"left" : 12,
				"right" : 12,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"secondaryFont" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"secondaryColor" : "#0095ff",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".attributed-wrap" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"secondaryFont" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"secondaryColor" : "#0095ff",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".attributed-centered" : {
				"left" : 12,
				"right" : 12,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"secondaryFont" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"secondaryColor" : "#0095ff",
				"textAlign" : "center",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".attributed-centered-wrap" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"secondaryFont" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"secondaryColor" : "#0095ff",
				"textAlign" : "center",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".link" : {
				"left" : 12,
				"right" : 12,
				"height" : 19,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"color" : "#0095ff",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".link-wrap" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"color" : "#0095ff",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".title" : {
				"left" : 12,
				"right" : 12,
				"height" : 19,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".title-wrap" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".title-centered" : {
				"left" : 12,
				"right" : 12,
				"height" : 19,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "center",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".title-centered-wrap" : {
				"left" : 12,
				"right" : 12,
				"height" : "auto",
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "center",
				"ellipsize" : false,
				"wordWrap" : true
			}
		}
	}
};
