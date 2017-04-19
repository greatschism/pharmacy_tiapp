var args = $.args;

function init(){
	var url = OS_IOS ? Alloy.Models.appload.get("whatsNewIos") : Alloy.Models.appload.get("whatsNewAndroid");
	applyWebViewProperties(url);
}

function applyWebViewProperties(url){
	showLoader();
	$.webView.applyProperties({ 
		url : url,
		willHandleTouches : false,
		enableZoomControls : false
	});
	
	$.webView.addEventListener('load', function (e){
	    hideLoader();
    }); 
}

function showLoader() {
	$.loader.show();
}

function hideLoader() {
	$.loader.hide(false);
}

exports.init = init;
