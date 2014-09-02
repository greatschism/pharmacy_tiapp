function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "ds.slideMenu/" + s : s.substring(0, index) + "/ds.slideMenu/" + s.substring(index + 1);
    return path;
}

module.exports = [ {
    isApi: true,
    priority: 1000.0001,
    key: "Window",
    style: {
        layout: "vertical",
        backgroundColor: "#ffffff"
    }
}, {
    isApi: true,
    priority: 1000.0003,
    key: "View",
    style: {
        layout: "vertical",
        color: "#ffffff"
    }
}, {
    isApi: true,
    priority: 1000.0004,
    key: "ScrollView",
    style: {
        layout: "vertical",
        color: "#ffffff"
    }
}, {
    isApi: true,
    priority: 1000.0005,
    key: "Label",
    style: {
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: "14dp"
        },
        color: "#333333"
    }
}, {
    isApi: true,
    priority: 1000.0006,
    key: "Button",
    style: {
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: "14dp"
        },
        height: "44dp",
        width: "100%"
    }
}, {
    isApi: true,
    priority: 1000.0007,
    key: "TableView",
    style: {
        backgroundColor: "transparent",
        width: "100%",
        height: Ti.UI.FILL
    }
}, {
    isApi: true,
    priority: 1000.0008,
    key: "TableViewRow",
    style: {
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: "14dp",
            fontWeight: "bold",
            fontStyle: "normal"
        }
    }
}, {
    isApi: true,
    priority: 1000.0009,
    key: "TextField",
    style: {
        height: "44dp",
        backgroundColor: "#ffffff",
        color: "#000000",
        paddingLeft: "10%",
        paddingRight: "10%"
    }
}, {
    isApi: true,
    priority: 1000.001,
    key: "TextArea",
    style: {
        height: "44dp",
        backgroundColor: "#ffffff",
        color: "#000000",
        paddingLeft: "10%",
        paddingRight: "10%"
    }
}, {
    isApi: true,
    priority: 1000.0011,
    key: "ImageView",
    style: {
        preventDefaultImage: true
    }
}, {
    isClass: true,
    priority: 10000.0012,
    key: "touch-disabled",
    style: {
        touchEnabled: false
    }
}, {
    isClass: true,
    priority: 10000.0013,
    key: "fullscreen",
    style: {
        fullscreen: true
    }
}, {
    isClass: true,
    priority: 10000.0014,
    key: "hideNav",
    style: {
        navBarHidden: true
    }
}, {
    isClass: true,
    priority: 10000.0015,
    key: "showNav",
    style: {
        navBarHidden: false
    }
}, {
    isClass: true,
    priority: 10000.0016,
    key: "modal",
    style: {
        modal: true
    }
}, {
    isClass: true,
    priority: 10000.0017,
    key: "hide",
    style: {
        visible: false
    }
}, {
    isClass: true,
    priority: 10000.0018,
    key: "show",
    style: {
        visible: true
    }
}, {
    isClass: true,
    priority: 10000.0019,
    key: "rounded-border-4",
    style: {
        borderRadius: "4dp",
        borderWidth: "1dp",
        borderColor: "transparent"
    }
}, {
    isClass: true,
    priority: 10000.002,
    key: "rounded-border-6",
    style: {
        borderRadius: "6dp",
        borderWidth: "1dp",
        borderColor: "transparent"
    }
}, {
    isClass: true,
    priority: 10000.0021,
    key: "rounded-border-10",
    style: {
        borderRadius: "10dp",
        borderWidth: "1dp",
        borderColor: "transparent"
    }
}, {
    isClass: true,
    priority: 10000.0022,
    key: "footer",
    style: {
        bottom: 0,
        height: "44dp",
        width: "100%"
    }
}, {
    isClass: true,
    priority: 10000.0023,
    key: "vgroup",
    style: {
        layout: "vertical"
    }
}, {
    isClass: true,
    priority: 10000.0024,
    key: "hgroup",
    style: {
        layout: "horizontal"
    }
}, {
    isClass: true,
    priority: 10000.0025,
    key: "buffer",
    style: {
        top: 10,
        left: 10,
        right: 10,
        bottom: 10
    }
}, {
    isClass: true,
    priority: 10000.0026,
    key: "top-buffer",
    style: {
        top: 10
    }
}, {
    isClass: true,
    priority: 10000.0027,
    key: "left-buffer",
    style: {
        left: 10
    }
}, {
    isClass: true,
    priority: 10000.0028,
    key: "right-buffer",
    style: {
        right: 10
    }
}, {
    isClass: true,
    priority: 10000.0029,
    key: "bottom-buffer",
    style: {
        bottom: 10
    }
}, {
    isClass: true,
    priority: 10000.003,
    key: "fill",
    style: {
        height: Ti.UI.FILL,
        width: Ti.UI.FILL
    }
}, {
    isClass: true,
    priority: 10000.0031,
    key: "span-width",
    style: {
        width: "100%",
        height: Ti.UI.SIZE
    }
}, {
    isClass: true,
    priority: 10000.0032,
    key: "span-height",
    style: {
        height: "100%",
        width: Ti.UI.SIZE
    }
}, {
    isClass: true,
    priority: 10000.0033,
    key: "size",
    style: {
        height: Ti.UI.SIZE,
        width: Ti.UI.SIZE
    }
}, {
    isClass: true,
    priority: 10000.0034,
    key: "bottom",
    style: {
        bottom: 0
    }
}, {
    isClass: true,
    priority: 10000.0035,
    key: "top",
    style: {
        top: 0
    }
}, {
    isClass: true,
    priority: 10000.0036,
    key: "right",
    style: {
        right: 0
    }
}, {
    isClass: true,
    priority: 10000.0037,
    key: "left",
    style: {
        left: 0
    }
}, {
    isClass: true,
    priority: 10000.0038,
    key: "thumbnail",
    style: {
        height: 75,
        width: 75
    }
}, {
    isClass: true,
    priority: 10000.0039,
    key: "square100",
    style: {
        height: 100,
        width: 100
    }
}, {
    isClass: true,
    priority: 10000.004,
    key: "square150",
    style: {
        height: 150,
        width: 150
    }
}, {
    isClass: true,
    priority: 10000.0041,
    key: "square200",
    style: {
        height: 200,
        width: 200
    }
}, {
    isClass: true,
    priority: 10000.0042,
    key: "square250",
    style: {
        height: 250,
        width: 250
    }
}, {
    isClass: true,
    priority: 10000.0043,
    key: "h1",
    style: {
        font: {
            fontSize: 36
        }
    }
}, {
    isClass: true,
    priority: 10000.0044,
    key: "h2",
    style: {
        font: {
            fontSize: 30
        }
    }
}, {
    isClass: true,
    priority: 10000.0045,
    key: "h3",
    style: {
        font: {
            fontSize: 24
        }
    }
}, {
    isClass: true,
    priority: 10000.0046,
    key: "h4",
    style: {
        font: {
            fontSize: 18
        }
    }
}, {
    isClass: true,
    priority: 10000.0047,
    key: "h5",
    style: {
        font: {
            fontSize: 14
        }
    }
}, {
    isClass: true,
    priority: 10000.0048,
    key: "h6",
    style: {
        font: {
            fontSize: 12
        }
    }
}, {
    isClass: true,
    priority: 10000.0049,
    key: "normal-text",
    style: {
        font: {
            fontSize: 14
        }
    }
}, {
    isClass: true,
    priority: 10000.005,
    key: "small-text",
    style: {
        font: {
            fontSize: 10
        }
    }
}, {
    isClass: true,
    priority: 10000.0051,
    key: "large-text",
    style: {
        font: {
            fontSize: 18
        }
    }
}, {
    isClass: true,
    priority: 10000.0052,
    key: "transparent",
    style: {
        opacity: .25
    }
}, {
    isClass: true,
    priority: 10000.0053,
    key: "white",
    style: {
        color: "#ffffff"
    }
}, {
    isClass: true,
    priority: 10000.0054,
    key: "black",
    style: {
        color: "#000"
    }
}, {
    isClass: true,
    priority: 10000.0055,
    key: "red",
    style: {
        color: "#ae331f"
    }
}, {
    isClass: true,
    priority: 10000.0056,
    key: "success",
    style: {
        color: "#468847",
        backgroundColor: "#dff0d8",
        borderColor: "#d6e9c6",
        border: 1
    }
}, {
    isClass: true,
    priority: 10000.0057,
    key: "error",
    style: {
        color: "#b94a48",
        backgroundColor: "#f2dede",
        borderColor: "#eed3d7",
        border: 1
    }
}, {
    isClass: true,
    priority: 10000.0058,
    key: "warn",
    style: {}
}, {
    isClass: true,
    priority: 10000.0059,
    key: "info",
    style: {
        color: "#3a87ad",
        backgroundColor: "#d9edf7",
        borderColor: "#bce8f1",
        border: 1
    }
}, {
    isClass: true,
    priority: 10000.006,
    key: "border-dark",
    style: {
        border: 6,
        borderColor: "#666"
    }
}, {
    isClass: true,
    priority: 10000.0061,
    key: "border-dark-thin",
    style: {
        border: 2,
        borderColor: "#666"
    }
}, {
    isClass: true,
    priority: 10000.0062,
    key: "border-dark-thick",
    style: {
        border: 10,
        borderColor: "#666"
    }
}, {
    isClass: true,
    priority: 10000.0063,
    key: "border-light",
    style: {
        border: 6,
        borderColor: "#ececec"
    }
}, {
    isClass: true,
    priority: 10000.0064,
    key: "border-light-thin",
    style: {
        border: 2,
        borderColor: "#ececec"
    }
}, {
    isClass: true,
    priority: 10000.0065,
    key: "border-light-thick",
    style: {
        border: 10,
        borderColor: "#ececec"
    }
}, {
    isClass: true,
    priority: 10000.0066,
    key: "black-line",
    style: {
        backgroundColor: "#000",
        width: Ti.UI.FILL,
        height: 1
    }
}, {
    isClass: true,
    priority: 10000.0067,
    key: "gray-line",
    style: {
        backgroundColor: "#9b9d9f",
        width: Ti.UI.FILL,
        height: 1
    }
}, {
    isClass: true,
    priority: 10000.0068,
    key: "white-line",
    style: {
        backgroundColor: "#ffffff",
        width: Ti.UI.FILL,
        height: 1
    }
}, {
    isId: true,
    priority: 100000.0002,
    key: "leftMenu",
    style: {
        top: "0",
        left: "0",
        width: "250",
        zIndex: "2",
        backgroundColor: Alloy.Globals.client
    }
}, {
    isId: true,
    priority: 100000.0003,
    key: "logo",
    style: {
        height: 34,
        top: 5,
        width: Ti.UI.SIZE,
        image: "/images/logo_header.png"
    }
}, {
    isId: true,
    priority: 100000.0004,
    key: "navview",
    style: {
        top: "0",
        left: "0",
        width: Ti.Platform.displayCaps.platformWidth,
        height: "44",
        backgroundColor: Alloy.Globals.client
    }
}, {
    isId: true,
    priority: 100000.0005,
    key: "movableview",
    style: {
        left: "0",
        zIndex: "3",
        width: Ti.Platform.displayCaps.platformWidth
    }
}, {
    isId: true,
    priority: 100000.0006,
    key: "contentview",
    style: {
        left: "0",
        width: Ti.Platform.displayCaps.platformWidth,
        height: Ti.UI.Fill,
        top: "44",
        backgroundColor: "white"
    }
}, {
    isId: true,
    priority: 100000.0007,
    key: "shadowview",
    style: {
        shadowColor: "black",
        shadowOffset: {
            x: "0",
            y: "0"
        },
        shadowRadius: "2.5"
    }
}, {
    isId: true,
    priority: 100000.0008,
    key: "leftButton",
    style: {
        backgroundImage: "/ds.slideMenu/ButtonMenu.png",
        left: "10",
        top: "10",
        width: "31",
        height: "24",
        style: "none"
    }
}, {
    isId: true,
    priority: 100000.0009,
    key: "rightButton",
    style: {
        backgroundImage: "/ds.slideMenu/ButtonMenu.png",
        right: "10",
        top: "10",
        width: "31",
        height: "24",
        style: "none",
        visible: false
    }
} ];