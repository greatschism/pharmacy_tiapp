function didClickCall(e){
	Ti.Platform.openURL("tel:" + Alloy.Models.appload.get("supportphone"));
}
