function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function nextWindow() {}
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "msiLandingPage";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.msiLandingPage = Ti.UI.createView({
        layout: "vertical",
        color: "#ffffff",
        width: Ti.UI.FILL,
        id: "msiLandingPage"
    });
    $.__views.msiLandingPage && $.addTopLevelView($.__views.msiLandingPage);
    $.__views.label = Ti.UI.createLabel({
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: "14dp"
        },
        color: "#333333",
        borderColour: "red",
        id: "label"
    });
    $.__views.msiLandingPage.add($.__views.label);
    nextWindow ? $.__views.label.addEventListener("click", nextWindow) : __defers["$.__views.label!click!nextWindow"] = true;
    $.__views.menuContainer = Ti.UI.createView({
        layout: "horizontal",
        color: "#ffffff",
        width: 280,
        top: "40%",
        id: "menuContainer"
    });
    $.__views.msiLandingPage.add($.__views.menuContainer);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    require("core");
    Ti.API.info("Row count: ");
    $.msiLandingPage.backgroundColor = args.backgroundColor || Alloy.CFG.defaults.colors.backgroundColor;
    $.label.applyProperties({
        text: args.text || "Sorry, no text",
        color: args.color || Alloy.CFG.defaults.colors.borderColor
    });
    Ti.API.info("Row count2: ");
    for (var i in args.menuItems) {
        var menuItem = Ti.UI.createLabel({
            width: 100,
            height: 100,
            text: args.menuItems[i],
            borderRadius: 10,
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
            backgroundColor: Alloy.CFG.defaults.colors.backgroundColor,
            borderColor: Alloy.CFG.defaults.colors.borderColor,
            borderWidth: 2,
            textAlign: "center",
            color: Alloy.CFG.defaults.colors.textColor
        });
        $.menuContainer.add(menuItem);
    }
    __defers["$.__views.label!click!nextWindow"] && $.__views.label.addEventListener("click", nextWindow);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;