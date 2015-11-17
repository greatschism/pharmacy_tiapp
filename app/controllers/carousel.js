var args = arguments[0] || {},
    navigationHandler = require("navigationHandler"),
    currentId = "appImg",
    statusObj = {},
    viewsCount = 4;

function init() {
	$.loader.show();
	var bottom = $.uihelper.getHeightFromChildren($.footerView, true);
	$.scrollableView.bottom = bottom;
	$.pagingControl.getView().bottom = bottom + $.createStyle({
		classes : ["margin-bottom"]
	}).bottom;
	$.uihelper.getImage("logo", $.logoImg);
	applyImages($.appImg, "app", 81);
	applyImages($.prescImg, "prescriptions", 130);
	applyImages($.refillImg, "refill", 195);
	applyImages($.remindersImg, "reminders", 69);
	applyImages($.familyCareImg, "family_care", 100);
	$.utilities.setProperty(Alloy.CFG.first_launch_app, false, "bool", false);
}

function applyImages(imgView, fld, count) {
	var imgPrefix = "/images/series/" + fld + "/layer_",
	    imgSuffix = ".png",
	    images = [];
	for (var i = 1; i <= count; i++) {
		images.push(imgPrefix + i + imgSuffix);
	}
	imgView.setImages(images);
}

function didLoad(e) {
	var source = e.source,
	    id = source.id;
	source.removeEventListener("load", didLoad);
	/**
	 * start the current animation
	 * once loaded
	 */
	if (id === currentId) {
		//already started
		statusObj[id] = 2;
		$.loader.hide(false);
		$[currentId].start();
	} else {
		//ready to start
		statusObj[id] = 1;
	}
}

function didScrollend(e) {
	var currentPage = e.currentPage;
	$.pagingControl.setCurrentPage(currentPage);
	startOrStopAnimation(currentPage);
}

function didChangePager(e) {
	//scroll end will be triggered as result of this
	$.scrollableView.scrollToView(e.currentPage);
}

function startOrStopAnimation(currentPage) {
	//if already started
	if (statusObj[currentId] === 2) {
		$[currentId].pause();
		$[currentId].setImage(_.last($[currentId].getImages()));
		statusObj[currentId] = 3;
	}
	currentId = $.scrollableView.getViews()[currentPage].getChildren()[1].id;
	//if ready to start
	if (statusObj[currentId] === 1) {
		//started now
		statusObj[currentId] = 2;
		$.loader.hide(false);
		$[currentId].start();
	} else if (statusObj[currentId] === 3) {
		//already completed
		$.loader.hide(false);
	} else {
		//when 0 - not ready yet
		$.loader.show();
	}
	//update title if this is last
	if (currentPage === viewsCount) {
		$.submitBtn.title = $.strings.carouselBtnStart;
	} else if ($.submitBtn.title === $.strings.carouselBtnStart) {
		//update title back to next
		$.submitBtn.title = $.strings.carouselBtnNext;
	}
}

function didClickNext(e) {
	var currentPage = $.scrollableView.currentPage;
	if (currentPage < viewsCount) {
		currentPage++;
		//scroll end will be triggered as result of this
		$.scrollableView.scrollToView(currentPage);
	} else {
		$.app.navigator.open({
			ctrl : "register"
		});
	}
}

function didClickSkip(e) {
	navigationHandler.navigate(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

exports.init = init;
