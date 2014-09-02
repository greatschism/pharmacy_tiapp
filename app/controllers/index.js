/*
 * index.js
 *
 * Description:
 *
 * Author : rgupta@mscripts.com
 *
 * Date : 09th Sept 2014
 *
 *
 * Maintenance Log
 *
 * Date                                                   Author                                                                                  Changes
 * 09th Sep 2014                                          rgupta                                                                                  Initial creation (MX-1204)
 */





var App = require("core");

App.globalWindow = $.rootWindow;
App.globalWindow.open();

App.init();

config(Alloy.CFG.configurations2);

function config(_params) {
	Alloy.CFG.defaults = _params.defaults;
	if (_params.menuType == "slider") {
		App.menu = Alloy.createWidget("ds.slideMenu", _params);
		App.globalWindow.add(App.menu.getView());
	} else {
		App.Navigator.open(_params.template, {
			backgroundColor : "white",
			text : "Landing Page",
			color: "black",
			menuItems : _params.menuItems

		});

	}
}
