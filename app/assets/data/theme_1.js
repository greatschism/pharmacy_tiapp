module.exports = {
	"data" : {
		"config" : {
			"navigator" : "hamburger",
			"left_drawer_width" : 270,
			"banner_max_width" : "100%",
			"banner_max_height" : 140,
			"prescription_auto_hide" : -60,
			"prescription_ready_for_refill" : 7,
			"prescription_pickup_reminder" : 3,
			"prescription_progress_x_hours" : 2,
			"prescription_progress_after_x_hours" : 60,
			"prescription_progress_before_x_hours" : 15,
			"prescription_refills_left_info_negative" : 1,
			"rx_number" : {
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
			},
			"location_timeout" : 900,
			"http_timeout" : 90,
			"iconNotations" : {
				"switch_on" : "0xE001",
				"switch_off" : "0xE002",
				"health_care" : "0xE003",
				"login" : "0xE004",
				"logout" : "0xE005"
			},
			"icons" : {
				"numeric_zero" : "0",
				"numeric_one" : "1",
				"numeric_two" : "2",
				"numeric_three" : "3",
				"numeric_four" : "4",
				"numeric_five" : "5",
				"numeric_six" : "6",
				"numeric_seven" : "7",
				"numeric_eight" : "8",
				"numeric_nine" : "9",
				"thin_pharmacy" : "c",
				"thick_pharmacy" : "C",
				"thin_prescription" : "a",
				"thick_prescription" : "A",
				"thin_doctor" : "e",
				"thick_doctor" : "E",
				"thin_refill" : "b",
				"thick_refill" : "B",
				"thin_transfer" : "d",
				"thick_transfer" : "D",
				"thin_reminder" : "f",
				"thick_reminder" : "F",
				"thin_coupon" : "g",
				"thick_coupon" : "G",
				"thin_account" : "h",
				"thick_account" : "H",
				"thin_feedback" : "i",
				"thick_feedback" : "I",
				"thin_notification" : "y",
				"thick_notification" : "Y",
				"thin_camera" : "$",
				"thick_camera" : "<",
				"thin_arrow_down" : "[",
				"thick_arrow_down" : "\"",
				"filled_arrow_down" : "%",
				"thin_arrow_up" : "^",
				"thick_arrow_up" : "|",
				"filled_arrow_up" : ")",
				"thin_arrow_left" : "]",
				"thick_arrow_left" : "#",
				"filled_arrow_left" : "'",
				"thin_arrow_right" : "?",
				"thick_arrow_right" : "u",
				"filled_arrow_right" : "(",
				"thick_location_pin" : "n",
				"thin_location_pin" : "V",
				"add" : ",",
				"unfilled_add" : "k",
				"filled_add" : "/",
				"thin_filled_success" : "+",
				"thin_unfilled_success" : "m",
				"thick_unfilled_success" : ";",
				"cancel" : "J",
				"filled_cancel" : "*",
				"remove" : "-",
				"filled_remove" : "}",
				"unfilled_remove" : ":",
				"star" : "P",
				"filled_star" : "p",
				"refill_camera" : "&",
				"pills" : "N",
				"reward" : ">",
				"hamburger" : "R",
				"back" : "!",
				"options_menu" : "U",
				"sort" : "X",
				"home" : "s",
				"search" : "Q",
				"refresh" : ".",
				"help" : "`",
				"checkbox" : "j",
				"close" : "v",
				"phone" : "q",
				"print" : "z",
				"alarm" : "O",
				"clock" : "L",
				"calendar" : "M",
				"map" : "t",
				"direction" : "l",
				"spot" : "x",
				"slide" : "_",
				"list" : "r",
				"rx_pin" : "T",
				"badge_star" : "K",
				"info" : "Z",
				"vitamin" : "o",
				"tip" : "=",
				"edit" : "{",
				"user" : "W",
				"users" : "w",
				"error" : "@",
				"injection" : "S"
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
				"keepSectionsWithNoRowsInSearch" : false,
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
			".edge-margin-left" : {
				"left" : 12
			},
			".edge-margin-right" : {
				"right" : 12
			},
			".map-view" : {
				"animate" : true,
				"regionFit" : true,
				"userLocation" : true
			},
			".primary-icon-btn" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 34
				},
				"color" : "#F7941E",
				"selectedColor" : "#F7941E",
				"backgroundColor" : "#FFFFFF",
				"backgroundSelectedColor" : "#FFFFFF"
			},
			".inactive-icon-btn" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 34
				},
				"color" : "#A6A8AB",
				"selectedColor" : "#A6A8AB",
				"backgroundColor" : "#FFFFFF",
				"backgroundSelectedColor" : "#FFFFFF"
			},
			".secondary-btn-view" : {
				"left" : 16,
				"right" : 16,
				"height" : "auto",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#F7941E",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			".secondary-btn-lbl" : {
				"top" : 16,
				"bottom" : 16,
				"left" : 8,
				"right" : 8,
				"height" : "auto",
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#F7941E",
				"textAlign" : "center",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".primary-btn" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#F7941E",
				"backgroundSelectedColor" : "#F7941E",
				"borderColor" : "#F7941E",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			".primary-btn-48" : {
				"width" : "48%",
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#F7941E",
				"backgroundSelectedColor" : "#F7941E",
				"borderColor" : "#F7941E",
				"borderRadius" : 3.4,
				"borderWidth" : 1
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
				"borderColor" : "#F7941E",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			".secondary-btn-48" : {
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
				"borderColor" : "#F7941E",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			".tertiary-btn" : {
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
				"borderColor" : "transparent",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			".tertiary-btn-48" : {
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
				"borderColor" : "transparent",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			".tertiary-btn-50" : {
				"width" : "50%",
				"height" : 50,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#599DFF",
				"selectedColor" : "#599DFF",
				"backgroundColor" : "#FFFFFF",
				"backgroundSelectedColor" : "#FFFFFF",
				"borderColor" : "transparent",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			".btn-view" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent",
				"borderRadius" : 3.4,
				"borderWidth" : 1
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
				"borderColor" : "transparent",
				"borderRadius" : 3.4,
				"borderWidth" : 1
			},
			".nav-icon" : {
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "transparent",
				"backgroundSelectedColor" : "transparent",
				"borderColor" : "transparent",
				"borderRadius" : 3.4,
				"borderWidth" : 1
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
				"borderColor" : "#EEEEF3",
				"borderWidth" : 1,
				"borderRadius" : 15
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
				"borderColor" : "#ED1C24",
				"borderRadius" : 15
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
				"trackTintColorOn" : "#4BD763",
				"trackTintColorOff" : "#A7A7A7",
				"thumbTintColorOn" : "#FFFFFF",
				"thumbTintColorOff" : "#FFFFFF",
				"backgroundSelectedColor" : "transparent"
			},
			".optionpicker" : {
				"left" : 12,
				"right" : 12,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#000000",
				"optionPadding" : {
					"top" : 12,
					"bottom" : 12,
					"left" : 12,
					"right" : 12
				},
				"paddingLeft" : 12,
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"iconColor" : "#808285",
				"selectedIconColor" : "#009245"
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
				"iconColor" : "#808285",
				"selectedIconColor" : "#009245",
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
				"height" : 56,
				"backgroundColor" : "#EEEEF3"
			},
			".search-txt" : {
				"top" : 8,
				"bottom" : 8,
				"left" : 8,
				"right" : 8,
				"paddingLeft" : 8,
				"paddingRight" : 8,
				"height" : 40,
				"enableClearButton" : true,
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
				"selectedBackgroundColor" : "#80D3D4D3"
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
				"width" : 0,
				"height" : 0,
				"paddingLeft" : 60,
				"paddingRight" : 12,
				"bubbleParent" : false
			},
			".swipe-view-btn" : {
				"height" : "fill",
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#808285",
				"backgroundSelectedColor" : "#808285",
				"borderColor" : "transparent",
				"borderRadius" : 0,
				"borderWidth" : 0,
				"bubbleParent" : false
			},
			".swipe-view-positive-btn" : {
				"height" : "fill",
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#009245",
				"backgroundSelectedColor" : "#009245",
				"borderColor" : "transparent",
				"borderRadius" : 0,
				"borderWidth" : 0,
				"bubbleParent" : false
			},
			".swipe-view-negative-btn" : {
				"height" : "fill",
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#FFFFFF",
				"selectedColor" : "#FFFFFF",
				"backgroundColor" : "#ED1C24",
				"backgroundSelectedColor" : "#ED1C24",
				"borderColor" : "transparent",
				"borderRadius" : 0,
				"borderWidth" : 0,
				"bubbleParent" : false
			},
			".async-view" : {
				"width" : "fill"
			},
			".async-view-auto" : {
				"width" : "fill",
				"height" : "auto",
				"indicatorDict" : {
					"top" : 12,
					"bottom" : 12
				}
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
			".content-view-vgroup-with-padding" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 24,
				"right" : 24,
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-right-swt" : {
				"right" : 12
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
			".content-right-btn" : {
				"top" : 0,
				"right" : 12,
				"width" : 136,
				"height" : 48,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 12
				},
				"textAlign" : "right",
				"color" : "#599cff",
				"selectedColor" : "#599cff",
				"backgroundColor" : "transparent",
				"backgroundSelectedColor" : "transparent",
				"borderColor" : "transparent"
			},
			".content-view-with-rbtn" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 148,
				"height" : "auto"
			},
			".content-view-vgroup-with-rbtn" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 164,
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
			".content-progressbar" : {
				"top" : 12,
				"width" : "fill",
				"height" : 10
			},
			".content-progressbar-unfill" : {
				"width" : "fill",
				"height" : 8,
				"backgroundColor" : "#C4C4C4"
			},
			".content-progressbar-fill" : {
				"left" : 0,
				"width" : "fill",
				"height" : "fill",
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
				"width" : "100%",
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
				"width" : "100%",
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
				"width" : "100%",
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
				"width" : "100%",
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
				"width" : "100%",
				"height" : "auto"
			},
			".content-subtitle-positive-icon" : {
				"left" : 0,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 16
				},
				"color" : "#009344",
				"accessibilityHidden" : true
			},
			".content-subtitle-icon-description" : {
				"left" : 20,
				"right" : 0,
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
			".content-subtitle-icon-description-wrap" : {
				"left" : 20,
				"right" : 0,
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
			".content-master-view-100" : {
				"left" : 0,
				"width" : "100%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-detail-view-0" : {
				"right" : 0,
				"width" : "0%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-master-view-75" : {
				"left" : 0,
				"width" : "75%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-detail-view-25" : {
				"right" : 0,
				"width" : "25%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-master-view-70" : {
				"left" : 0,
				"width" : "70%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-detail-view-30" : {
				"right" : 0,
				"width" : "30%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-master-view-65" : {
				"left" : 0,
				"width" : "65%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-detail-view-35" : {
				"right" : 0,
				"width" : "35%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-master-view-60" : {
				"left" : 0,
				"width" : "60%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-detail-view-40" : {
				"right" : 0,
				"width" : "40%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-master-view-55" : {
				"left" : 0,
				"width" : "55%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-detail-view-45" : {
				"right" : 0,
				"width" : "45%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-master-view-50" : {
				"left" : 0,
				"width" : "50%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-detail-view-50" : {
				"right" : 0,
				"width" : "50%",
				"height" : "auto",
				"layout" : "vertical"
			},
			".content-detail-secondary-btn" : {
				"right" : 0,
				"height" : 40,
				"width" : 90,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"color" : "#F7941E",
				"selectedColor" : "#F7941E",
				"backgroundColor" : "#FFFFFF",
				"backgroundSelectedColor" : "#FFFFFF",
				"borderColor" : "#F7941E",
				"borderRadius" : 3.4,
				"borderWidth" : 1,
				"bubbleParent" : false
			},
			".content-detail-title" : {
				"left" : 8,
				"right" : 0,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "right",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-subtitle" : {
				"top" : 0,
				"left" : 8,
				"right" : 0,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "right",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-inactive-title" : {
				"left" : 8,
				"right" : 0,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#A6A8AB",
				"textAlign" : "right",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-inactive-subtitle" : {
				"top" : 0,
				"left" : 8,
				"right" : 0,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#A6A8AB",
				"textAlign" : "right",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-positive-title" : {
				"left" : 8,
				"right" : 0,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "right",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-positive-subtitle" : {
				"top" : 0,
				"left" : 8,
				"right" : 0,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "right",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-negative-title" : {
				"left" : 8,
				"right" : 0,
				"height" : 22,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#ED1C24",
				"textAlign" : "right",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-negative-subtitle" : {
				"top" : 0,
				"left" : 8,
				"right" : 0,
				"height" : 19,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#ED1C24",
				"textAlign" : "right",
				"ellipsize" : true,
				"wordWrap" : false
			},
			".content-detail-icon-view" : {
				"left" : 8,
				"right" : 0,
				"height" : "auto"
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
				"left" : 16,
				"right" : 0,
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
			".content-detail-negative-icon" : {
				"left" : 0,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 12
				},
				"color" : "#ED1C24",
				"accessibilityHidden" : true
			},
			".content-detail-negative-icon-description" : {
				"left" : 16,
				"right" : 0,
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
			".content-header-right-icon" : {
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
			".content-header-lbl-with-ricon" : {
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
			".content-header-right-btn" : {
				"right" : 4,
				"width" : 140,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 12
				},
				"textAlign" : "right",
				"color" : "#599cff",
				"selectedColor" : "#599cff",
				"backgroundColor" : "transparent",
				"backgroundSelectedColor" : "transparent",
				"borderColor" : "transparent"
			},
			".content-header-lbl-with-rbtn" : {
				"top" : 12,
				"left" : 12,
				"right" : 148,
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
				"layout" : "horizontal",
				"horizontalWrap" : false
			},
			".content-group-prompt-40" : {
				"top" : 0,
				"left" : 0,
				"height" : "auto",
				"width" : "40%",
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#5b5b5b",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-group-reply-60" : {
				"top" : 0,
				"left" : 0,
				"height" : "auto",
				"width" : "60%",
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 14
				},
				"color" : "#000000",
				"textAlign" : "left",
				"ellipsize" : false,
				"wordWrap" : true
			},
			".content-group-prompt" : {
				"top" : 0,
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
				"top" : 0,
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
				"top" : 0,
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
			".h-divider[platform=ios]" : {
				"width" : "fill",
				"height" : 0.5,
				"backgroundColor" : "#D4D4D4",
				"bubbleParent" : false,
				"touchEnabled" : false
			},
			".h-divider[platform=android]" : {
				"width" : "fill",
				"height" : 1,
				"backgroundColor" : "#D4D4D4",
				"bubbleParent" : false,
				"touchEnabled" : false
			},
			".v-divider[platform=ios]" : {
				"width" : 0.5,
				"height" : 0,
				"backgroundColor" : "#D4D4D4",
				"bubbleParent" : false,
				"touchEnabled" : false
			},
			".v-divider[platform=android]" : {
				"width" : 1,
				"height" : 0,
				"backgroundColor" : "#D4D4D4",
				"bubbleParent" : false,
				"touchEnabled" : false
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
				"textAlign" : "center",
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
			".tooltip" : {
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
			".content-tooltip" : {
				"width" : 140,
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
				"backgroundColor" : "#6D6E70"
			},
			".content-negative-tooltip" : {
				"width" : 140,
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
			".attributed-with-rswt" : {
				"left" : 12,
				"right" : 80,
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
