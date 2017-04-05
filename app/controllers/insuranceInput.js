// Arguments passed into this controller can be accessed off of the `$.args` object directly or:

var args = $.args,
    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    rx = require("rx"), 
    rxTxtHeight = 113,
     rightIconDict = $.createStyle({
	classes : ["margin-right-small", "i5", "negative-fg-color", "bg-color-disabled", "touch-enabled", "icon-unfilled-remove"],
	id : "removeBtn"
}),
     rxTxts = [$.nameView],
    apiCodes = Alloy.CFG.apiCodes,
    rightButtonDict = $.createStyle({
	classes : ["margin-right-large", "i5", "active-fg-color", "bg-color-disabled", "touch-enabled"],
}),
    rightButtonTitle = $.createStyle({
	classes : ["icon-help"],
}),
rightPwdButtonDict = $.createStyle({
	classes : ["txt-positive-right-btn","positive-fg-color"],
	title : Alloy.Globals.strings.strShow,
	width : "25%",
	backgroundColor: 'transparent'
}),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    rxContainerViewFromTop = 0,
    store = {},
    optionalValues = null;
  
     // $.vDividerView.height = $.fname.height;
function setRightIcon(iconText, iconDict) {
	// $.dob.setIcon(iconText, "right", iconDict);
	// $.dob.set
		$.lnameTxt.setIcon(iconText, "right", iconDict);
}

function didClick(e) {
	 $.trigger('close');
}



function eraseMe(e){
	alert(12);
	 $.trigger('close');
}
function setParentView(view) {
	$.dob.setParentView($.window);
}

exports.setParentView = setParentView;
exports.setRightIcon = setRightIcon;