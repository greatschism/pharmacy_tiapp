var args = $.args,
    navigationHandler = require("navigationHandler"),
    currentId = "appImg",
    statusObj = {},
    viewsCount;

function init() {
	//update paging control count
	var viewLength = $.scrollableView.views.length;
	viewsCount = viewLength - 1;
	$.pagingcontrol.setLength(viewLength);
	
	//logo - align all labels to be in sync with logo
	var fromTop = $.logoImg.top + $.logoImg.height + $.appLbl.top;
	_.each(["prescLbl", "refillLbl", "remindersLbl", "familyCareLbl"], function(val) {
		if ($[val]) {
			$[val].top = fromTop;
		}
	});
	//footer view
	var fromBottom = $.uihelper.getHeightFromChildren($.footerView, true);
	$.scrollableView.bottom = fromBottom;
	$.pagingcontrol.getView().bottom = fromBottom + $.createStyle({
		classes : ["margin-bottom-extra-large"]
	}).bottom;
	//get images list ready
	setImages($.appImg, "app", 18);
	setImages($.prescImg, "prescriptions", 23);
	Alloy.CFG.is_quick_refill_enabled && setImages($.refillImg, "refill", 28);
	Alloy.CFG.is_reminders_enabled && setImages($.remindersImg, "reminders", 14);
	Alloy.CFG.is_proxy_enabled && setImages($.familyCareImg, "family_care", 23);
	//first launch flag
	$.utilities.setProperty(Alloy.CFG.first_launch_app, false, "bool", false);
}

function focus() {
	//load first set of images
	$[currentId].addEventListener("load", didLoad);
	$[currentId].images = statusObj[currentId].images;
	$.skipBtn.accessibilityValue = $.strings.accessibilityLblScreenChange;
}

function setImages(imgView, fld, count) {
	var imgPrefix = "/images/series/" + fld + "/layer_",
	    imgSuffix = ".png",
	    images = [];
	for (var i = 1; i <= count; i++) {
		images.push(imgPrefix + i + imgSuffix);
	}
	//image set ready
	statusObj[imgView.id] = {
		status : 0,
		images : images
	};
}

function didLoad(e) {
	$[currentId].removeEventListener("load", didLoad);
	$[currentId].start();
	statusObj[currentId].status = 1;
}

function didScrollend(e) {
	var currentPage = e.currentPage;
	$.pagingcontrol.setCurrentPage(currentPage);
	$.pagingcontrol.accessibilityLabel = "Page "+currentPage;
	startOrStopAnimation(currentPage);
}

function didChangePager(e) {
	//scroll end will be triggered as result of this
	$.pagingcontrol.accessibilityLabel = "Page "+currentPage;
	$.scrollableView.scrollToView(e.currentPage);

	
}

function startOrStopAnimation(currentPage) {
	var status = statusObj[currentId].status;
	if (status === 1) {
		//if already started
		$[currentId].pause();
		$[currentId].image = _.last(statusObj[currentId].images);
		statusObj[currentId].status = 2;
	} else if (status === 0) {
		//if not started yet
		$[currentId].removeEventListener("load", didLoad);
		$[currentId].images = null;
	}
	currentId = _.last($.scrollableView.getViews()[currentPage].getChildren()).id;
	status = statusObj[currentId].status;
	if (status === 0) {
		//not loaded yet
		$[currentId].addEventListener("load", didLoad);
		$[currentId].images = statusObj[currentId].images;
	}
	if (currentPage === viewsCount) {
		//update title to start if this is last
		$.submitBtn.title = $.strings.carouselBtnStart;
	} else if ($.submitBtn.title === $.strings.carouselBtnStart) {
		//update title back to next
		$.submitBtn.title = $.strings.carouselBtnNext;
	}
}

function setAccessibilityFocus(currentPageIndex){
	var moveAccessibleFocusTo = $.scrollableView.getViews()[currentPageIndex].getChildren()[0];
	$.uihelper.requestAccessibilityFocus(moveAccessibleFocusTo);
}

function didClickNext(e) {
	var currentPage = $.scrollableView.currentPage;
	if (currentPage < viewsCount) {
		currentPage++;
		//scroll end will be triggered as result of this
		$.scrollableView.scrollToView(currentPage);
		setAccessibilityFocus(currentPage);
	} else {	
		$.submitBtn.accessibilityValue = $.strings.accessibilityLblScreenChange;
	
		if(Alloy.CFG.is_proxy_enabled)
		{
			Alloy.Globals.carouselFlow = true;
 			$.app.navigator.open({
				ctrl : "register",
 			});
		} else {
			$.app.navigator.open({
				ctrl : "searchExistingPatient",
				titleid : "searchExistingPatientWelcome",
			});
		}	
 	}

}

function didClickSkip(e) {
	navigationHandler.navigate(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

exports.init = init;
exports.focus = focus;
