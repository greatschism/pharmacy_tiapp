module.exports = {
	"styles" : {
		"config" : {
			"NAVIGATOR" : "hamburger",
			"DUE_FOR_REFILL_IN_DAYS" : 7,
			"RX_NUMBER" : {
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
			"SUPPORT" : {
				"call" : "1234567890",
				"email" : "support@mscripts.com"
			}
		},
		"tss" : {
			"Window" : {
				"backgroundColor" : "#FFFFFF",
				"navTintColor" : "#FFFFFF"
			},
			"ListView" : {
				"separatorColor" : "#808285"
			},
			"TableView" : {
				"separatorColor" : "#808285"
			},
			"margin_top" : {
				"top" : 12
			},
			"margin_bottom" : {
				"bottom" : 12
			},
			"margin_left" : {
				"left" : 12
			},
			"margin_right" : {
				"right" : 12
			},
			"padding_top" : {
				"top" : 12
			},
			"padding_bottom" : {
				"bottom" : 12
			},
			"padding_left" : {
				"left" : 12
			},
			"padding_right" : {
				"right" : 12
			},
			"img_padding_top" : {
				"top" : 26
			},
			"img_padding_bottom" : {
				"bottom" : 26
			},
			"img_padding_left" : {
				"left" : 100
			},
			"img_padding_right" : {
				"right" : 100
			},
			"default_height" : {
				"height" : 50
			},
			"nav" : {
				"backgroundColor" : "#F7941E"
			},
			"nav_title_lbl" : {
				"left" : "25%",
				"right" : "25%",
				"height" : 22,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "medium",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#FFFFFF"
			},
			"nav_action_container" : {
				"width" : "25%",
				"height" : "100%"
			},
			"nav_action_lbl" : {
				"height" : 19,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#FFFFFF"
			},
			"nav_action_lbl_after_icon" : {
				"height" : 17,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 12
				},
				"color" : "#FFFFFF"
			},
			"nav_icon_margin_top" : {
				"top" : 12
			},
			"nav_icon_margin_bottom" : {
				"bottom" : 12
			},
			"nav_icon_margin_left" : {
				"left" : 12
			},
			"nav_icon_margin_right" : {
				"right" : 12
			},
			"nav_icon" : {
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"textAlign" : "center",
				"color" : "#FFFFFF"
			},
			"small_icon_margin_top" : {
				"top" : 12
			},
			"small_icon_margin_bottom" : {
				"bottom" : 12
			},
			"small_icon_margin_left" : {
				"left" : 12
			},
			"small_icon_margin_right" : {
				"right" : 12
			},
			"small_icon" : {
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				}
			},
			"large_icon_margin_top" : {
				"top" : 16
			},
			"large_icon_margin_bottom" : {
				"bottom" : 16
			},
			"large_icon_margin_left" : {
				"left" : 16
			},
			"large_icon_margin_right" : {
				"right" : 16
			},
			"large_icon" : {
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 32
				}
			},
			"extra_large_icon" : {
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 64
				}
			},
			"icon_padding_top" : {
				"top" : 22
			},
			"icon_padding_bottom" : {
				"bottom" : 22
			},
			"icon_padding_left" : {
				"left" : 22
			},
			"icon_padding_right" : {
				"right" : 22
			},
			"lbl_after_icon" : {
				"height" : 22,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"textAlign" : "left",
				"color" : "#000000"
			},
			"search_view" : {
				"left" : 0,
				"right" : 0,
				"backgroundColor" : "#EEEEF4"
			},
			"search_txt" : {
				"top" : 8,
				"bottom" : 8,
				"left" : 8,
				"right" : 8,
				"height" : 30,
				"font" : {
					"fontFamily" : "light",
					"fontSize" : 14
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 16
				},
				"leftIconDict" : {
					"left" : 4,
					"color" : "#000000"
				},
				"enableClearButton" : true,
				"paddingRight" : 4,
				"clearIconDict" : {
					"right" : 4,
					"color" : "#000000"
				},
				"color" : "#000000",
				"textAlign" : "left",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#FFFFFF",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"form_group" : {
				"left" : 12,
				"right" : 12,
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808285",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"form_txta" : {
				"height" : 100,
				"font" : {
					"fontFamily" : "light",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent",
				"borderWidth" : 0
			},
			"form_txt" : {
				"height" : 50,
				"font" : {
					"fontFamily" : "light",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent",
				"borderWidth" : 0
			},
			"form_dropdown" : {
				"height" : 50,
				"font" : {
					"fontFamily" : "light",
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
				"paddingRight" : 46,
				"hintTextColor" : "#808285",
				"iconPaddingRight" : 12,
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"iconColor" : "#808285",
				"toolbarDict" : {
					"height" : 40,
					"backgroundColor" : "#EFEFF4"
				},
				"leftBtnDict" : {
					"left" : 12,
					"textAlign" : "center",
					"color" : "#000000",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightBtnDict" : {
					"right" : 12,
					"textAlign" : "center",
					"color" : "#000000",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"selectedIconColor" : "#00A14B",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent",
				"borderWidth" : 0
			},
			"txta" : {
				"left" : 12,
				"right" : 12,
				"height" : 100,
				"font" : {
					"fontFamily" : "light",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808285",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"txt" : {
				"left" : 12,
				"right" : 12,
				"height" : 50,
				"font" : {
					"fontFamily" : "light",
					"fontSize" : 17
				},
				"color" : "#000000",
				"textAlign" : "left",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808285",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"txt_right_btn" : {
				"paddingRight" : 4,
				"rightButtonDict" : {
					"right" : 8,
					"width" : 20,
					"color" : "#0095ff"
				}
			},
			"dropdown" : {
				"left" : 12,
				"right" : 12,
				"height" : 50,
				"font" : {
					"fontFamily" : "light",
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
				"paddingRight" : 46,
				"hintTextColor" : "#808285",
				"iconPaddingRight" : 12,
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"iconColor" : "#808285",
				"toolbarDict" : {
					"height" : 40,
					"backgroundColor" : "#EFEFF4"
				},
				"leftBtnDict" : {
					"left" : 12,
					"textAlign" : "center",
					"color" : "#000000",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"rightBtnDict" : {
					"right" : 12,
					"textAlign" : "center",
					"color" : "#000000",
					"backgroundColor" : "transparent",
					"borderColor" : "transparent"
				},
				"selectedIconColor" : "#00A14B",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#808285",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"swt" : {
				"disabledColor" : "#EFEFF4",
				"enabledColor" : "#4BD865"
			},
			"btn_padding_top" : {
				"top" : 14
			},
			"btn_padding_bottom" : {
				"bottom" : 14
			},
			"btn_padding_left" : {
				"left" : 14
			},
			"btn_padding_right" : {
				"right" : 14
			},
			"primary_btn" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#FFFFFF",
				"backgroundColor" : "#F7941E",
				"borderColor" : "#F7941E",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"primary_btn_small" : {
				"height" : 50,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#FFFFFF",
				"backgroundColor" : "#F7941E",
				"borderColor" : "#F7941E",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"secondary_btn" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"font" : {
					"fontFamily" : "light",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#F7941E",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#F7941E",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"secondary_btn_small" : {
				"height" : 50,
				"font" : {
					"fontFamily" : "light",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#F7941E",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "#F7941E",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"thirtiary_btn" : {
				"left" : 16,
				"right" : 16,
				"height" : 50,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#0095FF",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent",
				"borderWidth" : 0
			},
			"thirtiary_btn_small" : {
				"height" : 50,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#0095FF",
				"backgroundColor" : "#FFFFFF",
				"borderColor" : "transparent",
				"borderWidth" : 0
			},
			"option_btn" : {
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#FFFFFF",
				"backgroundColor" : "#808285",
				"borderColor" : "#808285",
				"borderWidth" : 1
			},
			"positive_option_btn" : {
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#FFFFFF",
				"backgroundColor" : "#00A14B",
				"borderColor" : "#00A14B",
				"borderWidth" : 1
			},
			"critical_option_btn" : {
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"textAlign" : "center",
				"color" : "#FFFFFF",
				"backgroundColor" : "#ED1C24",
				"borderColor" : "#ED1C24",
				"borderWidth" : 1
			},
			"option_separator" : {
				"width" : 1,
				"backgroundColor" : "#FFFFFF"
			},
			"info_view" : {
				"height" : 24,
				"backgroundColor" : "#EFEFF4",
				"borderColor" : "#EFEFF4",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"info_lbl" : {
				"left" : 4,
				"right" : 4,
				"height" : 18,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 12
				},
				"textAlign" : "center",
				"color" : "#000000"
			},
			"critical_info_view" : {
				"height" : 24,
				"backgroundColor" : "#ED1C24",
				"borderColor" : "#ED1C24",
				"borderWidth" : 1,
				"borderRadius" : 3.4
			},
			"critical_info_lbl" : {
				"left" : 4,
				"right" : 4,
				"height" : 18,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 12
				},
				"textAlign" : "center",
				"color" : "#FFFFFF"
			},
			"link_single_line" : {
				"height" : 19,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#808285",
				"boldFontFamily" : "bold",
				"boldColor" : "#0095ff"
			},
			"link_multi_line" : {
				"ellipsize" : false,
				"wordWrap" : true,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#808285",
				"boldFontFamily" : "bold",
				"boldColor" : "#0095ff"
			},
			"lbl" : {
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#000000"
			},
			"or_lbl" : {
				"width" : 50,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"textAlign" : "center",
				"color" : "#000000",
				"backgroundColor" : "#FFFFFF"
			},
			"paragraph_lbl" : {
				"left" : 12,
				"right" : 12,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"textAlign" : "left",
				"color" : "#000000"
			},
			"single_line_title_lbl" : {
				"height" : 22,
				"ellipsize" : false,
				"wordWrap" : true,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 17
				},
				"color" : "#000000"
			},
			"title_lbl" : {
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 17
				},
				"color" : "#000000"
			},
			"prompt_lbl" : {
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"color" : "#0095ff"
			},
			"answer_lbl" : {
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 14
				},
				"color" : "#000000"
			},
			"progressbar_bg" : {
				"height" : 8,
				"backgroundColor" : "#808285"
			},
			"progressbar_fg" : {
				"height" : 10,
				"backgroundColor" : "#1C75BB"
			},
			"footer_view_break" : {
				"backgroundColor" : "#808285"
			},
			"section_header_view" : {
				"height" : 40,
				"backgroundColor" : "#EFEFF4"
			},
			"section_header_lbl" : {
				"left" : 12,
				"right" : 12,
				"height" : 20,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 15
				},
				"textAlign" : "left",
				"color" : "#000000"
			},
			"list_item_view" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 12
			},
			"list_item_view_with_child" : {
				"top" : 12,
				"bottom" : 12,
				"left" : 12,
				"right" : 46
			},
			"list_item_child" : {
				"right" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"color" : "#808285"
			},
			"list_item_child_down" : {
				"right" : 12,
				"font" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"color" : "#808285"
			},
			"list_item_lbl" : {
				"height" : 22,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"color" : "#000",
				"boldFontFamily" : "bold",
				"boldColor" : "#FFFFFF"
			},
			"list_item_title_lbl" : {
				"height" : 22,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 17
				},
				"textAlign" : "left",
				"color" : "#000000",
				"boldFontFamily" : "bold",
				"boldColor" : "#FFFFFF"
			},
			"list_item_subtitle_lbl" : {
				"top" : 12,
				"height" : 19,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"textAlign" : "left",
				"color" : "#808285"
			},
			"list_item_info_lbl" : {
				"height" : 19,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"textAlign" : "right",
				"color" : "#808285"
			},
			"list_item_detail_lbl" : {
				"top" : 12,
				"height" : 19,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 14
				},
				"textAlign" : "right",
				"color" : "#000000"
			},
			"list_item_critical_info_lbl" : {
				"height" : 19,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"textAlign" : "right",
				"color" : "#ED1C24"
			},
			"list_item_critical_detail_lbl" : {
				"top" : 12,
				"height" : 19,
				"ellipsize" : true,
				"wordWrap" : false,
				"font" : {
					"fontFamily" : "bold",
					"fontSize" : 14
				},
				"textAlign" : "right",
				"color" : "#ED1C24"
			},
			"primary_color" : {
				"color" : "#F7941E"
			},
			"secondary_color" : {
				"color" : "#FFFFFF"
			},
			"success_color" : {
				"color" : "#00A14B"
			},
			"error_color" : {
				"color" : "#ED1C24"
			},
			"conditional_color" : {
				"color" : "#F6931E"
			},
			"add_color" : {
				"color" : "#599DFF"
			},
			"selected_color" : {
				"color" : "#00A14B"
			},
			"unselected_color" : {
				"color" : "#A6A8AB"
			},
			"primary_bg_color" : {
				"backgroundColor" : "#F7941E"
			},
			"tooltip_lbl" : {
				"left" : 12,
				"right" : 12,
				"ellipsize" : false,
				"wordWrap" : true,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"textAlign" : "center",
				"color" : "#FFFFFF",
				"boldFontFamily" : "bold",
				"boldColor" : "#FFFFFF"
			},
			"tooltip" : {
				"arrowDict" : {
					"color" : "#6D6E71"
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
				"backgroundColor" : "#6D6E71"
			},
			"critical_tooltip" : {
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
				"backgroundColor" : "#ED1C24"
			},
			"togglemenu" : {
				"right" : 12,
				"optionPadding" : {
					"top" : 12,
					"bottom" : 12,
					"left" : 12,
					"right" : 12
				},
				"paddingLeft" : 12,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"color" : "#000000",
				"separatorInsets" : {
					"left" : 0,
					"right" : 0
				},
				"separatorColor" : "#808285",
				"overlayDict" : {
					"backgroundColor" : "#000000",
					"opacity" : 0.4
				},
				"backgroundColor" : "#FFFFFF"
			},
			"optionpicker" : {
				"left" : 12,
				"right" : 12,
				"optionPadding" : {
					"top" : 12,
					"bottom" : 12,
					"left" : 12,
					"right" : 12
				},
				"paddingLeft" : 12,
				"font" : {
					"fontFamily" : "regular",
					"fontSize" : 14
				},
				"iconFont" : {
					"fontFamily" : "icon",
					"fontSize" : 22
				},
				"unSelectedIconColor" : "#A6A8AB",
				"selectedIconColor" : "#00A14B",
				"color" : "#000000",
				"separatorInsets" : {
					"left" : 0,
					"right" : 0
				},
				"separatorColor" : "#808285",
				"overlayDict" : {
					"backgroundColor" : "#000000",
					"opacity" : 0.4
				},
				"backgroundColor" : "#FFFFFF"
			},
			"hseparator" : {
				"height" : 1,
				"backgroundColor" : "#808285"
			},
			"vseparator" : {
				"width" : 1,
				"backgroundColor" : "#808285"
			},
			"hspacer" : {
				"width" : 12
			},
			"vspacer" : {
				"height" : 12
			},
			"paging_control" : {
				"pagerDict" : {
					"left" : 5,
					"width" : 10,
					"height" : 10,
					"backgroundColor" : "#FFFFFF",
					"borderColor" : "#808285",
					"borderWidth" : 1,
					"borderRadius" : 5
				},
				"selectedPagerDict" : {
					"left" : 5,
					"width" : 8,
					"height" : 8,
					"backgroundColor" : "#808285",
					"borderColor" : "#808285",
					"borderWidth" : 1,
					"borderRadius" : 4
				}
			},
			"logo_img" : {
				"code" : "logo"
			},
			"prescription_list_img" : {
				"code" : "prescription_list"
			},
			"helpful_medication_img" : {
				"code" : "helpful_medication"
			},
			"store_locator_img" : {
				"code" : "store_locator"
			}
		}
	}
};
