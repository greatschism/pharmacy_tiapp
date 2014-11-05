var win = Ti.UI.createWindow({
	backgroundColor : 'white'
});
var label = Ti.UI.createLabel();
win.add(label);
win.open();

var network = require('ti.network');
Ti.API.info("module is => " + network);
label.text = JSON.stringify(network.findInfo());