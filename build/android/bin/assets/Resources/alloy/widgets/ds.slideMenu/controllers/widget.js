function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "ds.slideMenu/" + s : s.substring(0, index) + "/ds.slideMenu/" + s.substring(index + 1);
    return true && 0 !== path.indexOf("/") ? "/" + path : path;
}

function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    new (require("alloy/widget"))("ds.slideMenu");
    this.__widgetId = "ds.slideMenu";
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "widget";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.containerview = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        id: "containerview"
    });
    $.__views.containerview && $.addTopLevelView($.__views.containerview);
    $.__views.leftMenu = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        top: "0",
        left: "0",
        width: "250",
        zIndex: "2",
        backgroundColor: Alloy.Globals.client,
        id: "leftMenu"
    });
    $.__views.containerview.add($.__views.leftMenu);
    $.__views.headerView = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        id: "headerView"
    });
    $.__views.leftMenu.add($.__views.headerView);
    $.__views.leftTableView = Ti.UI.createTableView({
        backgroundColor: "transparent",
        width: "100%",
        height: Ti.UI.FILL,
        id: "leftTableView"
    });
    $.__views.leftMenu.add($.__views.leftTableView);
    $.__views.movableview = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        left: "0",
        zIndex: "3",
        width: Ti.Platform.displayCaps.platformWidth,
        id: "movableview"
    });
    $.__views.containerview.add($.__views.movableview);
    $.__views.shadowview = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        shadowColor: "black",
        shadowOffset: {
            x: "0",
            y: "0"
        },
        shadowRadius: "2.5",
        id: "shadowview"
    });
    $.__views.movableview.add($.__views.shadowview);
    $.__views.navview = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        top: "0",
        left: "0",
        width: Ti.Platform.displayCaps.platformWidth,
        height: "44",
        backgroundColor: Alloy.Globals.client,
        id: "navview"
    });
    $.__views.shadowview.add($.__views.navview);
    $.__views.leftButton = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        backgroundImage: "/ds.slideMenu/ButtonMenu.png",
        left: "10",
        top: "10",
        width: "31",
        height: "24",
        style: "none",
        id: "leftButton"
    });
    $.__views.navview.add($.__views.leftButton);
    $.__views.logo = Ti.UI.createImageView({
        preventDefaultImage: true,
        height: 34,
        top: 5,
        width: Ti.UI.SIZE,
        image: "/images/logo_header.png",
        id: "logo"
    });
    $.__views.navview.add($.__views.logo);
    $.__views.navtitle = Ti.UI.createLabel({
        id: "navtitle",
        visible: "false",
        color: "#fff"
    });
    $.__views.navview.add($.__views.navtitle);
    $.__views.rightButton = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        backgroundImage: "/ds.slideMenu/ButtonMenu.png",
        right: "10",
        top: "10",
        width: "31",
        height: "24",
        style: "none",
        visible: false,
        id: "rightButton"
    });
    $.__views.navview.add($.__views.rightButton);
    $.__views.contentview = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        left: "0",
        width: Ti.Platform.displayCaps.platformWidth,
        height: Ti.UI.Fill,
        top: "44",
        backgroundColor: "white",
        id: "contentview"
    });
    $.__views.shadowview.add($.__views.contentview);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var animateRight = Ti.UI.createAnimation({
        left: 250,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 150
    });
    var animateReset = Ti.UI.createAnimation({
        left: 0,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 150
    });
    var animateLeft = Ti.UI.createAnimation({
        left: -250,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 150
    });
    var touchStartX = 0;
    var touchRightStarted = false;
    var touchLeftStarted = false;
    var buttonPressed = false;
    var hasSlided = false;
    var direction = "reset";
    $.movableview.addEventListener("touchstart", function(e) {
        touchStartX = e.x;
    });
    $.movableview.addEventListener("touchend", function() {
        if (buttonPressed) {
            buttonPressed = false;
            return;
        }
        if ($.movableview.left >= 150 && touchRightStarted) {
            direction = "right";
            $.leftButton.touchEnabled = false;
            $.movableview.animate(animateRight);
            hasSlided = true;
        } else if (-150 >= $.movableview.left && touchLeftStarted) {
            direction = "left";
            $.rightButton.touchEnabled = false;
            $.movableview.animate(animateLeft);
            hasSlided = true;
        } else {
            direction = "reset";
            $.leftButton.touchEnabled = true;
            $.rightButton.touchEnabled = true;
            $.movableview.animate(animateReset);
            hasSlided = false;
        }
        Ti.App.fireEvent("sliderToggled", {
            hasSlided: hasSlided,
            direction: direction
        });
        touchRightStarted = false;
        touchLeftStarted = false;
    });
    $.movableview.addEventListener("click", function() {
        if (touchRightStarted && 250 >= newLeft && newLeft >= 0 || touchLeftStarted && 0 >= newLeft && newLeft >= -250) {
            $.movableview.left = newLeft;
            $.movableview.left = 0;
        }
    });
    $.leftButton.addEventListener("touchend", function() {
        if (!touchRightStarted && !touchLeftStarted) {
            buttonPressed = true;
            $.toggleLeftSlider();
        }
    });
    $.rightButton.addEventListener("touchend", function() {
        if (!touchRightStarted && !touchLeftStarted) {
            buttonPressed = true;
            $.toggleRightSlider();
        }
    });
    exports.toggleLeftSlider = function() {
        if (hasSlided) {
            direction = "reset";
            $.leftButton.touchEnabled = true;
            $.movableview.animate(animateReset);
            hasSlided = false;
        } else {
            direction = "right";
            $.leftButton.touchEnabled = false;
            $.movableview.animate(animateRight);
            hasSlided = true;
        }
        Ti.App.fireEvent("sliderToggled", {
            hasSlided: hasSlided,
            direction: direction
        });
    };
    exports.toggleRightSlider = function() {
        if (hasSlided) {
            direction = "reset";
            $.rightButton.touchEnabled = true;
            $.movableview.animate(animateReset);
            hasSlided = false;
        } else {
            direction = "left";
            $.rightButton.touchEnabled = false;
            $.movableview.animate(animateLeft);
            hasSlided = true;
        }
        Ti.App.fireEvent("sliderToggled", {
            hasSlided: hasSlided,
            direction: direction
        });
    };
    exports.handleRotation = function() {
        $.movableview.width = $.navview.width = $.contentview.width = Ti.Platform.displayCaps.platformWidth;
        $.movableview.height = $.navview.height = $.contentview.height = Ti.Platform.displayCaps.platformHeight;
    };
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;